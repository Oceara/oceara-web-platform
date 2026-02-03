'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-white/90 font-semibold">
            <span aria-hidden>🌊</span>
            <span>Oceara</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/buyer" className="text-gray-400 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/reports" className="text-gray-400 hover:text-white transition-colors">
              Reports
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>Blue Carbon MRV &amp; Registry Platform. Measure, report, and verify mangrove restoration.</p>
          <p className="mt-1">© {currentYear} Oceara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
