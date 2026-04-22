import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, Switch, Row, Col, Divider } from 'antd'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_OPTIONS,
  type Product,
} from './productTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Product | null
  onCancel: () => void
  onSubmit: (values: Omit<Product, 'id' | 'createdAt'>) => void
}

type FormValues = Omit<Product, 'id' | 'createdAt'>

const blankValues: FormValues = {
  image: '',
  name: '',
  sku: '',
  description: '',
  category: PRODUCT_CATEGORIES[0],
  brand: '',
  price: 0,
  salePrice: null,
  costPrice: null,
  stock: 0,
  lowStockThreshold: 5,
  weight: null,
  variants: '',
  tags: '',
  status: 'active',
  hidden: false,
  featured: false,
}

export default function ProductFormModal({ open, mode, initial, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<FormValues>()

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      const { id: _id, createdAt: _c, ...rest } = initial
      void _id
      void _c
      form.setFieldsValue(rest)
    } else {
      form.setFieldsValue(blankValues)
    }
  }, [open, mode, initial, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit({
      ...values,
      salePrice: values.salePrice ?? null,
      costPrice: values.costPrice ?? null,
      weight: values.weight ?? null,
    })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit product' : 'Add new product'}
      okText={mode === 'edit' ? 'Save changes' : 'Add product'}
      onOk={handleOk}
      onCancel={onCancel}
      width={760}
      destroyOnHidden
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={blankValues}
        requiredMark="optional"
      >
        <Divider titlePlacement="start" orientationMargin={0} plain>
          Basic info
        </Divider>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Product name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Classic Denim Jacket" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="sku"
              label="SKU"
              rules={[{ required: true, message: 'SKU is required' }]}
            >
              <Input placeholder="DJ-001" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="image" label="Image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="brand" label="Brand">
              <Input placeholder="e.g. Urban Thread" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select
                options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Short description shown on product page" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="salePrice" label="Sale price ($)">
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Optional" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="costPrice" label="Cost price ($)">
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Optional" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Inventory
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="stock"
              label="Stock quantity"
              rules={[{ required: true, message: 'Stock is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lowStockThreshold" label="Low stock alert at">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="weight" label="Weight (g)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="For shipping" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Organization
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="variants" label="Variants" help="Comma separated (e.g. S, M, L)">
              <Input placeholder="S, M, L, XL" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tags" label="Tags" help="Comma separated">
              <Input placeholder="denim, jacket, unisex" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status">
              <Select options={PRODUCT_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="featured" label="Featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hidden" label="Hidden from storefront" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
