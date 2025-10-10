'use client'

import './globals.css'
import { DataProvider } from '@/context/DataContext'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Oceara - Blue Carbon Ecosystem Platform | SIH 2025</title>
        <meta name="description" content="Mangrove restoration tracking & carbon credit marketplace with 3D Earth visualization" />
      </head>
      <body>
        <AuthProvider>
          <DataProvider>
            <Toaster position="top-center" />
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

