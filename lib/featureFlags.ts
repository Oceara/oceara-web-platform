/**
 * Feature flags for Blue Carbon MRV & Registry (Phase 1).
 * Full access (wallet, marketplace, buy/sell) only for allowlisted emails.
 * Set NEXT_PUBLIC_FULL_ACCESS_EMAILS on Vercel (comma-separated) to grant yourself access.
 */

function getAllowlist(): string[] {
  if (typeof window === 'undefined') return []
  const raw = process.env.NEXT_PUBLIC_FULL_ACCESS_EMAILS || ''
  return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
}

/**
 * Returns true if the given email is in the full-access allowlist.
 * Use with current user email (Supabase or demo auth).
 */
export function canSeeAdvancedFeatures(email: string | null | undefined): boolean {
  if (!email) return false
  const allowlist = getAllowlist()
  if (allowlist.length === 0) return false
  return allowlist.includes(email.trim().toLowerCase())
}
