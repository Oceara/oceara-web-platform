import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oceara - Blue Carbon Platform',
  description: 'Mangrove restoration and carbon credit marketplace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

