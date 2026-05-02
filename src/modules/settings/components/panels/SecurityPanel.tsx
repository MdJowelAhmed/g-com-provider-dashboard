import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import {
  supportInputClass,
  supportLabelClass,
} from '../../../../components/dashboard/support/supportFieldClasses'
import { getPasswordStrength } from '../../utils/passwordStrength'
import SettingsCard from '../SettingsCard'
import SettingsPrimaryButton from '../SettingsPrimaryButton'

type Props = {
  onDirty: () => void
  onSaved: () => void
}

export default function SecurityPanel({ onDirty, onSaved }: Props) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState({ c: false, n: false, o: false })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const strength = getPasswordStrength(next)

  const save = () => {
    setErr(null)
    if (!current.trim()) {
      setErr('Enter your current password.')
      return
    }
    if (next.length < 8) {
      setErr('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setErr('New passwords do not match.')
      return
    }
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      onSaved()
      setOk(true)
      setCurrent('')
      setNext('')
      setConfirm('')
      window.setTimeout(() => setOk(false), 3200)
    }, 900)
  }

  const pwdInput = (
    id: string,
    label: string,
    value: string,
    set: (v: string) => void,
    vis: boolean,
    toggle: () => void,
    auto: string,
  ) => (
    <div className="space-y-2">
      <label htmlFor={id} className={supportLabelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={vis ? 'text' : 'password'}
          autoComplete={auto}
          value={value}
          onChange={(e) => {
            set(e.target.value)
            onDirty()
          }}
          className={`${supportInputClass} pr-11`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-300"
          aria-label={vis ? 'Hide password' : 'Show password'}
        >
          {vis ? <Eye size={17} /> : <EyeOff size={17} />}
        </button>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6"
    >
      {ok ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-accent-success/30 bg-accent-success/10 px-4 py-2 text-sm text-accent-success"
        >
          Password updated. Use your new password next time you sign in.
        </motion.p>
      ) : null}
      {err ? (
        <motion.p
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-accent-danger/35 bg-accent-danger/10 px-4 py-2 text-sm text-accent-danger"
        >
          {err}
        </motion.p>
      ) : null}

      <SettingsCard
        title="Password & security"
        description="Use a unique password you don’t reuse elsewhere."
        footer={<SettingsPrimaryButton onClick={save} loading={saving}>Update password</SettingsPrimaryButton>}
      >
        <div className="grid max-w-xl gap-5">
          {pwdInput(
            'pw-current',
            'Current password',
            current,
            setCurrent,
            show.c,
            () => setShow((s) => ({ ...s, c: !s.c })),
            'current-password',
          )}
          {pwdInput(
            'pw-new',
            'New password',
            next,
            setNext,
            show.n,
            () => setShow((s) => ({ ...s, n: !s.n })),
            'new-password',
          )}
          {next ? (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-gray-500">
                <span>Strength</span>
                <span className="font-medium text-gray-400">{strength.label}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-border">
                <motion.div
                  className={`h-full rounded-full ${strength.barClass}`}
                  initial={{ width: 0 }}
                  animate={{ width: strength.strengthWidth }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>
          ) : null}
          {pwdInput(
            'pw-confirm',
            'Confirm new password',
            confirm,
            setConfirm,
            show.o,
            () => setShow((s) => ({ ...s, o: !s.o })),
            'new-password',
          )}
          <p className="text-[11px] leading-relaxed text-gray-600">
            Password changes apply to your next login. Connect API here to enforce session revocation.
          </p>
        </div>
      </SettingsCard>
    </motion.div>
  )
}
