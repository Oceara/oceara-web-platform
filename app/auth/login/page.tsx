'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PhoneOTPAuth from '@/components/PhoneOTPAuth'
import toast, { Toaster } from 'react-hot-toast'
import { authService, DEMO_CREDENTIALS } from '@/lib/simpleAuth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roleParam = searchParams.get('role')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone' | 'social'>('email')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const roleNames = {
    landowner: 'Land Owner',
    buyer: 'Buyer',
    admin: 'Administrator'
  }

  const roleName = roleParam ? roleNames[roleParam as keyof typeof roleNames] : 'User'

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Try simple auth first (for demo users)
      const user = authService.login(email, password)
      
      if (user) {
        // Check if role matches (if specified)
        if (roleParam && user.role !== roleParam) {
          toast.error(`This account is not a ${roleParam}. Please use the correct login page.`)
          authService.logout()
          setLoading(false)
          return
        }
        
        toast.success(`Welcome back, ${user.name}!`)
        
        // Redirect based on user's role
        setTimeout(() => {
          if (user.role === 'landowner') router.push('/landowner')
          else if (user.role === 'buyer') router.push('/buyer')
          else if (user.role === 'administrator') router.push('/admin')
          else router.push('/')
        }, 500)
        return
      }

      // If simple auth fails, try Supabase (for real users)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Update profile role if needed
      if (roleParam && data.user) {
        await supabase
          .from('profiles')
          .update({ role: roleParam })
          .eq('id', data.user.id)
      }

      toast.success('Login successful!')
      
      // Redirect based on role
      setTimeout(() => {
        if (roleParam === 'landowner') router.push('/landowner')
        else if (roleParam === 'buyer') router.push('/buyer')
        else if (roleParam === 'admin') router.push('/admin')
        else router.push('/')
      }, 500)
    } catch (error: any) {
      toast.error('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      
      // Store role in localStorage for callback handling
      if (roleParam) {
        localStorage.setItem('pending_role', roleParam)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handlePhoneSuccess = () => {
    toast.success('Phone verification successful!')
    setTimeout(() => {
      if (roleParam === 'landowner') router.push('/landowner')
      else if (roleParam === 'buyer') router.push('/buyer')
      else if (roleParam === 'admin') router.push('/admin')
      else router.push('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
              🌊 Oceara
            </h1>
          </Link>
          <p className="text-gray-300">
            Login as <span className="text-white font-semibold">{roleName}</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Tab Selector */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📧 Email
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📱 Phone
            </button>
            <button
              onClick={() => setLoginMethod('social')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                loginMethod === 'social'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🔗 Social
            </button>
          </div>

          {/* Email Login */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input type="checkbox" className="mr-2 rounded" />
                  Remember me
                </label>
                <Link href="#" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          )}

          {/* Phone Login */}
          {loginMethod === 'phone' && (
            <PhoneOTPAuth role={roleParam || 'user'} onSuccess={handlePhoneSuccess} />
          )}

          {/* Social Login */}
          {loginMethod === 'social' && (
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-gray-800 font-semibold flex items-center justify-center gap-3 transition-all ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="text-center text-gray-400 text-sm mt-4">
                <p>✨ More social login options coming soon!</p>
                <p className="text-xs mt-1">(Facebook, GitHub, Twitter, Apple)</p>
              </div>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔑</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Demo Credentials</h4>
                <p className="text-gray-300 text-xs mb-2">
                  Use these credentials to test the platform:
                </p>
                {roleParam && DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS] && (
                  <div className="bg-black/30 rounded p-2 font-mono text-xs">
                    <div className="text-blue-300">Email: {DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].email}</div>
                    <div className="text-blue-300">Password: {DEMO_CREDENTIALS[roleParam as keyof typeof DEMO_CREDENTIALS].password}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demo User Section */}
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👤</div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">Quick Demo Access</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Skip login and explore instantly (no validation)
                </p>
                <button
                  onClick={() => {
                    const role = (roleParam || 'buyer') as 'landowner' | 'buyer' | 'administrator'
                    authService.loginAsDemo(role)
                    toast.success('Logged in as demo user!')
                    
                    if (role === 'landowner') window.location.href = '/landowner'
                    else if (role === 'buyer') window.location.href = '/buyer'
                    else if (role === 'administrator') window.location.href = '/admin'
                    else window.location.href = '/'
                  }}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
                >
                  🚀 Continue as Demo {roleName}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                href={`/auth/signup?role=${roleParam}`}
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign up
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
