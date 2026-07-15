import { useEffect, useMemo, useRef, useState } from 'react'
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
import GoogleMapLocationPicker, {
  type GoogleMapLocationPickerRef,
} from '../../../components/common/GoogleMapLocationPicker'
import { parseCoordinate } from '../../../lib/googleMaps'
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
  locationName: '',
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

function nowDatetimeLocal(): string {
  return toDatetimeLocal(new Date().toISOString())
}

function isPastDatetimeLocal(value: string) {
  if (!value) return false
  const selected = new Date(value)
  if (Number.isNaN(selected.getTime())) return false
  return selected.getTime() < Date.now()
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
  const locationPickerRef = useRef<GoogleMapLocationPickerRef>(null)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()
  const minDatetime = useMemo(() => nowDatetimeLocal(), [open])

  const startMin = useMemo(() => {
    if (mode === 'edit' && initial?.startTime) {
      const existing = toDatetimeLocal(initial.startTime)
      if (existing && isPastDatetimeLocal(existing)) return existing
    }
    return minDatetime
  }, [mode, initial?.startTime, minDatetime])

  const endMin = useMemo(() => {
    if (mode === 'edit' && initial?.endTime) {
      const existing = toDatetimeLocal(initial.endTime)
      if (existing && isPastDatetimeLocal(existing)) return existing
    }
    return minDatetime
  }, [mode, initial?.endTime, minDatetime])

  const registrationMin = useMemo(() => {
    if (mode === 'edit' && initial?.registrationDeadline) {
      const existing = toDatetimeLocal(initial.registrationDeadline)
      if (existing && isPastDatetimeLocal(existing)) return existing
    }
    return minDatetime
  }, [mode, initial?.registrationDeadline, minDatetime])

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

  const locationName = Form.useWatch('locationName', form)
  const latitude = Form.useWatch('latitude', form)
  const longitude = Form.useWatch('longitude', form)
  const locationNameError = form.getFieldError('locationName')[0]
  const latitudeError = form.getFieldError('latitude')[0]
  const locationHelp =
    locationNameError ||
    latitudeError ||
    'Search a place, pick a suggestion, or click the map — lat/lng fill automatically.'

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

  const notPastRule = (label: string, initialIso?: string) => ({
    validator: async (_: unknown, value: string) => {
      if (!value) return
      if (!isPastDatetimeLocal(value)) return
      // Keep an already-saved past value valid in edit mode; block choosing a new past date.
      if (mode === 'edit' && initialIso && toDatetimeLocal(initialIso) === value) return
      throw new Error(`${label} cannot be in the past`)
    },
  })

  const handleOk = async () => {
    try {
      const lat = parseCoordinate(form.getFieldValue('latitude'))
      const lng = parseCoordinate(form.getFieldValue('longitude'))

      if (lat == null || lng == null) {
        const resolved = await locationPickerRef.current?.resolveLocation()
        if (!resolved) {
          message.error(
            'Please search a location, select a suggestion, press Enter, or click on the map.',
          )
          return
        }
        form.setFieldsValue({
          locationName: resolved.locationName,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
        })
      } else {
        const typedName = locationPickerRef.current?.getInputValue()
        if (typedName) form.setFieldValue('locationName', typedName)
      }

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
      styles={{ body: { overflow: 'visible' } }}
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
              rules={[
                { required: true, message: 'Start time is required' },
                notPastRule('Start time', initial?.startTime),
              ]}
            >
              <Input type="datetime-local" min={startMin} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="End time"
              rules={[
                { required: true, message: 'End time is required' },
                notPastRule('End time', initial?.endTime),
                {
                  validator: async (_, value: string) => {
                    const start = form.getFieldValue('startTime') as string
                    if (!value || !start) return
                    if (new Date(value).getTime() <= new Date(start).getTime()) {
                      throw new Error('End time must be after start time')
                    }
                  },
                },
              ]}
            >
              <Input type="datetime-local" min={endMin} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="registrationDeadline"
              label="Registration deadline"
              rules={[
                { required: true, message: 'Registration deadline is required' },
                notPastRule('Registration deadline', initial?.registrationDeadline),
              ]}
            >
              <Input type="datetime-local" min={registrationMin} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Location
        </Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="locationName"
              hidden
              rules={[
                {
                  validator: async () => {
                    const lat = parseCoordinate(form.getFieldValue('latitude'))
                    const lng = parseCoordinate(form.getFieldValue('longitude'))
                    if (lat != null && lng != null) return
                    throw new Error('Location is required')
                  },
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="latitude" hidden rules={[{ required: true, message: 'Latitude is required' }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item name="longitude" hidden rules={[{ required: true, message: 'Longitude is required' }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item
              label="Event location"
              required
              validateStatus={locationNameError || latitudeError ? 'error' : locationName ? 'success' : undefined}
              help={locationHelp}
            >
              <GoogleMapLocationPicker
                ref={locationPickerRef}
                value={{
                  locationName: locationName ?? '',
                  latitude: parseCoordinate(latitude),
                  longitude: parseCoordinate(longitude),
                }}
                onNameChange={(name) => {
                  form.setFieldValue('locationName', name)
                }}
                onChange={(next) => {
                  form.setFieldsValue({
                    locationName: next.locationName,
                    latitude: next.latitude,
                    longitude: next.longitude,
                  })
                  void form.validateFields(['locationName', 'latitude', 'longitude'])
                }}
              />
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
              label="Ticket price (GH₵)"
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
