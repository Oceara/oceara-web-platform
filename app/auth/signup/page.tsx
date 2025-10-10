'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
    address: '',
    country: 'India',
    agreeToTerms: false
  })
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otp, setOtp] = useState('')

  const roleNames = {
    landowner: 'Land Owner',
    buyer: 'Buyer',
    admin: 'Administrator'
  }

  const roleName = roleParam ? roleNames[roleParam as keyof typeof roleNames] : 'User'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to terms and conditions')
      return
    }
    // Simulate signup
    alert('Account created successfully!')
    window.location.href = `/auth/login?role=${roleParam}`
  }

  const handlePhoneSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!showOtpInput) {
      setShowOtpInput(true)
      alert('OTP sent to ' + formData.phone)
    } else {
      // Simulate OTP verification
      alert('Account created successfully!')
      window.location.href = `/auth/login?role=${roleParam}`
    }
  }

  const handleSocialSignup = (provider: string) => {
    alert(`Creating account with ${provider}...`)
    setTimeout(() => {
      if (roleParam === 'landowner') window.location.href = '/landowner'
      else if (roleParam === 'buyer') window.location.href = '/buyer'
      else window.location.href = '/'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400 mb-2">
              🌊 Oceara
            </h1>
          </Link>
          <p className="text-gray-300">
            Create your <span className="text-white font-semibold">{roleName}</span> account
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setSignupMethod('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'email'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => { setSignupMethod('phone'); setShowOtpInput(false) }}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'phone'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📱 Phone
            </button>
            <button
              onClick={() => setSignupMethod('social')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                signupMethod === 'social'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🔗 Social
            </button>
          </div>

          {/* Email Signup */}
          {signupMethod === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">
                    {roleParam === 'landowner' ? 'Farm/Organization' : roleParam === 'buyer' ? 'Company Name' : 'Organization'}
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded"
                  required
                />
                <label className="text-gray-300 text-sm">
                  I agree to the{' '}
                  <Link href="#" className="text-purple-400 hover:text-purple-300">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Phone Signup */}
          {signupMethod === 'phone' && (
            <form onSubmit={handlePhoneSignup} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                  disabled={showOtpInput}
                />
              </div>

              <div>
                <label className="block text-white mb-2 text-sm font-medium">Phone Number *</label>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                    disabled={showOtpInput}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="9876543210"
                    required
                    disabled={showOtpInput}
                  />
                </div>
              </div>

              {showOtpInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-white mb-2 text-sm font-medium">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="● ● ● ● ● ●"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => alert('OTP resent!')}
                    className="text-purple-400 text-sm mt-2 hover:text-purple-300"
                  >
                    Resend OTP
                  </button>
                </motion.div>
              )}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 rounded"
                  required
                />
                <label className="text-gray-300 text-sm">
                  I agree to the Terms & Conditions and Privacy Policy
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
              >
                {showOtpInput ? 'Verify & Create Account' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Social Signup */}
          {signupMethod === 'social' && (
            <div className="space-y-3">
              <p className="text-gray-300 text-sm text-center mb-4">
                Sign up with one click using your social account
              </p>
              
              <button
                onClick={() => handleSocialSignup('Google')}
                className="w-full py-3 bg-white hover:bg-gray-100 rounded-lg text-gray-800 font-semibold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </button>

              <button
                onClick={() => handleSocialSignup('Facebook')}
                className="w-full py-3 bg-[#1877F2] hover:bg-[#166FE5] rounded-lg text-white font-semibold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Sign up with Facebook
              </button>

              <button
                onClick={() => handleSocialSignup('GitHub')}
                className="w-full py-3 bg-[#24292e] hover:bg-[#1b1f23] rounded-lg text-white font-semibold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Sign up with GitHub
              </button>

              <button
                onClick={() => handleSocialSignup('Apple')}
                className="w-full py-3 bg-black hover:bg-gray-900 rounded-lg text-white font-semibold flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Sign up with Apple
              </button>
            </div>
          )}

          {/* Demo User Section */}
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✨</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Try Demo Mode</h4>
                <p className="text-gray-300 text-sm mb-3">
                  No signup needed! Explore all features instantly
                </p>
                <button
                  onClick={() => {
                    if (roleParam === 'landowner') window.location.href = '/landowner'
                    else if (roleParam === 'buyer') window.location.href = '/buyer'
                    else if (roleParam === 'admin') window.location.href = '/admin'
                    else window.location.href = '/'
                  }}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
                >
                  🎯 Start Demo as {roleName}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                href={`/auth/login?role=${roleParam}`}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

