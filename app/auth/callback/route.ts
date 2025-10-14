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
    
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: requestUrl.href.split('?')[0] // Use the same redirect URI
        })
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('❌ Token exchange failed:', errorText)
        return NextResponse.redirect(`${origin}/auth/login?error=token_exchange_failed`)
      }

      const tokens = await tokenResponse.json()
      console.log('✅ Tokens received:', { 
        access_token: !!tokens.access_token,
        refresh_token: !!tokens.refresh_token 
      })

      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      if (!userResponse.ok) {
        console.error('❌ User info fetch failed')
        return NextResponse.redirect(`${origin}/auth/login?error=user_info_failed`)
      }

      const userInfo = await userResponse.json()
      console.log('✅ User info received:', { 
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name 
      })

      // Redirect to admin with user info
      const redirectUrl = new URL(`${origin}/admin`)
      redirectUrl.searchParams.set('google_auth', 'success')
      redirectUrl.searchParams.set('user_email', userInfo.email)
      redirectUrl.searchParams.set('user_name', userInfo.name)
      redirectUrl.searchParams.set('user_id', userInfo.id)

      return NextResponse.redirect(redirectUrl.toString())
    } catch (error) {
      console.error('❌ OAuth processing error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=processing_error`)
    }
  }

  // Default redirect
  return NextResponse.redirect(`${origin}/auth/login`)
}