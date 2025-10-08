import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oceara - Blue Carbon Ecosystem Platform',
  description: 'Mapping blue carbon ecosystems to accelerate climate action and protect our planet\'s future.',
  keywords: ['blue carbon', 'mangroves', 'wetlands', 'seagrass', 'carbon credits', 'blockchain', 'climate action'],
  authors: [{ name: 'Oceara Team' }],
  openGraph: {
    title: 'Oceara - Blue Carbon Ecosystem Platform',
    description: 'Mapping blue carbon ecosystems to accelerate climate action and protect our planet\'s future.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oceara - Blue Carbon Ecosystem Platform',
    description: 'Mapping blue carbon ecosystems to accelerate climate action and protect our planet\'s future.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-carbon-900 text-white min-h-screen`}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #14b8a6',
            },
          }}
        />
      </body>
    </html>
  );
}
