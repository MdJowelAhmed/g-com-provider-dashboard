import { useEffect, useState } from 'react'
import { Form, Input, Modal, Select, message } from 'antd'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  usePaymentAccountVerifyMutation,
  useSavePaymentAccountMutation,
  useUpdatePaymentAccountMutation,
  type MomoProvider,
  type PaymentAccountData,
} from '../../../redux/api/earningsPayoutApi'
import { getApiErrorMessage, MOMO_PROVIDERS } from './withdrawTypes'

export type PaymentAccountModalMode = 'create' | 'update'

type Props = {
  open: boolean
  mode?: PaymentAccountModalMode
  account?: PaymentAccountData | null
  onClose: () => void
  onSaved?: () => void
}

type FormValues = {
  momoNumber: string
  momoProvider: MomoProvider
}

function isMomoProvider(value: string): value is MomoProvider {
  return (MOMO_PROVIDERS as readonly string[]).includes(value)
}

export default function PaymentAccountModal({
  open,
  mode = 'create',
  account,
  onClose,
  onSaved,
}: Props) {
  const isUpdate = mode === 'update'
  const [form] = Form.useForm<FormValues>()
  const [verifiedName, setVerifiedName] = useState<string | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)

  const [verifyAccount, { isLoading: isVerifying }] = usePaymentAccountVerifyMutation()
  const [saveAccount, { isLoading: isSaving }] = useSavePaymentAccountMutation()
  const [updateAccount, { isLoading: isUpdating }] = useUpdatePaymentAccountMutation()

  const isSubmitting = isSaving || isUpdating

  useEffect(() => {
    if (!open) return
    setVerifiedName(null)
    setVerificationToken(null)

    const provider =
      account?.momoProvider && isMomoProvider(account.momoProvider)
        ? account.momoProvider
        : 'MTN'

    form.setFieldsValue({
      momoNumber: isUpdate ? (account?.momoNumber ?? '') : '',
      momoProvider: isUpdate ? provider : 'MTN',
    })
  }, [open, form, isUpdate, account])

  const handleVerify = async () => {
    try {
      const values = await form.validateFields()
      const res = await verifyAccount({
        momoNumber: values.momoNumber.trim(),
        momoProvider: values.momoProvider,
      }).unwrap()

      if (!res.success || !res.data?.verificationToken) {
        void message.error(res.message || 'Verification failed')
        return
      }

      setVerifiedName(res.data.accountName)
      setVerificationToken(res.data.verificationToken)
      void message.success(res.message || 'Payment account verified')
    } catch (error) {
      void message.error(getApiErrorMessage(error, 'Failed to verify payment account'))
    }
  }

  const handleSave = async () => {
    if (!verificationToken) return
    try {
      const res = isUpdate
        ? await updateAccount({ verificationToken }).unwrap()
        : await saveAccount({ verificationToken }).unwrap()

      if (!res.success) {
        void message.error(
          res.message ||
            (isUpdate ? 'Failed to update payment account' : 'Failed to save payment account'),
        )
        return
      }

      void message.success(
        res.message ||
          (isUpdate
            ? 'Payment account updated successfully'
            : 'Payment account saved successfully'),
      )
      onSaved?.()
      onClose()
    } catch (error) {
      void message.error(
        getApiErrorMessage(
          error,
          isUpdate ? 'Failed to update payment account' : 'Failed to save payment account',
        ),
      )
    }
  }

  const handleClose = () => {
    if (isVerifying || isSubmitting) return
    onClose()
  }

  return (
    <Modal
      open={open}
      title={isUpdate ? 'Update payment account' : 'Connect payment account'}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      centered
      width={440}
    >
      <p className="mb-4 text-sm text-gray-400">
        {isUpdate
          ? 'Enter a new Mobile Money number and provider, then verify to update your payout account.'
          : 'Enter your Mobile Money number and provider to verify and link your payout account.'}
      </p>

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        disabled={!!verifiedName}
      >
        <Form.Item
          label="MoMo number"
          name="momoNumber"
          rules={[
            { required: true, message: 'Enter your MoMo number' },
            {
              pattern: /^\d{10,12}$/,
              message: 'Enter a valid phone number (10–12 digits)',
            },
          ]}
        >
          <Input placeholder="0500940955" maxLength={12} inputMode="numeric" />
        </Form.Item>

        <Form.Item
          label="MoMo provider"
          name="momoProvider"
          rules={[{ required: true, message: 'Select a provider' }]}
        >
          <Select
            options={MOMO_PROVIDERS.map((provider) => ({
              value: provider,
              label: provider,
            }))}
          />
        </Form.Item>
      </Form>

      {verifiedName ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-accent-success/30 bg-accent-success/10 p-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent-success" />
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Account name</div>
              <div className="text-sm font-semibold text-gray-100">{verifiedName}</div>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSave()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {isUpdate ? 'Update account' : 'Save account'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isVerifying}
          onClick={() => void handleVerify()}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isVerifying ? <Loader2 size={16} className="animate-spin" /> : null}
          Verify account
        </button>
      )}
    </Modal>
  )
}
