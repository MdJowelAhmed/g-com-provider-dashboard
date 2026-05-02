import { Form, Modal } from 'antd'
import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import type { RolePostConfig } from '../config/rolePostConfig'
import type { Post, PostFormValues } from '../types'
import { MOCK_SHOPS, postToFormValues, productsForShop } from '../utils/postFormMapping'
import PostMediaUpload from './PostMediaUpload'
import { postFieldClass, postLabelClass, postTextareaClass } from './postFormFieldClasses'

type Props = {
  open: boolean
  mode: 'create' | 'edit'
  initialPost?: Post | null
  config: RolePostConfig
  onCancel: () => void
  onSubmit: (values: PostFormValues) => void
}

function blankForm(): PostFormValues {
  const shopId = MOCK_SHOPS[0]?.id ?? ''
  const firstProduct = productsForShop(shopId)[0]?.id ?? ''
  return {
    shopId,
    productId: firstProduct,
    totalAmount: '',
    startLocal: '',
    endLocal: '',
    about: '',
    media: [],
  }
}

export default function PostFormModal({
  open,
  mode,
  initialPost,
  config: _config,
  onCancel,
  onSubmit,
}: Props) {
  void _config
  const [form] = Form.useForm<PostFormValues>()

  const shopId = Form.useWatch('shopId', form)

  const productOptions = useMemo(() => productsForShop(shopId || MOCK_SHOPS[0]?.id || ''), [shopId])

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialPost) {
      form.setFieldsValue(postToFormValues(initialPost))
    } else {
      form.setFieldsValue(blankForm())
    }
  }, [open, mode, initialPost, form])

  useEffect(() => {
    if (!open || !shopId) return
    const ids = productsForShop(shopId).map((p) => p.id)
    const current = form.getFieldValue('productId') as string
    if (!ids.some((id) => id === current)) {
      form.setFieldValue('productId', ids[0] ?? '')
    }
  }, [shopId, open, form])

  const handleFinish = (v: PostFormValues) => {
    onSubmit({
      ...v,
      shopId: v.shopId,
      productId: v.productId,
      totalAmount: v.totalAmount.trim(),
      startLocal: v.startLocal,
      endLocal: v.endLocal,
      about: v.about.trim(),
      media: v.media ?? [],
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
            name="shopId"
            label={<span className={postLabelClass}>Select Shop</span>}
            rules={[{ required: true, message: '' }]}
          >
            <select className={postFieldClass}>
              {MOCK_SHOPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item
            name="productId"
            label={<span className={postLabelClass}>Select Product</span>}
            rules={[{ required: true, message: '' }]}
          >
            <select className={postFieldClass} disabled={productOptions.length === 0}>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Form.Item>

          <Form.Item
            name="totalAmount"
            label={<span className={postLabelClass}>Total Amount</span>}
            rules={[{ required: true, message: '' }]}
          >
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              autoComplete="off"
              className={postFieldClass}
            />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="startLocal"
              label={<span className={postLabelClass}>Start Date and Time</span>}
              rules={[{ required: true, message: '' }]}
            >
              <input type="datetime-local" className={`${postFieldClass} font-mono text-[13px]`} />
            </Form.Item>
            <Form.Item
              name="endLocal"
              label={<span className={postLabelClass}>End Date and Time</span>}
              dependencies={['startLocal']}
              rules={[
                { required: true, message: '' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('startLocal') as string
                    if (!value || !start) return Promise.resolve()
                    if (new Date(value) <= new Date(start)) {
                      return Promise.reject(new Error(' '))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <input type="datetime-local" className={`${postFieldClass} font-mono text-[13px]`} />
            </Form.Item>
          </div>

          <Form.Item
            name="about"
            label={<span className={postLabelClass}>About This Product</span>}
            rules={[{ required: true, message: '' }]}
          >
            <textarea rows={4} placeholder="Describe the offer" className={postTextareaClass} />
          </Form.Item>

          <Form.Item
            name="media"
            label={<span className={postLabelClass}>Upload Picture/Video</span>}
            className="!mb-0"
          >
            <PostMediaUpload maxFiles={6} />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-xl border border-white/[0.1] bg-transparent px-5 text-sm font-medium text-gray-300 transition hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-white"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-10 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-lg shadow-brand/20 ring-1 ring-brand/30 transition hover:bg-brand-hover"
            >
              {mode === 'edit' ? 'Save' : 'Post'}
            </motion.button>
          </div>
        </Form>
      </motion.div>
    </Modal>
  )
}
