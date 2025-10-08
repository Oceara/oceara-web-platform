import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'buyer', // Default role, will be updated after role selection
            onboardingComplete: false,
          },
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }): Promise<Session> {
      if (token) {
        session.user = {
          ...session.user,
          id: token.user?.id,
          role: token.user?.role,
          onboardingComplete: token.user?.onboardingComplete,
        };
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', { user, account, profile, isNewUser });
    },
    async signOut({ session, token }) {
      console.log('User signed out:', { session, token });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

// Role-based access control
export const ROLES = {
  LANDOWNER: 'landowner',
  BUYER: 'buyer',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  [ROLES.LANDOWNER]: [
    'ecosystem:read',
    'ecosystem:create',
    'ecosystem:update',
    'carbon-credit:create',
    'carbon-credit:read',
    'carbon-credit:update',
    'verification:request',
    'dashboard:landowner',
  ],
  [ROLES.BUYER]: [
    'ecosystem:read',
    'carbon-credit:read',
    'carbon-credit:buy',
    'marketplace:read',
    'marketplace:buy',
    'dashboard:buyer',
  ],
  [ROLES.ADMIN]: [
    'ecosystem:read',
    'ecosystem:create',
    'ecosystem:update',
    'ecosystem:delete',
    'carbon-credit:read',
    'carbon-credit:create',
    'carbon-credit:update',
    'carbon-credit:delete',
    'verification:approve',
    'verification:reject',
    'user:read',
    'user:update',
    'user:delete',
    'dashboard:admin',
    'admin:all',
  ],
} as const;

export function hasPermission(userRole: Role, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission) || permissions.includes('admin:all');
}

export function requireRole(role: Role) {
  return (userRole: Role): boolean => {
    if (role === ROLES.ADMIN) {
      return userRole === ROLES.ADMIN;
    }
    if (role === ROLES.LANDOWNER) {
      return userRole === ROLES.LANDOWNER || userRole === ROLES.ADMIN;
    }
    if (role === ROLES.BUYER) {
      return userRole === ROLES.BUYER || userRole === ROLES.ADMIN;
    }
    return false;
  };
}
