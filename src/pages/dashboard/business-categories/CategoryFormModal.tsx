import { useEffect } from 'react'
import { Modal, Form, Input } from 'antd'
import type { BusinessCategory } from './categoryTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: BusinessCategory | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: { name: string }) => void
}

type FormValues = {
  name: string
}

export default function CategoryFormModal({
  open,
  mode,
  initial,
  loading,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      form.setFieldsValue({ name: initial.name })
    } else {
      form.setFieldsValue({ name: '' })
    }
  }, [open, mode, initial, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit({ name: values.name.trim() })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit category' : 'Add new category'}
      okText={mode === 'edit' ? 'Save changes' : 'Add category'}
      confirmLoading={loading}
      onOk={() => void handleOk()}
      onCancel={onCancel}
      width={480}
      destroyOnHidden
      centered
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="name"
          label="Category name"
          rules={[{ required: true, message: 'Category name is required' }]}
        >
          <Input placeholder="e.g. Electronics" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
