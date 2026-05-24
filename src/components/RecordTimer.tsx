'use client'

import { useEffect, useState } from 'react'

interface RecordTimerProps {
  isRecording: boolean
}

export default function RecordTimer({ isRecording }: RecordTimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!isRecording) {
      setSeconds(0)
      return
    }
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isRecording])

  if (!isRecording) return null

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      animation: 'fade-up 0.3s ease forwards',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#FF2D55',
          boxShadow: '0 0 10px rgba(255,45,85,0.8)',
          animation: 'recording-pulse 1s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          fontWeight: 500,
          color: '#FF2D55',
          letterSpacing: '0.15em',
          textShadow: '0 0 20px rgba(255,45,85,0.6)',
        }}>
          {mins}:{secs}
        </span>
      </div>
      {seconds < 2 && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'rgba(255,184,0,0.7)',
          letterSpacing: '0.1em',
        }}>
          en az 2 saniye konuş
        </span>
      )}
    </div>
  )
}
