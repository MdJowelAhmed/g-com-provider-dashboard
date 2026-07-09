import { useMemo, useState } from 'react'
import {
  Banknote,
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  ShieldCheck,
  Ban,
  Loader2,
} from 'lucide-react'
import { Modal, message } from 'antd'
import PageHeader from '../../../components/dashboard/PageHeader'
import { useAuth } from '../../../context/AuthContext'
import {
  useGetEarningsStatsQuery,
  useGetPaymentAccountQuery,
  useWithdrawEarningsMutation,
  type PaymentAccountData,
} from '../../../redux/api/earningsPayoutApi'
import PaymentAccountModal, {
  type PaymentAccountModalMode,
} from './PaymentAccountModal'
import {
  getApiErrorMessage,
  isNotFoundError,
  type Withdrawal,
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

function formatMoney(n: number, currency = 'GHS') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
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

function maskMomoNumber(number: string) {
  if (number.length <= 4) return number
  return `${'•'.repeat(Math.max(0, number.length - 4))}${number.slice(-4)}`
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

function clampAmountInput(raw: string, max: number) {
  if (raw === '' || raw === '.') return raw
  const parsed = Number.parseFloat(raw)
  if (Number.isNaN(parsed)) return ''
  if (parsed < 0) return '0'
  if (parsed > max) {
    return Number.isInteger(max) ? String(max) : max.toFixed(2)
  }
  return raw
}

export default function WithdrawPage() {
  const { user } = useAuth()

  const {
    data: walletRes,
    isLoading: walletLoading,
    isError: walletError,
  } = useGetEarningsStatsQuery()
  const {
    data: paymentRes,
    isLoading: paymentLoading,
    isError: paymentError,
    error: paymentErr,
    refetch: refetchPaymentAccount,
  } = useGetPaymentAccountQuery()

  const wallet = walletRes?.data
  const currency = wallet?.currency || 'GHS'
  const available = wallet?.balance ?? 0
  const pending = wallet?.pendingBalance ?? 0
  const lifetimeEarnings = wallet?.totalEarnings ?? 0

  const paymentAccount = paymentRes?.data ?? null
  const paymentMissing = paymentError && isNotFoundError(paymentErr)
  const isConnected = Boolean(paymentAccount?.isActive ?? paymentAccount)
  const paymentLoadFailed = paymentError && !paymentMissing

  const [withdrawEarnings, { isLoading: isWithdrawing }] =
    useWithdrawEarningsMutation()

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [amountInput, setAmountInput] = useState('')
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountModalMode, setAccountModalMode] =
    useState<PaymentAccountModalMode>('create')

  const openConnectModal = () => {
    setAccountModalMode('create')
    setAccountModalOpen(true)
  }

  const openUpdateModal = () => {
    setAccountModalMode('update')
    setAccountModalOpen(true)
  }

  const amount = Number.parseFloat(amountInput || '0') || 0

  const validationError = useMemo(() => {
    if (!amountInput) return null
    if (Number.isNaN(amount) || amount <= 0) return 'Enter a valid amount'
    if (amount > available)
      return `Cannot exceed available balance (${formatMoney(available, currency)})`
    return null
  }, [amountInput, amount, available, currency])

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
      .reduce((s, w) => s + w.amount, 0)
    const lastPaid = withdrawals.find((w) => w.status === 'paid')
    return { thisMonthWithdrawn, lastPaid }
  }, [withdrawals])

  const canSubmit =
    isConnected &&
    amount > 0 &&
    amount <= available &&
    !validationError &&
    !isWithdrawing

  const handleAmountChange = (raw: string) => {
    setAmountInput(clampAmountInput(raw, available))
  }

  const handleWithdrawAll = () => {
    if (available <= 0) return
    setAmountInput(Number.isInteger(available) ? String(available) : available.toFixed(2))
  }

  const handleSubmit = async () => {
    if (!canSubmit || !paymentAccount) return

    try {
      const res = await withdrawEarnings({ amount }).unwrap()
      if (!res.success) {
        void message.error(res.message || 'Withdrawal failed')
        return
      }

      const withdrawal: Withdrawal = {
        id: makeId(),
        reference: makeReference(),
        amount,
        status: 'pending',
        destinationLast4: paymentAccount.momoNumber.slice(-4),
        destinationBank: paymentAccount.momoProvider,
        requestedAt: new Date().toISOString(),
      }

      setWithdrawals((prev) => [withdrawal, ...prev])
      setAmountInput('')
      void message.success(
        res.message ||
          `Withdrawal of ${formatMoney(amount, currency)} initiated · ${withdrawal.reference}`,
      )
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Failed to withdraw earnings'))
    }
  }

  const cancelWithdrawal = (w: Withdrawal) => {
    Modal.confirm({
      title: `Cancel withdrawal ${w.reference}?`,
      content: (
        <span>
          This will return <b>{formatMoney(w.amount, currency)}</b> to your available balance. Only
          pending withdrawals can be canceled.
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
      },
    })
  }

  const isLoading = walletLoading || paymentLoading

  if (!user) return null

  return (
    <div>
      <PageHeader
        title="Withdraw funds"
        description="Move your available balance to your connected Mobile Money account."
      />

      {!isConnected && !paymentLoading && !paymentLoadFailed && (
        <ConnectBanner onConnect={openConnectModal} />
      )}

      {(walletError || paymentLoadFailed) && (
        <div className="mb-5 rounded-xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          Could not load wallet or payment account. Please try again.
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <BalanceTile
              label="Available balance"
              value={formatMoney(available, currency)}
              tone="success"
              icon={<Wallet size={14} />}
              help="Ready to withdraw now"
            />
            <BalanceTile
              label="Pending balance"
              value={formatMoney(pending, currency)}
              tone="warning"
              icon={<Clock size={14} />}
              help="Not yet available"
            />
            <BalanceTile
              label="Lifetime earnings"
              value={formatMoney(lifetimeEarnings, currency)}
              tone="neutral"
              icon={<Banknote size={14} />}
              help="Total earnings to date"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-surface-border bg-surface-card p-5">
              <div className="mb-1 text-sm font-semibold text-gray-100">Withdraw amount</div>
              <p className="mb-4 text-xs text-gray-400">
                Enter any amount up to your available balance (
                {formatMoney(available, currency)}), or withdraw everything at once.
              </p>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-400">
                  {currency}
                </span>
                <input
                  type="number"
                  min={0}
                  max={available}
                  step="0.01"
                  inputMode="decimal"
                  disabled={!isConnected || available <= 0}
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="h-14 w-full rounded-lg border border-surface-border bg-surface-elevated pl-14 pr-28 text-2xl font-semibold text-gray-100 placeholder:text-gray-500 focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  disabled={!isConnected || available <= 0}
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

              <div className="mt-5 rounded-lg border border-surface-border bg-surface-elevated p-4 text-sm">
                <SummaryRow label="Available" value={formatMoney(available, currency)} />
                <SummaryRow label="Withdrawing" value={formatMoney(amount, currency)} />
                <div className="my-2 border-t border-surface-border" />
                <SummaryRow
                  label="Remaining"
                  value={formatMoney(Math.max(0, available - amount), currency)}
                  strong
                />
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isWithdrawing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowUpRight size={16} />
                )}
                {isConnected
                  ? isWithdrawing
                    ? 'Withdrawing…'
                    : `Withdraw ${amount > 0 ? formatMoney(amount, currency) : ''}`
                  : 'Connect payment account to withdraw'}
              </button>
            </div>

            <AccountCard
              account={paymentAccount}
              isConnected={isConnected}
              onConnect={openConnectModal}
              onUpdate={openUpdateModal}
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniStat
              label="This month"
              value={formatMoney(historySummary.thisMonthWithdrawn, currency)}
            />
            <MiniStat
              label="Last successful"
              value={
                historySummary.lastPaid
                  ? `${formatMoney(historySummary.lastPaid.amount, currency)} · ${formatDate(historySummary.lastPaid.completedAt ?? historySummary.lastPaid.requestedAt)}`
                  : '—'
              }
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-100">Withdrawal history</h2>
            <span className="text-xs text-gray-500">{withdrawals.length} records</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-elevated text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Requested</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        No withdrawals yet.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr
                        key={w.id}
                        className="border-b border-surface-border last:border-b-0 hover:bg-surface-elevated"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-200">
                          {w.reference}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {formatDateTime(w.requestedAt)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-100">
                          {formatMoney(w.amount, currency)}
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
        </>
      )}

      <PaymentAccountModal
        open={accountModalOpen}
        mode={accountModalMode}
        account={paymentAccount}
        onClose={() => setAccountModalOpen(false)}
        onSaved={() => {
          void refetchPaymentAccount()
        }}
      />
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

function ConnectBanner({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent-amber/40 bg-accent-amber/10 p-4 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-amber/20 text-accent-amber">
        <AlertTriangle size={16} />
      </div>
      <div className="flex-1 text-accent-amber">
        <div className="font-medium">Connect a payment account to start withdrawing</div>
        <p className="mt-0.5 text-xs text-accent-amber/80">
          Your earnings keep accruing in your balance. Link a Mobile Money account to move them out.
        </p>
      </div>
      <button
        type="button"
        onClick={onConnect}
        className="h-8 rounded-md bg-accent-amber px-3 text-xs font-semibold text-gray-900 hover:bg-accent-amber/90"
      >
        Connect Mobile Money
      </button>
    </div>
  )
}

function AccountCard({
  account,
  isConnected,
  onConnect,
  onUpdate,
}: {
  account: PaymentAccountData | null
  isConnected: boolean
  onConnect: () => void
  onUpdate: () => void
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-100">Payment account</div>
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

      {!isConnected || !account ? (
        <>
          <p className="text-sm text-gray-400">
            Connect a Mobile Money account (MTN, Vodafone, or AirtelTigo) to enable payouts.
          </p>
          <button
            type="button"
            onClick={onConnect}
            className="mt-4 flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Connect Mobile Money
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-elevated p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/10 text-brand">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-gray-100">{account.momoName}</div>
              <div className="text-xs text-gray-500">
                {maskMomoNumber(account.momoNumber)} · {account.momoProvider}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <KVRow label="Account name" value={account.momoName} />
            <KVRow label="MoMo number" value={account.momoNumber} mono />
            <KVRow label="Provider" value={account.momoProvider} />
            <KVRow
              icon={<ShieldCheck size={12} />}
              label="Status"
              value={account.isActive ? 'Active' : 'Inactive'}
            />
            <KVRow label="Connected" value={formatDate(account.createdAt)} />
          </div>

          <button
            type="button"
            onClick={onUpdate}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md border border-surface-border text-sm font-medium text-gray-100 hover:bg-surface-elevated"
          >
            Update account
          </button>
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

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={strong ? 'font-medium text-gray-100' : 'text-gray-400'}>{label}</span>
      <span
        className={
          strong ? 'text-base font-semibold text-gray-100' : 'text-gray-200'
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
