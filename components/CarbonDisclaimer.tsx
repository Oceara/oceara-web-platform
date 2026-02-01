'use client'

/**
 * Small disclaimer shown wherever carbon/credit numbers are displayed.
 * Phase 1 MRV: values are AI-based estimates and require verification before certification.
 */
export default function CarbonDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-400 italic ${className}`}>
      Carbon values are AI-based estimates and require institutional or regulatory verification before certification.
    </p>
  )
}
