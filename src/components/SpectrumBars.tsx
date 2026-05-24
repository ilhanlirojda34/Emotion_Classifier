'use client'

import { useEffect, useRef } from 'react'
import { EmotionKey, EMOTIONS } from '@/types/emotions'

interface SpectrumBarsProps {
  analyserNode: AnalyserNode | null
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  isRecording: boolean
  activeEmotion: EmotionKey | null
}

export default function SpectrumBars({
  analyserRef,
  isRecording,
  activeEmotion,
}: SpectrumBarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const isRecordingRef = useRef(false)
  const colorRef = useRef('#00B4FF')

  useEffect(() => { isRecordingRef.current = isRecording }, [isRecording])
  useEffect(() => {
    const emotion = activeEmotion ? EMOTIONS[activeEmotion] : null
    colorRef.current = emotion?.color ?? '#00B4FF'
  }, [activeEmotion])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 320
    const H = 64
    canvas.width = W
    canvas.height = H

    const BAR_COUNT = 48
    const BAR_WIDTH = 4
    const BAR_GAP = 2
    const totalWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP)
    const offsetX = (W - totalWidth) / 2

    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      const analyser = analyserRef.current
      const recording = isRecordingRef.current
      const color = colorRef.current

      const hexToRgb = (hex: string) => ({
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
      })
      const rgb = hexToRgb(color)

      const freqData = new Uint8Array(analyser?.frequencyBinCount ?? 128)
      if (analyser && recording) {
        analyser.getByteFrequencyData(freqData)
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        let barHeight = 0

        if (analyser && recording) {
          const idx = Math.floor((i / BAR_COUNT) * freqData.length * 0.7)
          barHeight = (freqData[idx] / 255) * H * 0.9
        } else {
          barHeight = (Math.sin(phase + i * 0.3) * 0.5 + 0.5) * H * 0.15 + 3
        }

        const x = offsetX + i * (BAR_WIDTH + BAR_GAP)
        const y = H - barHeight
        const opacity = recording ? 0.7 + (barHeight / H) * 0.3 : 0.2

        const grad = ctx.createLinearGradient(x, y, x, H)
        grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`)
        grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.3})`)
        ctx.fillStyle = grad

        if (recording && barHeight > H * 0.5) {
          ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
          ctx.shadowBlur = 8
        }

        ctx.beginPath()
        ctx.roundRect(x, y, BAR_WIDTH, barHeight, 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      phase += 0.04
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [analyserRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        opacity: isRecording ? 1 : 0.4,
        transition: 'opacity 0.4s ease',
      }}
    />
  )
}