/** Lightweight strength heuristic — swap for zxcvbn or API when wired */
export function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const capped = Math.min(4, Math.floor(score * 0.8))
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'] as const
  const label = labels[Math.min(4, capped)] ?? 'Weak'

  const barClass =
    capped <= 1
      ? 'bg-accent-danger'
      : capped === 2
        ? 'bg-accent-amber'
        : capped === 3
          ? 'bg-brand'
          : 'bg-accent-success'

  return {
    score: capped,
    label,
    barClass,
    strengthWidth: `${Math.min(100, (capped / 4) * 100)}%`,
  }
}
