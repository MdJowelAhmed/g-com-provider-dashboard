import { useMemo, useState } from 'react'
import {
  Banknote,
  Wallet,
  ArrowUpRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Ban,
} from 'lucide-react'
import { Modal, message } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import { useAuth } from '../../../context/AuthContext'
import {
  INITIAL_BALANCE,
  INITIAL_STRIPE_ACCOUNT,
  INITIAL_WITHDRAWALS,
  MAXIMUM_WITHDRAWAL,
  MINIMUM_WITHDRAWAL,
  calculateFee,
  expectedArrivalISO,
  type Balance,
  type StripeAccount,
  type Withdrawal,
  type WithdrawalSpeed,
  type WithdrawalStatus,
} from './withdrawTypes'

const STATUS_STYLE: Record<WithdrawalStatus, string> = {
  pending: 'bg-accent-amber/15 text-accent-amber',
  in_transit: 'bg-blue-500/15 text-blue-300',
  paid: 'bg-accent-success/15 text-accent-success',
  failed: 'bg-accent-danger/15 text-accent-danger',
  canceled: 'bg-gray-500/15 text-gray-300',
}

const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  pending: 'Pending',
  in_transit: 'In transit',
  paid: 'Paid',
  failed: 'Failed',
  canceled: 'Canceled',
}

const SCHEDULE_LABEL: Record<StripeAccount['schedule'], string> = {
  manual: 'Manual payouts',
  daily: 'Daily auto-payout',
  weekly: 'Weekly auto-payout',
  monthly: 'Monthly auto-payout',
}

function formatMoney(n: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function makeReference() {
  const n = Math.floor(Math.random() * 90000) + 10000
  return `WD-${n}`
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `wd_${crypto.randomUUID().slice(0, 8)}`
  }
  return `wd_${Date.now().toString(36)}`
}

export default function WithdrawPage() {
  const { user, connectStripe } = useAuth()

  const [balance, setBalance] = useState<Balance>(INITIAL_BALANCE)
  const [account] = useState<StripeAccount>(INITIAL_STRIPE_ACCOUNT)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS)
  const [amountInput, setAmountInput] = useState('')
  const [speed, setSpeed] = useState<WithdrawalSpeed>('standard')
  const [submitting, setSubmitting] = useState(false)

  const amount = Number.parseFloat(amountInput || '0') || 0
  const fee = calculateFee(amount, speed)
  const net = Math.max(0, amount - fee)

  const validationError = useMemo(() => {
    if (!amountInput) return null
    if (Number.isNaN(amount) || amount <= 0) return 'Enter a valid amount'
    if (amount < MINIMUM_WITHDRAWAL)
      return `Minimum withdrawal is ${formatMoney(MINIMUM_WITHDRAWAL)}`
    if (amount > MAXIMUM_WITHDRAWAL)
      return `Maximum per withdrawal is ${formatMoney(MAXIMUM_WITHDRAWAL)}`
    if (amount > balance.available)
      return `Exceeds available balance (${formatMoney(balance.available)})`
    return null
  }, [amountInput, amount, balance.available])

  const historySummary = useMemo(() => {
    const now = new Date()
    const thisMonthWithdrawn = withdrawals
      .filter((w) => {
        const d = new Date(w.requestedAt)
        return (
          w.status !== 'failed' &&
          w.status !== 'canceled' &&
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        )
      })
      .reduce((s, w) => s + w.net, 0)
    const feesPaid = withdrawals
      .filter((w) => w.status === 'paid')
      .reduce((s, w) => s + w.fee, 0)
    const lastPaid = withdrawals.find((w) => w.status === 'paid')
    return { thisMonthWithdrawn, feesPaid, lastPaid }
  }, [withdrawals])

  const isConnected = user?.stripeConnected ?? false

  const canSubmit =
    isConnected &&
    amount > 0 &&
    !validationError &&
    !submitting &&
    account.payoutsEnabled

  const handleWithdrawAll = () => {
    setAmountInput(balance.available.toFixed(2))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitting(true)

    const withdrawal: Withdrawal = {
      id: makeId(),
      reference: makeReference(),
      amount,
      fee,
      net,
      speed,
      status: 'pending',
      destinationLast4: account.last4,
      destinationBank: account.bankName,
      requestedAt: new Date().toISOString(),
      expectedArrival: expectedArrivalISO(speed),
    }

    setWithdrawals((prev) => [withdrawal, ...prev])
    setBalance((prev) => ({
      ...prev,
      available: prev.available - amount,
      inTransit: prev.inTransit + amount,
    }))
    setAmountInput('')
    void message.success(
      `Withdrawal of ${formatMoney(amount)} initiated · ${withdrawal.reference}`,
    )
    setTimeout(() => setSubmitting(false), 300)
  }

  const cancelWithdrawal = (w: Withdrawal) => {
    Modal.confirm({
      title: `Cancel withdrawal ${w.reference}?`,
      content: (
        <span>
          This will return <b>{formatMoney(w.amount)}</b> to your available balance. Only pending
          withdrawals can be canceled.
        </span>
      ),
      okText: 'Cancel withdrawal',
      okButtonProps: { danger: true },
      cancelText: 'Keep',
      centered: true,
      onOk: () => {
        setWithdrawals((prev) =>
          prev.map((x) => (x.id === w.id ? { ...x, status: 'canceled' } : x)),
        )
        setBalance((prev) => ({
          ...prev,
          available: prev.available + w.amount,
          inTransit: Math.max(0, prev.inTransit - w.amount),
        }))
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Withdraw funds"
        description="Move your available balance to your connected Stripe account."
      />

      {!isConnected && <ConnectStripeBanner onConnect={connectStripe} />}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BalanceTile
          label="Available"
          value={formatMoney(balance.available)}
          tone="success"
          icon={<Wallet size={14} />}
          help="Ready to withdraw now"
        />
        <BalanceTile
          label="Pending"
          value={formatMoney(balance.pending)}
          tone="warning"
          icon={<Clock size={14} />}
          help="Clears in 2–7 days"
        />
        <BalanceTile
          label="In transit"
          value={formatMoney(balance.inTransit)}
          tone="info"
          icon={<ArrowUpRight size={14} />}
          help="Being sent to your bank"
        />
        <BalanceTile
          label="Lifetime earnings"
          value={formatMoney(balance.lifetimeEarnings)}
          tone="neutral"
          icon={<Banknote size={14} />}
          help={`${formatMoney(balance.lifetimeWithdrawn)} withdrawn`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-surface-border bg-surface-card p-5">
          <div className="mb-1 text-sm font-semibold text-gray-100">Withdraw amount</div>
          <p className="mb-4 text-xs text-gray-400">
            Minimum {formatMoney(MINIMUM_WITHDRAWAL)} · Maximum {formatMoney(MAXIMUM_WITHDRAWAL)} per
            request
          </p>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-400">
              $
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              disabled={!isConnected}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="h-14 w-full rounded-lg border border-surface-border bg-surface-elevated pl-8 pr-28 text-2xl font-semibold text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="button"
              disabled={!isConnected || balance.available <= 0}
              onClick={handleWithdrawAll}
              className="absolute right-2 top-1/2 h-9 -translate-y-1/2 rounded-md border border-surface-border bg-surface-card px-3 text-xs font-medium text-gray-200 hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50"
            >
              Withdraw all
            </button>
          </div>
          {validationError && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-accent-danger">
              <AlertTriangle size={12} /> {validationError}
            </div>
          )}

          <div className="mt-5">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Payout speed
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <SpeedOption
                active={speed === 'standard'}
                disabled={!isConnected}
                onClick={() => setSpeed('standard')}
                icon={<Clock size={16} />}
                title="Standard"
                subtitle="Arrives in 2 business days"
                trailing="Free"
              />
              <SpeedOption
                active={speed === 'instant'}
                disabled={!isConnected}
                onClick={() => setSpeed('instant')}
                icon={<Zap size={16} />}
                title="Instant"
                subtitle="Arrives within 30 minutes"
                trailing="1.5% fee"
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-surface-border bg-surface-elevated p-4 text-sm">
            <SummaryRow label="Amount" value={formatMoney(amount)} />
            <SummaryRow
              label={`Fee${speed === 'instant' ? ' (1.5%)' : ''}`}
              value={fee > 0 ? `-${formatMoney(fee)}` : formatMoney(0)}
              tone={fee > 0 ? 'danger' : undefined}
            />
            <div className="my-2 border-t border-surface-border" />
            <SummaryRow label="You receive" value={formatMoney(net)} strong />
            <div className="mt-2 text-xs text-gray-400">
              Expected arrival:{' '}
              <span className="text-gray-200">
                {formatDateTime(expectedArrivalISO(speed))}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpRight size={16} />
            {isConnected ? `Withdraw ${amount > 0 ? formatMoney(amount) : ''}` : 'Connect Stripe to withdraw'}
          </button>
        </div>

        <AccountCard account={account} isConnected={isConnected} onConnect={connectStripe} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat
          label="This month"
          value={formatMoney(historySummary.thisMonthWithdrawn)}
        />
        <MiniStat
          label="Last successful"
          value={
            historySummary.lastPaid
              ? `${formatMoney(historySummary.lastPaid.net)} · ${formatDate(historySummary.lastPaid.completedAt ?? historySummary.lastPaid.requestedAt)}`
              : '—'
          }
        />
        <MiniStat
          label="Total fees paid"
          value={formatMoney(historySummary.feesPaid)}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-100">Withdrawal history</h2>
        <span className="text-xs text-gray-500">{withdrawals.length} records</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Fee</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
                <th className="px-4 py-3 font-medium">Speed</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Arrival</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                    No withdrawals yet.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-200">{w.reference}</td>
                    <td className="px-4 py-3 text-gray-300">{formatDateTime(w.requestedAt)}</td>
                    <td className="px-4 py-3 text-right text-gray-100">{formatMoney(w.amount)}</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {w.fee > 0 ? formatMoney(w.fee) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-100">
                      {formatMoney(w.net)}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-300">
                      <span className="inline-flex items-center gap-1">
                        {w.speed === 'instant' ? <Zap size={12} /> : <Clock size={12} />}
                        {w.speed}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {w.destinationBank} •• {w.destinationLast4}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-max items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[w.status]}`}
                        >
                          {statusIcon(w.status)}
                          {STATUS_LABEL[w.status]}
                        </span>
                        {w.status === 'failed' && w.failureReason && (
                          <span className="text-xs text-gray-500">{w.failureReason}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {w.completedAt
                        ? formatDate(w.completedAt)
                        : formatDate(w.expectedArrival)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {w.status === 'pending' ? (
                          <button
                            type="button"
                            title="Cancel withdrawal"
                            onClick={() => cancelWithdrawal(w)}
                            className="flex h-8 items-center gap-1 rounded-md border border-surface-border px-2 text-xs text-gray-300 hover:border-accent-danger/60 hover:text-accent-danger"
                          >
                            <Ban size={12} /> Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function statusIcon(status: WithdrawalStatus) {
  switch (status) {
    case 'paid':
      return <CheckCircle2 size={12} />
    case 'failed':
      return <XCircle size={12} />
    case 'pending':
      return <Clock size={12} />
    case 'in_transit':
      return <ArrowUpRight size={12} />
    case 'canceled':
      return <Ban size={12} />
  }
}

function ConnectStripeBanner({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-amber/20 text-accent-amber">
        <AlertTriangle size={16} />
      </div>
      <div className="flex-1 text-accent-amber">
        <div className="font-medium">Connect Stripe to start withdrawing</div>
        <p className="mt-0.5 text-xs text-accent-amber/80">
          Your earnings keep accruing in your balance. Link a Stripe account to move them to your
          bank.
        </p>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="h-8 rounded-md bg-accent-amber px-3 text-xs font-semibold text-gray-900 hover:bg-accent-amber/90"
      >
        Connect Stripe
      </button>
    </div>
  )
}

function AccountCard({
  account,
  isConnected,
  onConnect,
}: {
  account: StripeAccount
  isConnected: boolean
  onConnect: () => void
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-100">Stripe account</div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-success/15 px-2 py-0.5 text-xs font-medium text-accent-success">
            <ShieldCheck size={12} /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/15 px-2 py-0.5 text-xs font-medium text-gray-300">
            Not connected
          </span>
        )}
      </div>

      {!isConnected ? (
        <>
          <p className="text-sm text-gray-400">
            Connect Stripe to enable payouts. We support 135+ countries and multiple currencies.
          </p>
          <button
            type="button"
            onClick={onConnect}
            className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Connect Stripe
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/10 text-brand">
              <Building2 size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-100">{account.bankName}</div>
              <div className="text-xs text-gray-500">
                •••• {account.last4} · {account.accountHolder}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <KVRow
              icon={<Calendar size={12} />}
              label="Payout schedule"
              value={SCHEDULE_LABEL[account.schedule]}
            />
            {account.nextAutoPayoutDate && (
              <KVRow
                icon={<Clock size={12} />}
                label="Next auto-payout"
                value={formatDate(account.nextAutoPayoutDate)}
              />
            )}
            <KVRow
              icon={<ShieldCheck size={12} />}
              label="Verification"
              value={account.verified ? 'Verified' : 'Pending'}
            />
            <KVRow label="Currency" value={account.currency} />
            <KVRow label="Country" value={account.country} />
            <KVRow
              label="Account ID"
              value={account.accountId}
              mono
            />
          </div>

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-surface-border text-sm text-gray-200 hover:bg-surface-elevated"
          >
            Open Stripe dashboard <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  )
}

function BalanceTile({
  label,
  value,
  tone,
  icon,
  help,
}: {
  label: string
  value: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  icon: React.ReactNode
  help?: string
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: 'text-gray-100',
    success: 'text-accent-success',
    warning: 'text-accent-amber',
    danger: 'text-accent-danger',
    info: 'text-blue-300',
  }
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold ${toneClass[tone]}`}>{value}</div>
      {help && <div className="mt-0.5 text-xs text-gray-500">{help}</div>}
    </div>
  )
}

function SpeedOption({
  active,
  disabled,
  onClick,
  icon,
  title,
  subtitle,
  trailing,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  subtitle: string
  trailing: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
        active
          ? 'border-brand bg-brand/10'
          : 'border-surface-border bg-surface-elevated hover:border-gray-500'
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-md ${
            active ? 'bg-brand/20 text-brand' : 'bg-surface-card text-gray-400'
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-100">{title}</div>
          <div className="text-xs text-gray-400">{subtitle}</div>
        </div>
      </div>
      <div className="text-xs font-medium text-gray-300">{trailing}</div>
    </button>
  )
}

function SummaryRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'danger'
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={strong ? 'font-medium text-gray-100' : 'text-gray-400'}>{label}</span>
      <span
        className={
          tone === 'danger'
            ? 'text-accent-danger'
            : strong
              ? 'text-base font-semibold text-gray-100'
              : 'text-gray-200'
        }
      >
        {value}
      </span>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-card px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-100">{value}</div>
    </div>
  )
}

function KVRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        {icon}
        {label}
      </span>
      <span
        className={`truncate text-xs text-gray-200 ${mono ? 'font-mono' : ''}`}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}
