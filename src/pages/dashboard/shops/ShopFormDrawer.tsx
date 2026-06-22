import { useEffect, useRef } from 'react'
import {
  Drawer,
  Form,
  Input,
  Select,
  TimePicker,
  Row,
  Col,
  Divider,
  Button,
  Space,
  message,
} from 'antd'
import dayjs from 'dayjs'
import GoogleMapLocationPicker, {
  type GoogleMapLocationPickerRef,
} from '../../../components/common/GoogleMapLocationPicker'
import type { ShopFormValues } from '../../../redux/api/shopManagementApi'
import { parseCoordinate } from '../../../lib/googleMaps'
import { WEEKDAY_OPTIONS, type ShopBranch } from './shopTypes'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: ShopBranch | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: ShopFormValues) => void | Promise<void>
}

const blankValues: ShopFormValues = {
  branchName: '',
  contact: '',
  locationName: '',
  latitude: '',
  longitude: '',
  openTime: '08:00',
  closeTime: '22:00',
  availableDay: [],
  description: '',
}

function timeToDayjs(time: string) {
  if (!time) return null
  const [h, m] = time.split(':')
  return dayjs().hour(Number(h)).minute(Number(m)).second(0)
}

function dayjsToTime(value: dayjs.Dayjs | null) {
  if (!value) return ''
  return value.format('HH:mm')
}

export default function ShopFormDrawer({
  open,
  mode,
  initial,
  loading,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<
    ShopFormValues & { openTimePicker: dayjs.Dayjs; closeTimePicker: dayjs.Dayjs }
  >()
  const locationPickerRef = useRef<GoogleMapLocationPickerRef>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      form.setFieldsValue({
        branchName: initial.branchName,
        contact: initial.contact,
        locationName: initial.locationName,
        latitude: String(initial.latitude),
        longitude: String(initial.longitude),
        openTime: initial.openTime,
        closeTime: initial.closeTime,
        openTimePicker: timeToDayjs(initial.openTime)!,
        closeTimePicker: timeToDayjs(initial.closeTime)!,
        availableDay: initial.availableDay,
        description: initial.description,
      })
    } else {
      form.setFieldsValue({
        ...blankValues,
        openTimePicker: timeToDayjs(blankValues.openTime)!,
        closeTimePicker: timeToDayjs(blankValues.closeTime)!,
      })
    }
  }, [open, mode, initial, form])

  const handleOk = async () => {
    try {
      const lat = parseCoordinate(form.getFieldValue('latitude'))
      const lng = parseCoordinate(form.getFieldValue('longitude'))

      if (lat == null || lng == null) {
        const resolved = await locationPickerRef.current?.resolveLocation()
        if (!resolved) {
          void message.error(
            'Please search a location, select a suggestion, press Enter, or click on the map.',
          )
          return
        }

        form.setFieldsValue({
          locationName: resolved.locationName,
          latitude: String(resolved.latitude),
          longitude: String(resolved.longitude),
        })
      } else {
        const typedName = locationPickerRef.current?.getInputValue()
        if (typedName) {
          form.setFieldValue('locationName', typedName)
        }
      }

      const values = await form.validateFields()
      await onSubmit({
        branchName: values.branchName,
        contact: values.contact,
        locationName: values.locationName,
        latitude: values.latitude,
        longitude: values.longitude,
        openTime: dayjsToTime(values.openTimePicker),
        closeTime: dayjsToTime(values.closeTimePicker),
        availableDay: values.availableDay ?? [],
        description: values.description,
      })
    } catch {
      void message.error('Please complete all required fields before saving.')
    }
  }

  const locationName = Form.useWatch('locationName', form)
  const latitude = Form.useWatch('latitude', form)
  const longitude = Form.useWatch('longitude', form)
  const locationNameError = form.getFieldError('locationName')[0]
  const latitudeError = form.getFieldError('latitude')[0]
  const locationHelp =
    locationNameError ||
    latitudeError ||
    'Search a place name, select a suggestion, or click on the map.'

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit branch' : 'Add new branch'}
      onClose={onCancel}
      width={720}
      placement="right"
      destroyOnHidden
      styles={{ body: { overflow: 'visible' } }}
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={() => void handleOk()}>
            {mode === 'edit' ? 'Save changes' : 'Add branch'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item name="locationName" hidden rules={[{ required: true, message: 'Location name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="latitude" hidden rules={[{ required: true, message: 'Latitude is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="longitude" hidden rules={[{ required: true, message: 'Longitude is required' }]}>
          <Input />
        </Form.Item>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Basic info
        </Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="branchName"
              label="Branch name"
              rules={[{ required: true, message: 'Branch name is required' }]}
            >
              <Input placeholder="e.g. Downtown store" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contact"
              label="Contact number"
              rules={[{ required: true, message: 'Contact is required' }]}
            >
              <Input placeholder="+233241234567" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Tell customers about this branch" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Location
        </Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Location name"
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
                    latitude: String(next.latitude),
                    longitude: String(next.longitude),
                  })
                  void form.validateFields(['locationName', 'latitude', 'longitude'])
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Opening hours
        </Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="openTimePicker"
              label="Open time"
              rules={[{ required: true, message: 'Open time is required' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="closeTimePicker"
              label="Close time"
              rules={[{ required: true, message: 'Close time is required' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="availableDay" label="Available days">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select operating days"
                options={WEEKDAY_OPTIONS}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
