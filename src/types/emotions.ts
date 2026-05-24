export type EmotionKey = 'mutlu' | 'uzgun' | 'ofkeli' | 'notr' | 'saskin'

export interface EmotionConfig {
  label: string
  color: string
  glow: string
  icon: string
}

export const EMOTIONS: Record<EmotionKey, EmotionConfig> = {
  mutlu: {
    label: 'MUTLU',
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.4)',
    icon: 'Smile',
  },
  uzgun: {
    label: 'ÜZGÜN',
    color: '#00B4FF',
    glow: 'rgba(0, 180, 255, 0.4)',
    icon: 'Frown',
  },
  ofkeli: {
    label: 'ÖFKELİ',
    color: '#FF2D55',
    glow: 'rgba(255, 45, 85, 0.4)',
    icon: 'Angry',
  },
  notr: {
    label: 'NÖTR',
    color: '#C8D0E0',
    glow: 'rgba(200, 208, 224, 0.3)',
    icon: 'Meh',
  },
  saskin: {
    label: 'ŞAŞKIN',
    color: '#BF5FFF',
    glow: 'rgba(191, 95, 255, 0.4)',
    icon: 'Zap',
  },
}

export interface PredictionResult {
  emotion: EmotionKey
  confidence: number
  scores: Record<EmotionKey, number>
  uncertain?: boolean
  no_speech?: boolean
  spectrogram?: string
}

export interface HistoryItem {
  id: string
  emotion: EmotionKey
  confidence: number
  timestamp: Date
  source: 'microphone' | 'file'
}