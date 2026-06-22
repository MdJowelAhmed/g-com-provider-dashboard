import { Form, Modal } from 'antd'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import ImageUploader from '../../../components/common/ImageUploader'
import type { RolePostConfig } from '../config/rolePostConfig'
import type { Post, PostFormValues } from '../types'
import { HUB_POST_PANEL_OPTIONS, postToFormValues } from '../utils/hubPostMapping'
import { postFieldClass, postLabelClass, postTextareaClass } from './postFormFieldClasses'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  initialPost?: Post | null
  config: RolePostConfig
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: PostFormValues) => void | Promise<void>
}

function blankForm(): PostFormValues {
  return {
    itemId: '',
    panel: 'both',
    caption: '',
    media: '',
    itemPrice: '',
    startDate: '',
    endDate: '',
  }
}

export default function PostFormModal({
  open,
  mode,
  initialPost,
  config: _config,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  void _config
  const [form] = Form.useForm<PostFormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialPost) {
      form.setFieldsValue(postToFormValues(initialPost))
    } else {
      form.setFieldsValue(blankForm())
    }
  }, [open, mode, initialPost, form])

  const handleFinish = async (v: PostFormValues) => {
    await onSubmit({
      ...v,
      itemId: v.itemId.trim(),
      caption: v.caption.trim(),
      media: v.media.trim(),
      itemPrice: v.itemPrice.trim(),
      startDate: v.startDate,
      endDate: v.endDate,
    })
  }

  return (
    <Modal
      open={open}
      title={
        <span className="text-base font-semibold text-gray-100">
          {mode === 'edit' ? 'Edit post' : 'Create post'}
        </span>
      }
      onCancel={onCancel}
      footer={null}
      width={760}
      destroyOnHidden
      centered
      classNames={{ header: '!border-b !border-white/[0.06]', body: '!pt-4 !pb-2' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
          className="space-y-4"
        >
          <Form.Item
            name="itemId"
            label={<span className={postLabelClass}>Item ID</span>}
            rules={[{ required: true, message: 'Item ID is required' }]}
          >
            <input
              type="text"
              placeholder="e.g. 6a01b9436f6c4075b0dcc042"
              autoComplete="off"
              className={postFieldClass}
            />
          </Form.Item>

          <Form.Item
            name="panel"
            label={<span className={postLabelClass}>Panel</span>}
            rules={[{ required: true, message: 'Panel is required' }]}
          >
            <select className={postFieldClass}>
              {HUB_POST_PANEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item
            name="itemPrice"
            label={<span className={postLabelClass}>Item price</span>}
            rules={[
              { required: true, message: 'Price is required' },
              {
                validator(_, value) {
                  const n = Number(value)
                  if (!Number.isFinite(n) || n < 0) {
                    return Promise.reject(new Error('Enter a valid price'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <input
              type="text"
              inputMode="decimal"
              placeholder="99.99"
              autoComplete="off"
              className={postFieldClass}
            />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="startDate"
              label={<span className={postLabelClass}>Start date</span>}
              rules={[{ required: true, message: 'Start date is required' }]}
            >
              <input type="date" className={`${postFieldClass} font-mono text-[13px]`} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label={<span className={postLabelClass}>End date</span>}
              dependencies={['startDate']}
              rules={[
                { required: true, message: 'End date is required' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('startDate') as string
                    if (!value || !start) return Promise.resolve()
                    if (value <= start) {
                      return Promise.reject(new Error('End date must be after start date'))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <input type="date" className={`${postFieldClass} font-mono text-[13px]`} />
            </Form.Item>
          </div>

          <Form.Item
            name="caption"
            label={<span className={postLabelClass}>Caption</span>}
            rules={[{ required: true, message: 'Caption is required' }]}
          >
            <textarea rows={4} placeholder="Describe the offer" className={postTextareaClass} />
          </Form.Item>

          <Form.Item
            name="media"
            label={<span className={postLabelClass}>Media image</span>}
            rules={[{ required: true, message: 'Media image is required' }]}
          >
            <ImageUploader autoUpload hint="Upload an image or paste URL after upload" />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="h-10 rounded-xl border border-white/[0.1] bg-transparent px-5 text-sm font-medium text-gray-300 transition hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? undefined : { scale: 1.02 }}
              whileTap={submitting ? undefined : { scale: 0.98 }}
              className="h-10 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 ring-1 ring-brand/30 transition hover:bg-brand-hover disabled:opacity-50"
            >
              {submitting ? 'Saving…' : mode === 'edit' ? 'Save' : 'Post'}
            </motion.button>
          </div>
        </Form>
      </motion.div>
    </Modal>
  )
}
