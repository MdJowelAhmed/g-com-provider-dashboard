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
  EVENT_CATEGORIES,
  EVENT_TYPE_OPTIONS,
  EVENT_LIFECYCLE_STATUS_OPTIONS,
  EVENT_PUBLISH_STATUS_OPTIONS,
  AGE_RESTRICTION_OPTIONS,
  type Event,
} from './eventTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Event | null
  onCancel: () => void
  onSubmit: (values: Omit<Event, 'id' | 'createdAt'>) => void
}

type FormValues = Omit<Event, 'id' | 'createdAt' | 'startAt' | 'endAt' | 'registrationDeadline' | 'earlyBirdUntil'> & {
  startAt: string
  endAt: string
  registrationDeadline: string
  earlyBirdUntil: string
}

const blankValues: FormValues = {
  image: '',
  name: '',
  code: '',
  category: EVENT_CATEGORIES[0],
  eventType: 'in_person',
  shortDescription: '',
  description: '',
  tags: '',

  startAt: '',
  endAt: '',
  timezone: 'UTC',
  registrationDeadline: '',

  venueName: '',
  venueAddress: '',
  venueCity: '',
  venueLatitude: null,
  venueLongitude: null,

  onlinePlatform: '',
  onlineJoinUrl: '',

  minCapacity: 0,
  maxCapacity: 100,
  bookedCount: 0,

  pricingType: 'paid',
  price: 0,
  earlyBirdPrice: null,
  earlyBirdUntil: '',

  refundPolicy: '',
  ageRestriction: 'all_ages',

  status: 'scheduled',
  publishStatus: 'draft',
  hidden: false,
  featured: false,
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}

export default function EventFormDrawer({
  open,
  mode,
  initial,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>()
  const eventType = Form.useWatch('eventType', form)
  const pricingType = Form.useWatch('pricingType', form)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      const { id: _id, createdAt: _c, ...rest } = initial
      void _id
      void _c
      form.setFieldsValue({
        ...rest,
        startAt: toDatetimeLocal(rest.startAt),
        endAt: toDatetimeLocal(rest.endAt),
        registrationDeadline: toDatetimeLocal(rest.registrationDeadline),
        earlyBirdUntil: toDatetimeLocal(rest.earlyBirdUntil),
      })
    } else {
      form.setFieldsValue(blankValues)
    }
  }, [open, mode, initial, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit({
      ...values,
      startAt: fromDatetimeLocal(values.startAt),
      endAt: fromDatetimeLocal(values.endAt),
      registrationDeadline: fromDatetimeLocal(values.registrationDeadline),
      earlyBirdUntil: fromDatetimeLocal(values.earlyBirdUntil),
      venueLatitude: values.venueLatitude ?? null,
      venueLongitude: values.venueLongitude ?? null,
      earlyBirdPrice: values.earlyBirdPrice ?? null,
    })
  }

  const showVenue = eventType === 'in_person' || eventType === 'hybrid'
  const showOnline = eventType === 'online' || eventType === 'hybrid'
  const isPaid = pricingType === 'paid'

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit event' : 'Create event'}
      onClose={onCancel}
      width={800}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleOk}>
            {mode === 'edit' ? 'Save changes' : 'Create event'}
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
              label="Event name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Jazz Night Live" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="code"
              label="Event code"
              rules={[{ required: true, message: 'Code is required' }]}
            >
              <Input placeholder="EVT-JNL-001" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select options={EVENT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="eventType"
              label="Event type"
              rules={[{ required: true, message: 'Type is required' }]}
            >
              <Select options={EVENT_TYPE_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tags" label="Tags" help="Comma separated">
              <Input placeholder="music, live, night" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="image" label="Cover image URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="shortDescription" label="Short description">
              <Input placeholder="One-liner shown on the event card" maxLength={160} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Full description">
              <Input.TextArea
                rows={4}
                placeholder="What's the event about, the agenda, what attendees will experience"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Schedule
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startAt"
              label="Starts at"
              rules={[{ required: true, message: 'Start time is required' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endAt"
              label="Ends at"
              rules={[{ required: true, message: 'End time is required' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Timezone"
              rules={[{ required: true, message: 'Timezone is required' }]}
            >
              <Input placeholder="e.g. America/New_York, UTC" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registrationDeadline" label="Registration deadline">
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
        </Row>

        {showVenue ? (
          <>
            <Divider titlePlacement="start" orientationMargin={0} plain>
              Venue
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="venueName"
                  label="Venue name"
                  rules={[
                    showVenue
                      ? { required: true, message: 'Venue name is required' }
                      : {},
                  ]}
                >
                  <Input placeholder="Blue Harbor Lounge" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="venueCity"
                  label="City"
                  rules={[
                    showVenue ? { required: true, message: 'City is required' } : {},
                  ]}
                >
                  <Input placeholder="New York, NY" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="venueAddress"
                  label="Address"
                  rules={[
                    showVenue ? { required: true, message: 'Address is required' } : {},
                  ]}
                >
                  <Input placeholder="250 W 44th St" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="venueLatitude" label="Latitude">
                  <InputNumber
                    step={0.0001}
                    style={{ width: '100%' }}
                    placeholder="40.7580"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="venueLongitude" label="Longitude">
                  <InputNumber
                    step={0.0001}
                    style={{ width: '100%' }}
                    placeholder="-73.9870"
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : null}

        {showOnline ? (
          <>
            <Divider titlePlacement="start" orientationMargin={0} plain>
              Online
            </Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="onlinePlatform"
                  label="Platform"
                  rules={[
                    showOnline ? { required: true, message: 'Platform is required' } : {},
                  ]}
                >
                  <Input placeholder="Zoom, Google Meet, YouTube Live" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="onlineJoinUrl" label="Join URL / note">
                  <Input placeholder="Public URL or 'Sent to registrants before event'" />
                </Form.Item>
              </Col>
            </Row>
          </>
        ) : null}

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Capacity
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="minCapacity"
              label="Minimum capacity"
              help="Event only runs if this is reached"
              rules={[{ required: true, message: 'Enter minimum capacity' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxCapacity"
              label="Maximum capacity"
              rules={[{ required: true, message: 'Enter maximum capacity' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="bookedCount" label="Already booked">
              <InputNumber min={0} style={{ width: '100%' }} />
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
              <Select
                options={[
                  { value: 'free', label: 'Free' },
                  { value: 'paid', label: 'Paid' },
                ]}
              />
            </Form.Item>
          </Col>
          {isPaid ? (
            <>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Ticket price ($)"
                  rules={[{ required: true, message: 'Price is required' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="earlyBirdPrice" label="Early-bird price ($)">
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="Optional"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="earlyBirdUntil" label="Early-bird ends">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
            </>
          ) : null}
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Policy
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ageRestriction" label="Age restriction">
              <Select options={AGE_RESTRICTION_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="refundPolicy" label="Refund policy">
              <Input.TextArea
                rows={2}
                placeholder="e.g. Full refund up to 48 hours before event."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Status & visibility
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Lifecycle status">
              <Select options={EVENT_LIFECYCLE_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="publishStatus" label="Publish status">
              <Select options={EVENT_PUBLISH_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="featured" label="Featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hidden" label="Hidden from listing" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
