export type WithdrawalStatus =
  | 'pending'
  | 'in_transit'
  | 'paid'
  | 'failed'
  | 'canceled'

export type Withdrawal = {
  id: string
  reference: string
  amount: number
  status: WithdrawalStatus
  destinationLast4: string
  destinationBank: string
  requestedAt: string
  completedAt?: string
  failureReason?: string
}

export const MOMO_PROVIDERS = ['MTN', 'Vodafone', 'AirtelTigo'] as const

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string } }).data
    if (data?.message) return data.message
  }
  return fallback
}

export function isNotFoundError(error: unknown) {
  return (
    !!error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status: number | string }).status === 404
  )
}
