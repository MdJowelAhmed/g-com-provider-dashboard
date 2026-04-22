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
  SERVICE_CATEGORIES,
  SERVICE_STATUS_OPTIONS,
  PRICING_TYPE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  type Service,
} from './serviceTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Service | null
  onCancel: () => void
  onSubmit: (values: Omit<Service, 'id' | 'createdAt'>) => void
}

type FormValues = Omit<Service, 'id' | 'createdAt'>

const blankValues: FormValues = {
  image: '',
  name: '',
  code: '',
  category: SERVICE_CATEGORIES[0],
  shortDescription: '',
  description: '',

  pricingType: 'fixed',
  price: 0,
  salePrice: null,

  durationMinutes: 60,
  bufferMinutes: 15,

  serviceArea: '',
  locationType: 'on_site',
  staffRequired: 1,
  warrantyDays: null,

  advanceBookingHours: 4,
  maxBookingsPerDay: null,
  cancellationPolicy: '',

  includes: '',
  excludes: '',
  addons: '',
  tags: '',

  status: 'active',
  featured: false,
  hidden: false,
}

export default function ServiceFormDrawer({ open, mode, initial, onCancel, onSubmit }: Props) {
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
      warrantyDays: values.warrantyDays ?? null,
      maxBookingsPerDay: values.maxBookingsPerDay ?? null,
    })
  }

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit service' : 'Add new service'}
      onClose={onCancel}
      width={720}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>
            {mode === 'edit' ? 'Save changes' : 'Add service'}
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
              label="Service name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Deep home cleaning" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Service code"
              rules={[{ required: true, message: 'Code is required' }]}
            >
              <Input placeholder="CLN-DEEP" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="image" label="Cover image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select
                options={SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tags" label="Tags" help="Comma separated">
              <Input placeholder="cleaning, deep, home" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="shortDescription" label="Short description">
              <Input placeholder="One-liner shown on the listing card" maxLength={140} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Full description">
              <Input.TextArea
                rows={4}
                placeholder="Explain what's covered, the process, and anything customers should know"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="pricingType"
              label="Pricing type"
              rules={[{ required: true, message: 'Pricing type is required' }]}
            >
              <Select options={PRICING_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
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
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Duration & delivery
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="durationMinutes"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Duration is required' }]}
            >
              <InputNumber min={5} step={5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bufferMinutes" label="Buffer between jobs (min)">
              <InputNumber min={0} step={5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="locationType"
              label="Where it's done"
              rules={[{ required: true, message: 'Select where it is delivered' }]}
            >
              <Select options={LOCATION_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="serviceArea"
              label="Service area"
              rules={[{ required: true, message: 'Service area is required' }]}
            >
              <Input placeholder="e.g. Downtown, 10km radius" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="staffRequired"
              label="Staff assigned"
              rules={[{ required: true, message: 'Enter staff count' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="warrantyDays" label="Warranty (days)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Optional" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Booking rules
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="advanceBookingHours"
              label="Min. advance notice (hrs)"
              rules={[{ required: true, message: 'Enter advance notice' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maxBookingsPerDay" label="Max bookings / day">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="Unlimited" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="cancellationPolicy" label="Cancellation policy">
              <Input.TextArea
                rows={2}
                placeholder="e.g. Free cancellation up to 6 hours before the appointment."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          What's included
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="includes" label="Included" help="Comma separated">
              <Input.TextArea rows={2} placeholder="Vacuuming, Mopping, Bathroom scrub" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="excludes" label="Not included" help="Comma separated">
              <Input.TextArea rows={2} placeholder="Laundry, Dishwashing" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="addons" label="Optional add-ons" help="Comma separated">
              <Input placeholder="Window cleaning, Fridge interior, Oven interior" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Visibility
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="status" label="Status">
              <Select options={SERVICE_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="featured" label="Featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="hidden" label="Hidden from listing" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
