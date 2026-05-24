'use client'

import { useEffect, useState } from 'react'
import { Smile, Frown, Angry, Meh, Zap } from 'lucide-react'
import { PredictionResult, EMOTIONS, EmotionKey } from '@/types/emotions'

const ICONS: Record<EmotionKey, React.ReactNode> = {
  mutlu: <Smile size={40} strokeWidth={1.5} />,
  uzgun: <Frown size={40} strokeWidth={1.5} />,
  ofkeli: <Angry size={40} strokeWidth={1.5} />,
  notr: <Meh size={40} strokeWidth={1.5} />,
  saskin: <Zap size={40} strokeWidth={1.5} />,
}

interface ResultPanelProps {
  result: PredictionResult | null
  isAnalyzing: boolean
}

function hexToRgbStr(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export default function ResultPanel({ result, isAnalyzing }: ResultPanelProps) {
  const [animatedScores, setAnimatedScores] = useState<Record<EmotionKey, number>>({
    mutlu: 0, uzgun: 0, ofkeli: 0, notr: 0, saskin: 0,
  })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!result) {
      setVisible(false)
      setAnimatedScores({ mutlu: 0, uzgun: 0, ofkeli: 0, notr: 0, saskin: 0 })
      return
    }
    setVisible(false)
    const t1 = setTimeout(() => setVisible(true), 50)
    const t2 = setTimeout(() => setAnimatedScores(result.scores), 200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [result])

  const emotionOrder: EmotionKey[] = result
    ? ([result.emotion, ...(['mutlu', 'uzgun', 'ofkeli', 'notr', 'saskin'] as EmotionKey[]).filter(k => k !== result.emotion)])
    : ['mutlu', 'uzgun', 'ofkeli', 'notr', 'saskin']

  const emotion = result ? EMOTIONS[result.emotion] : null

  // Empty state
  if (!result && !isAnalyzing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)',
          textTransform: 'uppercase', marginBottom: '4px',
        }}>
          Sonuç
        </div>
        {(['mutlu', 'uzgun', 'ofkeli', 'notr', 'saskin'] as EmotionKey[]).map(key => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)',
              width: 52, textAlign: 'right', flexShrink: 0,
            }}>
              {EMOTIONS[key].label}
            </span>
            <div style={{
              flex: 1, height: 3,
              background: 'rgba(255,255,255,0.06)', borderRadius: 2,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'rgba(255,255,255,0.2)', width: 28, textAlign: 'right', flexShrink: 0,
            }}>—</span>
          </div>
        ))}
      </div>
    )
  }

  // Analyzing state
  if (isAnalyzing && !result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', marginBottom: '4px',
        }}>
          Analiz ediliyor...
        </div>
        {(['mutlu', 'uzgun', 'ofkeli', 'notr', 'saskin'] as EmotionKey[]).map((key, i) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'fade-up 0.3s ease forwards',
            animationDelay: `${i * 0.06}s`, opacity: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'rgba(255,255,255,0.35)', width: 52,
              textAlign: 'right', flexShrink: 0,
            }}>
              {EMOTIONS[key].label}
            </span>
            <div style={{
              flex: 1, height: 3,
              background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '40%',
                background: 'rgba(255,255,255,0.12)', borderRadius: 2,
                animation: 'recording-pulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.12}s`,
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Result state
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1)' : 'scale(0.95)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      {/* Winner card */}
      {result && emotion && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          marginBottom: '20px', padding: '14px 16px', borderRadius: '14px',
          background: `rgba(${hexToRgbStr(emotion.color)}, 0.1)`,
          border: `1px solid rgba(${hexToRgbStr(emotion.color)}, 0.25)`,
          boxShadow: `0 0 24px rgba(${hexToRgbStr(emotion.color)}, 0.12)`,
          overflow: 'hidden',
        }}>
          <div style={{
            color: emotion.color,
            filter: `drop-shadow(0 0 10px ${emotion.glow})`,
            flexShrink: 0,
          }}>
            {ICONS[result.emotion]}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: emotion.color,
              textShadow: `0 0 24px ${emotion.glow}`,
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {emotion.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em',
              }}>
                {(result.confidence * 100).toFixed(1)}% güven
              </span>
              {result.uncertain && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  letterSpacing: '0.1em', color: '#FFB800',
                  background: 'rgba(255,184,0,0.12)',
                  border: '1px solid rgba(255,184,0,0.3)',
                  borderRadius: '4px', padding: '1px 5px',
                  textTransform: 'uppercase',
                }}>
                  düşük güven
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confidence bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {emotionOrder.map((key, i) => {
          const em = EMOTIONS[key]
          const score = animatedScores[key] ?? 0
          const isWinner = key === result?.emotion
          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              animation: 'fade-up 0.4s ease forwards',
              animationDelay: `${0.1 + i * 0.07}s`, opacity: 0,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.08em',
                color: isWinner ? em.color : 'rgba(255,255,255,0.4)',
                width: 52, textAlign: 'right', flexShrink: 0,
                transition: 'color 0.3s ease',
                fontWeight: isWinner ? 600 : 400,
              }}>
                {em.label}
              </span>
              <div style={{
                flex: 1, height: isWinner ? 7 : 4,
                background: 'rgba(255,255,255,0.06)', borderRadius: 4,
                overflow: 'hidden', transition: 'height 0.4s ease',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(score * 100).toFixed(1)}%`,
                  background: isWinner
                    ? `linear-gradient(90deg, ${em.color}88, ${em.color})`
                    : `${em.color}44`,
                  borderRadius: 4,
                  boxShadow: isWinner ? `0 0 14px ${em.glow}` : 'none',
                  transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: isWinner ? em.color : 'rgba(255,255,255,0.35)',
                width: 32, textAlign: 'right', flexShrink: 0,
                transition: 'color 0.3s ease',
                fontWeight: isWinner ? 600 : 400,
              }}>
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
