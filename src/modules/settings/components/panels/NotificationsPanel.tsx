import { motion } from 'framer-motion'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { User } from '../../../../context/AuthContext'
import { readExtra } from '../../utils/extra'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  user: User
  updateUser: (p: Partial<User>) => void
  onDirty: () => void
  onSaved: () => void
}

function parseBool(s: string) {
  return s === '1' || s === 'true'
}

function Row({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string
  desc: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.05] py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-sm font-medium text-gray-200">{title}</div>
        <p className="mt-0.5 max-w-xl text-[13px] text-gray-600">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={`relative h-8 w-[52px] shrink-0 rounded-full border transition ${
          on
            ? 'border-brand/50 bg-brand/25 shadow-[0_0_16px_-4px_rgba(160,82,45,0.55)]'
            : 'border-white/[0.08] bg-surface-elevated/80'
        }`}
      >
        <motion.span
          className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md"
          animate={{ x: on ? 22 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
        />
      </button>
    </div>
  )
}

export default function NotificationsPanel({ user, updateUser, onDirty, onSaved }: Props) {
  const [orders, setOrders] = useState(() => parseBool(readExtra(user, 'notify_orders')))
  const [payouts, setPayouts] = useState(() => parseBool(readExtra(user, 'notify_payouts')))
  const [marketing, setMarketing] = useState(() => parseBool(readExtra(user, 'notify_marketing')))
  const [security, setSecurity] = useState(() => parseBool(readExtra(user, 'notify_security')))
  const [product, setProduct] = useState(() => parseBool(readExtra(user, 'notify_product')))
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setOrders(parseBool(readExtra(user, 'notify_orders')))
    setPayouts(parseBool(readExtra(user, 'notify_payouts')))
    setMarketing(parseBool(readExtra(user, 'notify_marketing')))
    setSecurity(parseBool(readExtra(user, 'notify_security')))
    setProduct(parseBool(readExtra(user, 'notify_product')))
  }, [user])

  const flip = (set: Dispatch<SetStateAction<boolean>>) => () => {
    set((v) => !v)
    onDirty()
  }

  const save = () => {
    setSaving(true)
    window.setTimeout(() => {
      updateUser({
        extra: {
          ...user.extra,
          notify_orders: orders ? '1' : '0',
          notify_payouts: payouts ? '1' : '0',
          notify_marketing: marketing ? '1' : '0',
          notify_security: security ? '1' : '0',
          notify_product: product ? '1' : '0',
        },
      })
      setSaving(false)
      setOk(true)
      onSaved()
      window.setTimeout(() => setOk(false), 2600)
    }, 450)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <p className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success">
          Notification preferences saved.
        </p>
      ) : null}

      <SettingsCard
        title="Notification preferences"
        description="Choose what we email you about. Push alerts can be added when mobile ships."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Save preferences</SettingsPrimaryButton>}
      >
        <div className="-mx-2">
          <Row
            title="Orders & bookings"
            desc="Confirmations, cancellations, and urgent buyer messages."
            on={orders}
            onToggle={flip(setOrders)}
          />
          <Row
            title="Payouts & billing"
            desc="Transfers, failures, and Stripe account notices."
            on={payouts}
            onToggle={flip(setPayouts)}
          />
          <Row
            title="Product & tips"
            desc="Occasional product updates and best practices."
            on={product}
            onToggle={flip(setProduct)}
          />
          <Row
            title="Marketing"
            desc="Offers and webinars—you can opt out anytime."
            on={marketing}
            onToggle={flip(setMarketing)}
          />
          <Row
            title="Security alerts"
            desc="New device logins and sensitive account changes."
            on={security}
            onToggle={flip(setSecurity)}
          />
        </div>
      </SettingsCard>
    </motion.div>
  )
}
