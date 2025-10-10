import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
}

// Initialize Firebase only once
let app: any = null
let auth: any = null

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
} catch (error) {
  console.log('Firebase initialization error - using demo mode')
}

export { auth, RecaptchaVerifier, signInWithPhoneNumber }

