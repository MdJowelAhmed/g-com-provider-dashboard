import { useEffect, useMemo, useState } from 'react'
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Row,
  Col,
  Divider,
  Button,
  Space,
  message,
} from 'antd'
import ImageUploader from '../../../components/common/ImageUploader'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import { useAuth } from '../../../context/AuthContext'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import {
  PLATFORM_CATEGORY_OPTIONS,
  businessCategoryToPlatformCategory,
  dashboardRoleToPlatformCategory,
  type PlatformCategory,
} from '../services/serviceTypes'
import {
  BED_TYPE_OPTIONS,
  ROOM_AMENITIES,
  ROOM_TYPE_OPTIONS,
  type Room,
  type RoomFormValues,
} from './roomTypes'
import { roomToFormValues } from './roomMapping'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Room | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: RoomFormValues) => void | Promise<void>
}

function defaultCategory(
  dashboardRole: string,
  profileCategory?: string,
): PlatformCategory {
  if (profileCategory?.trim()) {
    return businessCategoryToPlatformCategory(profileCategory)
  }
  return dashboardRoleToPlatformCategory(dashboardRole)
}

const blankValues = (category: PlatformCategory): RoomFormValues => ({
  name: '',
  roomNumber: '',
  roomCode: '',
  roomType: ROOM_TYPE_OPTIONS[0],
  bedType: BED_TYPE_OPTIONS[3],
  size: '',
  basePrice: 0,
  category,
  subCategory: '',
  businessCategory: '',
  branch: '',
  description: '',
  bedCount: 1,
  maxAdult: 2,
  maxChildren: 0,
  totalGuest: 2,
  otherAmenities: [],
  image: '',
})

export default function RoomFormDrawer({
  open,
  mode,
  initial,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<RoomFormValues>()
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()

  const category = Form.useWatch('category', form) as PlatformCategory | '' | undefined

  const { data: shopsData, isLoading: shopsLoading } = useGetShopsQuery(
    { page: 1, limit: 100 },
    { skip: !open },
  )
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBusinessCategoriesQuery(
    undefined,
    { skip: !open },
  )
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetSubCategoriesQuery(
    { category: category as PlatformCategory, page: 1, limit: 100 },
    { skip: !open || !category },
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

    const profileCategory =
      typeof user?.extra?.category === 'string' ? user.extra.category : undefined
    const fallbackCategory = defaultCategory(dashboardRole, profileCategory)

    setPendingImageFile(null)
    if (mode === 'edit' && initial) {
      form.setFieldsValue({
        ...roomToFormValues(initial),
        category: initial.mainCategory
          ? dashboardRoleToPlatformCategory(initial.mainCategory)
          : fallbackCategory,
      })
      return
    }

    form.setFieldsValue({
      ...blankValues(fallbackCategory),
      branch: branchOptions[0]?.value ?? '',
      businessCategory: businessCategoryOptions[0]?.value ?? '',
    })
  }, [
    open,
    mode,
    initial,
    form,
    branchOptions,
    businessCategoryOptions,
    dashboardRole,
    user?.extra?.category,
  ])

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
        message.error('Please select a room image.')
        return
      }

      await onSubmit({
        ...values,
        image: imageUrl,
        otherAmenities: values.otherAmenities ?? [],
        totalGuest: Number(values.maxAdult) + Number(values.maxChildren),
      })
    } catch {
      // validation errors shown by ant form
    }
  }

  const busy = submitting || isUploadingImage

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
          <Button onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOk} loading={busy}>
            {isUploadingImage
              ? 'Uploading image…'
              : mode === 'edit'
                ? 'Save changes'
                : 'Add room'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={blankValues(defaultCategory(dashboardRole, user?.extra?.category))}
        requiredMark="optional"
      >
        <Divider titlePlacement="start" orientationMargin={0} plain>
          Basic info
        </Divider>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="Deluxe Ocean View Room" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="roomNumber"
              label="Room number"
              rules={[{ required: true, message: 'Room number is required' }]}
            >
              <Input placeholder="A-101" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="roomCode"
              label="Room code"
              rules={[{ required: true, message: 'Room code is required' }]}
            >
              <Input placeholder="DLX-OV-101" />
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
          <Col span={8}>
            <Form.Item
              name="size"
              label="Size"
              rules={[{ required: true, message: 'Size is required' }]}
            >
              <Input placeholder="450 sqft" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Spacious deluxe room with ocean view, private balcony, and premium facilities."
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select options={PLATFORM_CATEGORY_OPTIONS} disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="subCategory"
              label="Sub category"
              rules={[{ required: true, message: 'Select a sub category' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={category ? 'Select sub category' : 'Select a category first'}
                loading={subCategoriesLoading}
                options={subCategoryOptions}
                disabled={!category}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Beds & capacity
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="bedType"
              label="Bed type"
              rules={[{ required: true, message: 'Bed type is required' }]}
            >
              <Select options={BED_TYPE_OPTIONS.map((b) => ({ value: b, label: b }))} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="bedCount"
              label="Bed count"
              rules={[{ required: true, message: 'Bed count is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="basePrice"
              label="Base price (GH₵)"
              rules={[{ required: true, message: 'Base price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxAdult"
              label="Max adults"
              rules={[{ required: true, message: 'Max adults is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maxChildren" label="Max children">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Classification
        </Divider>
        <Row gutter={16}>
         
          <Col span={12}>
            <Form.Item
              name="businessCategory"
              label="Business category"
              rules={[{ required: true, message: 'Select a business category' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select business category"
                loading={categoriesLoading}
                options={businessCategoryOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="branch"
              label="Branch"
              rules={[{ required: true, message: 'Select a branch' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select branch"
                loading={shopsLoading}
                options={branchOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Amenities & image
        </Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="otherAmenities" label="Other amenities">
              <Checkbox.Group
                options={ROOM_AMENITIES.map((a) => ({ value: a, label: a }))}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}
              />
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
                hint="Select image — uploads when you save the room"
                heightClass="h-40"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
