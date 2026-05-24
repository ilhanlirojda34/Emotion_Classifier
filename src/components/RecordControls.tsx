'use client'

import { Mic, Square, Upload, Loader2 } from 'lucide-react'
import { useRef } from 'react'

interface RecordControlsProps {
  isRecording: boolean
  isAnalyzing: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onFileUpload: (file: File) => void
}

export default function RecordControls({
  isRecording,
  isAnalyzing,
  onStartRecording,
  onStopRecording,
  onFileUpload,
}: RecordControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileUpload(file)
    e.target.value = ''
  }

  const isDisabled = isAnalyzing

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled || isRecording}
        style={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          border: '1px solid var(--border-bright)',
          background: 'var(--bg-glass)',
          color: isDisabled || isRecording ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDisabled || isRecording ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={e => {
          if (!isDisabled && !isRecording) {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.background = 'var(--bg-glass-hover)'
            btn.style.color = '#fff'
            btn.style.borderColor = 'rgba(255,255,255,0.25)'
          }
        }}
        onMouseLeave={e => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.background = 'var(--bg-glass)'
          btn.style.color = isDisabled || isRecording ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'
          btn.style.borderColor = 'var(--border-bright)'
        }}
        title="WAV dosyası yükle"
      >
        <Upload size={18} />
      </button>

      {/* Main record button */}
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={isDisabled}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: isRecording
            ? '2px solid #FF2D55'
            : '2px solid rgba(255,255,255,0.15)',
          background: isRecording
            ? 'rgba(255, 45, 85, 0.15)'
            : isAnalyzing
            ? 'rgba(0, 180, 255, 0.1)'
            : 'rgba(255,255,255,0.05)',
          color: isRecording ? '#FF2D55' : isAnalyzing ? '#00B4FF' : 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isRecording
            ? '0 0 30px rgba(255, 45, 85, 0.4), inset 0 0 20px rgba(255, 45, 85, 0.1)'
            : 'none',
          backdropFilter: 'blur(10px)',
          animation: isRecording ? 'recording-pulse 1.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => {
          if (!isDisabled && !isRecording) {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(255,255,255,0.35)'
            btn.style.background = 'rgba(255,255,255,0.08)'
            btn.style.color = '#fff'
          }
        }}
        onMouseLeave={e => {
          if (!isRecording) {
            const btn = e.currentTarget as HTMLButtonElement
            btn.style.borderColor = 'rgba(255,255,255,0.15)'
            btn.style.background = 'rgba(255,255,255,0.05)'
            btn.style.color = 'rgba(255,255,255,0.7)'
          }
        }}
      >
        {isAnalyzing ? (
          <Loader2 size={26} style={{ animation: 'spin-slow 1s linear infinite' }} />
        ) : isRecording ? (
          <Square size={22} fill="#FF2D55" />
        ) : (
          <Mic size={26} />
        )}
      </button>

      {/* Spacer */}
      <div style={{ width: 48, height: 48 }} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".wav,audio/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}