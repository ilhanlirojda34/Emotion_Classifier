import os
import tempfile
import numpy as np
import torch
import torchaudio.transforms as TAT
import librosa
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import AudioCNN

# ── Config ──────────────────────────────────────────────
SR = 22050
DURATION = 3.0
TARGET_LEN = int(SR * DURATION)
MODEL_PATH = "best_cnn_faz2.pth"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASSES = ["mutlu", "notr", "ofkeli", "uzgun", "saskin"]  # LabelEncoder sırası: Unicode sort

# ── Model yükle ─────────────────────────────────────────
model = AudioCNN(num_classes=len(CLASSES)).to(DEVICE)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
model.eval()
print(f"Model yüklendi → {DEVICE}")

# ── Transforms ──────────────────────────────────────────
mel_transform = TAT.MelSpectrogram(
    sample_rate=SR, n_fft=1024, hop_length=512,
    n_mels=128, f_min=50, f_max=8000
)
amp_to_db = TAT.AmplitudeToDB(top_db=80)

# ── FastAPI ─────────────────────────────────────────────
app = FastAPI(title="EmoSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _detect_suffix(audio_bytes: bytes) -> str:
    if audio_bytes[:4] == b'RIFF':
        return '.wav'
    if audio_bytes[:4] == b'\x1a\x45\xdf\xa3':
        return '.webm'
    if audio_bytes[:3] in (b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2'):
        return '.mp3'
    if audio_bytes[:4] == b'OggS':
        return '.ogg'
    return '.webm'


HOP_LEN = int(SR * 0.75)  # 0.75 sn kayma — %75 örtüşme


def _wav_to_spec(y: np.ndarray) -> torch.Tensor:
    y = librosa.effects.preemphasis(y, coef=0.97)
    y = y / (np.max(np.abs(y)) + 1e-9)
    waveform = torch.from_numpy(y).float().unsqueeze(0)
    spec = mel_transform(waveform)
    spec = amp_to_db(spec)
    spec = (spec + 40.0) / 40.0
    spec = spec.clamp(-1.0, 1.0)
    return spec.unsqueeze(0)  # [1, 1, 128, T]


def _rms(y: np.ndarray) -> float:
    return float(np.sqrt(np.mean(y ** 2)))


def process_audio(audio_bytes: bytes) -> list[tuple[torch.Tensor, float]]:
    suffix = _detect_suffix(audio_bytes)
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        y, _ = librosa.load(tmp_path, sr=SR, mono=True)
    finally:
        os.unlink(tmp_path)

    # Sessiz baş/son kısmı kırp
    y, _ = librosa.effects.trim(y, top_db=30)

    # Çok kısa veya sessiz kayıt → tahmin yapma
    if len(y) < SR * 0.5 or _rms(y) < 0.003:
        return []

    if len(y) < TARGET_LEN:
        y = np.pad(y, (0, TARGET_LEN - len(y)), mode="reflect")
        return [(_wav_to_spec(y), _rms(y))]

    windows = []
    start = 0
    while start + TARGET_LEN <= len(y):
        chunk = y[start:start + TARGET_LEN]
        windows.append((_wav_to_spec(chunk), _rms(chunk)))
        start += HOP_LEN

    if start < len(y):
        tail = y[len(y) - TARGET_LEN:]
        windows.append((_wav_to_spec(tail), _rms(tail)))

    return windows


@app.get("/")
def root():
    return {"status": "ok", "model": "AudioCNN", "accuracy": 0.9565}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    windows = process_audio(audio_bytes)

    if not windows:
        return {"no_speech": True, "emotion": "notr", "confidence": 0.0,
                "scores": {cls: 0.0 for cls in CLASSES}, "uncertain": False}

    with torch.no_grad():
        all_probs = []
        weights = []
        for spec, rms in windows:
            logits = model(spec.to(DEVICE))
            all_probs.append(torch.softmax(logits, dim=1)[0].cpu().numpy())
            weights.append(max(rms, 1e-6))

    weights = np.array(weights)
    weights = weights / weights.sum()
    probs = np.average(all_probs, axis=0, weights=weights)

    # Öfkeli sınıfına ceza — canlı kayıtlarda aşırı baskın çıkmasını önler
    OFKELI_IDX = CLASSES.index("ofkeli")
    probs[OFKELI_IDX] *= 0.60
    probs = probs / probs.sum()

    pred_idx = int(probs.argmax())

    confidence = float(probs[pred_idx])
    scores = {cls: float(probs[i]) for i, cls in enumerate(CLASSES)}
    return {
        "emotion": CLASSES[pred_idx],
        "confidence": confidence,
        "scores": scores,
        "uncertain": confidence < 0.45,
    }