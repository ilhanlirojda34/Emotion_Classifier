'use client'

import { Smile, Frown, Angry, Meh, Zap, Mic, Upload, Clock } from 'lucide-react'
import { HistoryItem, EMOTIONS, EmotionKey } from '@/types/emotions'

const ICONS: Record<EmotionKey, React.ReactNode> = {
  mutlu: <Smile size={14} strokeWidth={1.5} />,
  uzgun: <Frown size={14} strokeWidth={1.5} />,
  ofkeli: <Angry size={14} strokeWidth={1.5} />,
  notr: <Meh size={14} strokeWidth={1.5} />,
  saskin: <Zap size={14} strokeWidth={1.5} />,
}

interface HistoryPanelProps {
  items: HistoryItem[]
}

function formatTime(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  }) + ' · ' + date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function HistoryPanel({ items }: HistoryPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        paddingBottom: '12px', borderBottom: '1px solid var(--border)',
      }}>
        <Clock size={13} color="rgba(255,255,255,0.3)" />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
        }}>
          Geçmiş Tahminler
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
        {items.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', flex: 1, gap: '8px', opacity: 0.2,
          }}>
            <Mic size={24} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.6,
            }}>
              Henüz tahmin yok
            </span>
          </div>
        ) : (
          [...items].reverse().map((item, i) => {
            const em = EMOTIONS[item.emotion]
            return (
              <div key={item.id} style={{
                padding: '10px 12px', borderRadius: '12px',
                background: `rgba(${hexToRgbStr(em.color)}, 0.06)`,
                border: `1px solid rgba(${hexToRgbStr(em.color)}, 0.15)`,
                display: 'flex', alignItems: 'center', gap: '10px',
                animation: i === 0 ? 'slide-in-left 0.3s ease forwards' : 'none',
              }}>
                <div style={{ color: em.color, flexShrink: 0 }}>{ICONS[item.emotion]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.1em', color: em.color, lineHeight: 1,
                  }}>
                    {em.label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: 'rgba(255,255,255,0.25)', marginTop: '3px', letterSpacing: '0.05em',
                  }}>
                    {formatTime(item.timestamp)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: em.color }}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                  <div style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {item.source === 'microphone' ? <Mic size={9} /> : <Upload size={9} />}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {items.length > 0 && (
        <div style={{
          paddingTop: '12px', borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            {items.length} TAHMİN
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            SESSION
          </span>
        </div>
      )}
    </div>
  )
}

function hexToRgbStr(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}