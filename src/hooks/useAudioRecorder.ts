'use client'

import { useState, useRef, useCallback } from 'react'

const SR = 22050

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const numSamples = samples.length
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)         // PCM
  view.setUint16(22, 1, true)         // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeStr(36, 'data')
  view.setUint32(40, numSamples * 2, true)

  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const pcmChunksRef = useRef<Float32Array[]>([])
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: SR,
        }
      })
      streamRef.current = stream

      const audioCtx = new AudioContext({ sampleRate: SR })
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)

      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.5
      source.connect(analyser)
      analyserRef.current = analyser
      setAnalyserNode(analyser)

      await audioCtx.audioWorklet.addModule('/pcm-processor.js')
      const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor')
      workletNodeRef.current = workletNode
      pcmChunksRef.current = []

      workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
        pcmChunksRef.current.push(e.data)
      }

      source.connect(workletNode)
      workletNode.connect(audioCtx.destination)

      startTimeRef.current = Date.now()
      setIsRecording(true)
    } catch (err) {
      console.error('Mikrofon erişim hatası:', err)
    }
  }, [])

  const stopRecording = useCallback((): Promise<{ blob: Blob; duration: number }> => {
    return new Promise((resolve) => {
      const workletNode = workletNodeRef.current
      const audioCtx = audioCtxRef.current

      if (workletNode) {
        workletNode.disconnect()
        workletNode.port.onmessage = null
      }

      const chunks = pcmChunksRef.current
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0)
      const merged = new Float32Array(totalLen)
      let offset = 0
      for (const chunk of chunks) {
        merged.set(chunk, offset)
        offset += chunk.length
      }

      const duration = (Date.now() - startTimeRef.current) / 1000
      const wavBlob = encodeWav(merged, SR)
      resolve({ blob: wavBlob, duration })

      streamRef.current?.getTracks().forEach(t => t.stop())
      audioCtx?.close()
      analyserRef.current = null
      setAnalyserNode(null)
      workletNodeRef.current = null
      pcmChunksRef.current = []
      setIsRecording(false)
    })
  }, [])

  return { isRecording, analyserNode, analyserRef, startRecording, stopRecording }
}
