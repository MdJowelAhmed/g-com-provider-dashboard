import { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Divider,
  Button,
  Space,
  message,
} from 'antd'
import ImageUploader from '../../../components/common/ImageUploader'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import type { Event, EventFormValues } from './eventTypes'
import { eventToFormValues } from './eventMapping'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Event | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: EventFormValues) => void | Promise<void>
}

const blankValues: EventFormValues = {
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  registrationDeadline: '',
  latitude: null,
  longitude: null,
  maxCapacity: 100,
  ticketPrice: 0,
  image: '',
  subCategory: '',
  businessCategory: '',
  organizerName: '',
  branch: '',
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString()
}

export default function EventFormDrawer({
  open,
  mode,
  initial,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<EventFormValues>()
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()

  const { data: shopsData, isLoading: shopsLoading } = useGetShopsQuery(
    { page: 1, limit: 100 },
    { skip: !open },
  )
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBusinessCategoriesQuery(
    undefined,
    { skip: !open },
  )
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetSubCategoriesQuery(
    { category: 'event', page: 1, limit: 100 },
    { skip: !open },
  )

  const branchOptions = useMemo(
    () =>
      (shopsData?.data ?? []).map((shop) => ({
        value: shop._id,
        label: shop.branchName,
      })),
    [shopsData?.data],
  )

  const businessCategoryOptions = useMemo(
    () =>
      (categoriesData?.data ?? []).map((category) => ({
        value: category._id,
        label: category.name,
      })),
    [categoriesData?.data],
  )

  const subCategoryOptions = useMemo(
    () =>
      (subCategoriesData?.data ?? [])
        .filter((item) => item.status === 'active')
        .map((sub) => ({
          value: sub._id,
          label: sub.name,
        })),
    [subCategoriesData?.data],
  )

  useEffect(() => {
    if (!open) return
    setPendingImageFile(null)
    if (mode === 'edit' && initial) {
      const values = eventToFormValues(initial)
      form.setFieldsValue({
        ...values,
        startTime: toDatetimeLocal(values.startTime),
        endTime: toDatetimeLocal(values.endTime),
        registrationDeadline: toDatetimeLocal(values.registrationDeadline),
      })
    } else {
      form.setFieldsValue(blankValues)
    }
  }, [open, mode, initial, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      let imageUrl = values.image?.trim() ?? ''

      if (pendingImageFile) {
        setIsUploadingImage(true)
        try {
          imageUrl = await uploadImageFile(pendingImageFile, async (payload) => {
            const result = await getPresignedUrl(payload).unwrap()
            return result
          })
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : 'Image upload failed.',
          )
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      if (!imageUrl) {
        message.error('Please select an event image.')
        return
      }

      await onSubmit({
        ...values,
        image: imageUrl,
        startTime: fromDatetimeLocal(values.startTime),
        endTime: fromDatetimeLocal(values.endTime),
        registrationDeadline: fromDatetimeLocal(values.registrationDeadline),
      })
    } catch {
      // validation errors shown by ant form
    }
  }

  const busy = submitting || isUploadingImage

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit event' : 'Create event'}
      onClose={onCancel}
      width={780}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOk} loading={busy}>
            {isUploadingImage
              ? 'Uploading image…'
              : mode === 'edit'
                ? 'Save changes'
                : 'Create event'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={blankValues} requiredMark="optional">
        <Divider titlePlacement="start" orientationMargin={0} plain>
          Basic info
        </Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="National Environment Event" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea rows={3} placeholder="This is event description" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="image"
              label="Image"
              rules={[
                {
                  validator: async () => {
                    const current = form.getFieldValue('image') as string | undefined
                    if (current?.trim() || pendingImageFile) return
                    throw new Error('Image is required')
                  },
                },
              ]}
            >
              <ImageUploader
                value={form.getFieldValue('image')}
                autoUpload={false}
                onFileSelect={(file) => {
                  setPendingImageFile(file ?? null)
                  form.setFields([{ name: 'image', errors: [] }])
                }}
                onChange={(url) => form.setFieldValue('image', url)}
                hint="Select image — uploads when you save the event"
                heightClass="h-40"
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
              name="startTime"
              label="Start time"
              rules={[{ required: true, message: 'Start time is required' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="End time"
              rules={[{ required: true, message: 'End time is required' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="registrationDeadline"
              label="Registration deadline"
              rules={[{ required: true, message: 'Registration deadline is required' }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Location
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[{ required: true, message: 'Longitude is required' }]}
            >
              <InputNumber step={0.000001} style={{ width: '100%' }} placeholder="90.398911" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[{ required: true, message: 'Latitude is required' }]}
            >
              <InputNumber step={0.000001} style={{ width: '100%' }} placeholder="23.779343" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Capacity & pricing
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maxCapacity"
              label="Max capacity"
              rules={[{ required: true, message: 'Max capacity is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ticketPrice"
              label="Ticket price ($)"
              rules={[{ required: true, message: 'Ticket price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Optional
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="organizerName" label="Organizer name">
              <Input placeholder="Evently" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="businessCategory" label="Business category">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select business category"
                loading={categoriesLoading}
                options={businessCategoryOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="subCategory" label="Sub category">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select sub category"
                loading={subCategoriesLoading}
                options={subCategoryOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="branch" label="Branch">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Select branch"
                loading={shopsLoading}
                options={branchOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
