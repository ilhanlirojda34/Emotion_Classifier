import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EmoSense — Speech Emotion Recognition',
  description: 'Real-time Turkish speech emotion recognition. AudioCNN · 95.65% accuracy · Emo-Challenge 2026',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
