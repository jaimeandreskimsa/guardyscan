// ─── Plan Restriction Utilities ──────────────────────────────────
// NOTE: The DB enum uses BASIC, but it is displayed as "Essential" in the UI.
// FREE = Free  |  BASIC = Essential  |  PROFESSIONAL = Professional  |  ENTERPRISE = Enterprise

export type PlanKey = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'

export const PLAN_DISPLAY_NAME: Record<PlanKey, string> = {
  FREE: 'Free',
  BASIC: 'Essential',
  PROFESSIONAL: 'Professional',
  ENTERPRISE: 'Enterprise',
}

/** Plans that can use Claude AI diagnostics */
export const AI_PLANS: PlanKey[] = ['PROFESSIONAL', 'ENTERPRISE']

/** Plans that can use the Guardy Agent chat */
export const AGENT_PLANS: PlanKey[] = ['PROFESSIONAL', 'ENTERPRISE']

/** Nav paths allowed per plan. null = all paths allowed */
export const PLAN_NAV_PATHS: Record<PlanKey, string[] | null> = {
  FREE: [
    '/dashboard',
    '/dashboard/scanner',
    '/dashboard/settings',
    '/dashboard/billing',
  ],
  BASIC: [
    '/dashboard',
    '/dashboard/scanner',
    '/dashboard/siem',
    '/dashboard/vulnerabilities',
    '/dashboard/settings',
    '/dashboard/billing',
  ],
  PROFESSIONAL: [
    '/dashboard',
    '/dashboard/scanner',
    '/dashboard/siem',
    '/dashboard/vulnerabilities',
    '/dashboard/incidents',
    '/dashboard/documents',
    '/dashboard/settings',
    '/dashboard/billing',
  ],
  ENTERPRISE: null, // all routes
}

export function planHasAI(plan: string): boolean {
  return (AI_PLANS as string[]).includes(plan)
}

export function planHasAgent(plan: string): boolean {
  return (AGENT_PLANS as string[]).includes(plan)
}

export function planCanAccessPath(plan: string, path: string): boolean {
  // Use FREE as fallback only when the plan key is unknown — NOT when it's null
  // (ENTERPRISE uses null to mean "all paths allowed")
  const planKey = plan as PlanKey
  const allowed = planKey in PLAN_NAV_PATHS ? PLAN_NAV_PATHS[planKey] : PLAN_NAV_PATHS.FREE
  if (allowed === null) return true
  return allowed.some(p => {
    // Exact match always works
    if (path === p) return true
    // Prefix match only for routes deeper than /dashboard (e.g. /dashboard/scanner)
    // This prevents /dashboard from matching /dashboard/siem, /dashboard/compliance, etc.
    if (p !== '/dashboard' && path.startsWith(p + '/')) return true
    return false
  })
}

export function planDisplayName(plan: string): string {
  return PLAN_DISPLAY_NAME[plan as PlanKey] ?? plan
}
