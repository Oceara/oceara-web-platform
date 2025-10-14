import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  console.log('🔗 Google OAuth Callback received:', { code: !!code, error })

  if (error) {
    console.error('❌ Google OAuth error:', error)
    // Redirect to login page with error
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    console.log('✅ Google OAuth code received:', code.substring(0, 20) + '...')
    
    // For now, just redirect to dashboard
    // In a real implementation, you would exchange the code for tokens
    return NextResponse.redirect(`${origin}/admin?google_auth=success`)
  }

  // Default redirect
  return NextResponse.redirect(`${origin}/auth/login`)
}