import { useEffect } from 'react'
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Divider,
  Button,
  Space,
} from 'antd'
import {
  MENU_CATEGORIES,
  MENU_STATUS_OPTIONS,
  DIETARY_OPTIONS,
  SPICY_LEVEL_OPTIONS,
  type MenuItem,
} from './menuTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: MenuItem | null
  onCancel: () => void
  onSubmit: (values: Omit<MenuItem, 'id' | 'createdAt'>) => void
}

type FormValues = Omit<MenuItem, 'id' | 'createdAt'>

const blankValues: FormValues = {
  image: '',
  name: '',
  code: '',
  category: MENU_CATEGORIES[0],
  shortDescription: '',

  price: 0,
  salePrice: null,

  portionSize: '',

  dietary: 'vegetarian',
  spicyLevel: 'none',

  bestSeller: false,
  isNew: false,

  status: 'active',
  hidden: false,
}

export default function MenuFormDrawer({ open, mode, initial, onCancel, onSubmit }: Props) {
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
    })
  }

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit menu item' : 'Add menu item'}
      onClose={onCancel}
      width={680}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>
            {mode === 'edit' ? 'Save changes' : 'Add item'}
          </Button>
        </Space>
      }
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
              label="Item name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Chicken Biryani" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Item code"
              rules={[{ required: true, message: 'Code is required' }]}
            >
              <Input placeholder="MAI-CB" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select options={MENU_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="portionSize"
              label="Portion"
              rules={[{ required: true, message: 'Portion is required' }]}
            >
              <Input placeholder="e.g. 6 pieces, 250g, Full plate, 12 inch" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="image" label="Cover image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="shortDescription"
              label="Short description"
              help="One line shown on the menu card"
            >
              <Input
                placeholder="Char-grilled cottage cheese marinated in yogurt and spices."
                maxLength={140}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="salePrice" label="Sale price ($)">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Optional"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Dietary
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dietary"
              label="Food type"
              rules={[{ required: true, message: 'Food type is required' }]}
            >
              <Select options={DIETARY_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="spicyLevel"
              label="Spicy level"
              rules={[{ required: true, message: 'Spicy level is required' }]}
            >
              <Select options={SPICY_LEVEL_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Highlights & visibility
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bestSeller" label="Best seller" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isNew" label="New item" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select options={MENU_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hidden" label="Hidden from menu" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
