/**
 * Feature flags for Blue Carbon MRV & Registry (Phase 1).
 * Advanced features (wallet, marketplace, buy/sell) only for:
 * - User role = "Super Admin" OR
 * - User ID/email in allowlist (NEXT_PUBLIC_FULL_ACCESS_EMAILS or hardcoded demo).
 */

const SUPER_ADMIN_ROLE = 'super_admin'

/** Hardcoded allowlist for demo/testing (emails or user IDs). Not for production secrets. */
const DEMO_ALLOWLIST: string[] = [
  'admin@oceara.demo',
  'superadmin@oceara.demo',
].map((e) => e.trim().toLowerCase())

function getAllowlist(): string[] {
  if (typeof window === 'undefined') return []
  const raw = process.env.NEXT_PUBLIC_FULL_ACCESS_EMAILS || ''
  const envList = raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  return [...new Set([...DEMO_ALLOWLIST, ...envList])]
}

/**
 * Returns true if the user has Super Admin role (advanced features).
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === SUPER_ADMIN_ROLE
}

/**
 * Returns true if the given email/userId is in the full-access allowlist.
 */
export function isInAdvancedAllowlist(emailOrId: string | null | undefined): boolean {
  if (!emailOrId) return false
  const allowlist = getAllowlist()
  if (allowlist.length === 0) return false
  return allowlist.includes(String(emailOrId).trim().toLowerCase())
}

/**
 * Returns true if the user can see advanced features (wallet, marketplace, buy/sell).
 * Use with current user email and role (Supabase or demo auth).
 */
export function canSeeAdvancedFeatures(
  email: string | null | undefined,
  role?: string | null
): boolean {
  if (isSuperAdmin(role)) return true
  return isInAdvancedAllowlist(email ?? undefined)
}
