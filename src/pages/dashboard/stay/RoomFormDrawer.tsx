import { useEffect } from 'react'
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Checkbox,
  Row,
  Col,
  Divider,
  Button,
  Space,
} from 'antd'
import {
  ROOM_TYPE_OPTIONS,
  BED_TYPE_OPTIONS,
  VIEW_TYPE_OPTIONS,
  ROOM_OPERATIONAL_STATUS_OPTIONS,
  ROOM_PUBLISH_STATUS_OPTIONS,
  ROOM_AMENITIES,
  type Room,
} from './roomTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Room | null
  onCancel: () => void
  onSubmit: (values: Omit<Room, 'id' | 'createdAt'>) => void
}

type FormValues = Omit<Room, 'id' | 'createdAt'>

const blankValues: FormValues = {
  image: '',
  roomNumber: '',
  name: '',
  code: '',
  roomType: ROOM_TYPE_OPTIONS[0],
  description: '',

  floor: 1,
  sizeSqm: null,

  bedType: 'double',
  bedCount: 1,
  maxAdults: 2,
  maxChildren: 0,
  extraBedAvailable: false,

  basePrice: 0,
  weekendPrice: null,
  extraBedPrice: null,

  hasAc: true,
  hasWifi: true,
  breakfastIncluded: false,
  viewType: 'none',
  smokingAllowed: false,
  petsAllowed: false,
  amenities: [],

  minNights: 1,
  maxNights: null,
  cancellationPolicy: '',

  status: 'available',
  publishStatus: 'active',
  hidden: false,
  featured: false,
}

export default function RoomFormDrawer({ open, mode, initial, onCancel, onSubmit }: Props) {
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
      sizeSqm: values.sizeSqm ?? null,
      weekendPrice: values.weekendPrice ?? null,
      extraBedPrice: values.extraBedPrice ?? null,
      maxNights: values.maxNights ?? null,
      amenities: values.amenities ?? [],
    })
  }

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit room' : 'Add new room'}
      onClose={onCancel}
      width={780}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>
            {mode === 'edit' ? 'Save changes' : 'Add room'}
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
          <Col span={8}>
            <Form.Item
              name="roomNumber"
              label="Room number"
              rules={[{ required: true, message: 'Room number is required' }]}
            >
              <Input placeholder="101" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Display name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Deluxe Double — Sea View" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Room code"
              rules={[{ required: true, message: 'Code is required' }]}
            >
              <Input placeholder="DLX-DBL-205" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="roomType"
              label="Room type"
              rules={[{ required: true, message: 'Room type is required' }]}
            >
              <Select options={ROOM_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="floor"
              label="Floor"
              rules={[{ required: true, message: 'Enter floor' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="sizeSqm" label="Size (m²)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Optional" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="image" label="Cover image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="What makes this room special?" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Beds & capacity
        </Divider>
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              name="bedType"
              label="Bed type"
              rules={[{ required: true, message: 'Bed type is required' }]}
            >
              <Select options={BED_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="bedCount"
              label="Bed count"
              rules={[{ required: true, message: 'Enter bed count' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              name="maxAdults"
              label="Max adults"
              rules={[{ required: true, message: 'Enter max adults' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="maxChildren" label="Max children">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="extraBedAvailable"
              label="Extra bed available on request"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing (per night)
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="basePrice"
              label="Base price ($)"
              rules={[{ required: true, message: 'Base price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="weekendPrice" label="Weekend price ($)">
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Optional"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="extraBedPrice" label="Extra bed price ($)">
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
          Facilities
        </Divider>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="hasAc" label="Air conditioning" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="hasWifi" label="Wi-Fi" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="breakfastIncluded"
              label="Breakfast included"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="viewType"
              label="View"
              rules={[{ required: true, message: 'Select a view' }]}
            >
              <Select options={VIEW_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="smokingAllowed" label="Smoking allowed" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="petsAllowed" label="Pets allowed" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="amenities" label="Other amenities">
              <Checkbox.Group
                options={ROOM_AMENITIES.map((a) => ({ value: a, label: a }))}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Booking rules
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="minNights"
              label="Minimum nights"
              rules={[{ required: true, message: 'Enter minimum nights' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maxNights" label="Maximum nights">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="No limit" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="cancellationPolicy" label="Cancellation policy">
              <Input.TextArea
                rows={2}
                placeholder="e.g. Free cancellation up to 48 hours before check-in."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Status & visibility
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Operational status">
              <Select options={ROOM_OPERATIONAL_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="publishStatus" label="Publish status">
              <Select options={ROOM_PUBLISH_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="featured" label="Featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hidden" label="Hidden from booking site" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
