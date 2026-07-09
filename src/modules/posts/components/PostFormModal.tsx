import { Form, Modal, message } from 'antd'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import ImageUploader from '../../../components/common/ImageUploader'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import type { RolePostConfig } from '../config/rolePostConfig'
import { useHubPostItemCatalog } from '../hooks/useHubPostItemCatalog'
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
  config,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<PostFormValues>()
  const [pendingMediaFile, setPendingMediaFile] = useState<File | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()

  const { itemLabel, items, isLoading: catalogLoading } = useHubPostItemCatalog(config.role)

  const itemOptions = useMemo(() => {
    const options = items.map((item) => ({
      value: item.id,
      label: item.label,
      price: item.price,
    }))

    if (mode === 'edit' && initialPost?.itemId) {
      const exists = options.some((option) => option.value === initialPost.itemId)
      if (!exists) {
        options.unshift({
          value: initialPost.itemId,
          label: `Unknown ${itemLabel.toLowerCase()} (${initialPost.itemId.slice(0, 8)}…)`,
          price: initialPost.itemPrice,
        })
      }
    }

    return options
  }, [items, mode, initialPost?.itemId, initialPost?.itemPrice, itemLabel])

  useEffect(() => {
    if (!open) {
      setPendingMediaFile(null)
      setIsUploadingMedia(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialPost) {
      setPendingMediaFile(null)
      form.setFieldsValue(postToFormValues(initialPost))
    } else {
      setPendingMediaFile(null)
      form.setFieldsValue(blankForm())
    }
  }, [open, mode, initialPost, form])

  const handleItemChange = (itemId: string) => {
    const item = itemOptions.find((entry) => entry.value === itemId)
    if (item) {
      form.setFieldValue('itemPrice', String(item.price))
    }
  }

  const handleFinish = async (v: PostFormValues) => {
    let mediaUrl = v.media?.trim() ?? ''

    if (pendingMediaFile) {
      setIsUploadingMedia(true)
      try {
        mediaUrl = await uploadImageFile(pendingMediaFile, async (payload) => {
          const result = await getPresignedUrl(payload).unwrap()
          return result
        })
        setPendingMediaFile(null)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Media upload failed.'
        message.error(errorMessage)
        return
      } finally {
        setIsUploadingMedia(false)
      }
    }

    if (!mediaUrl) {
      message.error('Please select a media file.')
      return
    }

    await onSubmit({
      ...v,
      itemId: v.itemId.trim(),
      caption: v.caption.trim(),
      media: mediaUrl,
      itemPrice: v.itemPrice.trim(),
      startDate: v.startDate,
      endDate: v.endDate,
    })
  }

  const isBusy = submitting || isUploadingMedia
  const selectPlaceholder = catalogLoading
    ? `Loading ${itemLabel.toLowerCase()}s…`
    : `Select a ${itemLabel.toLowerCase()}`

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
            label={<span className={postLabelClass}>{itemLabel}</span>}
            rules={[{ required: true, message: `Select a ${itemLabel.toLowerCase()}` }]}
          >
            <select
              className={postFieldClass}
              disabled={catalogLoading}
              onChange={(event) => handleItemChange(event.target.value)}
            >
              <option value="">{selectPlaceholder}</option>
              {itemOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
            label={<span className={postLabelClass}>Media (image/video)</span>}
            rules={[
              {
                validator: async () => {
                  const current = form.getFieldValue('media') as string | undefined
                  if (current?.trim() || pendingMediaFile) return
                  throw new Error('Media file is required')
                },
              },
            ]}
          >
            <ImageUploader
              autoUpload={false}
              allowVideo
              accept="image/*,video/*"
              hint="Image or video uploads when you post"
              onFileSelect={setPendingMediaFile}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isBusy}
              className="h-10 rounded-xl border border-white/[0.1] bg-transparent px-5 text-sm font-medium text-gray-300 transition hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isBusy}
              whileHover={isBusy ? undefined : { scale: 1.02 }}
              whileTap={isBusy ? undefined : { scale: 0.98 }}
              className="h-10 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 ring-1 ring-brand/30 transition hover:bg-brand-hover disabled:opacity-50"
            >
              {isUploadingMedia
                ? 'Uploading media…'
                : submitting
                  ? 'Saving…'
                  : mode === 'edit'
                    ? 'Save'
                    : 'Post'}
            </motion.button>
          </div>
        </Form>
      </motion.div>
    </Modal>
  )
}
