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
import { useDashboardRole } from '../../../auth/useDashboardRole'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import {
  uploadImageFile,
  useGetPresignedUploadUrlMutation,
} from '../../../redux/api/imageUploadApi'
import {
  PLATFORM_CATEGORY_OPTIONS,
  PRICING_TYPE_OPTIONS,
  businessCategoryToPlatformCategory,
  dashboardRoleToPlatformCategory,
  type PlatformCategory,
  type Service,
  type ServiceFormValues,
} from './serviceTypes'
import { serviceToFormValues } from './serviceMapping'
import { useAuth } from '../../../context/AuthContext'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Service | null
  initialPlatformCategory?: PlatformCategory | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: ServiceFormValues) => void | Promise<void>
}

function defaultPlatformCategory(
  dashboardRole: string,
  businessCategory?: string,
): PlatformCategory {
  if (businessCategory?.trim()) {
    return businessCategoryToPlatformCategory(businessCategory)
  }
  return dashboardRoleToPlatformCategory(dashboardRole)
}

function blankValues(platformCategory: PlatformCategory): ServiceFormValues {
  return {
    name: '',
    serviceCode: '',
    platformCategory,
    subCategory: '',
    businessCategory: '',
    description: '',
    pricingType: 'fixed',
    price: 0,
    duration: '',
    maxBookingPerDay: 10,
    branch: '',
    image: '',
  }
}

export default function ServiceFormDrawer({
  open,
  mode,
  initial,
  initialPlatformCategory,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<ServiceFormValues>()
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [getPresignedUrl] = useGetPresignedUploadUrlMutation()

  const platformCategory = Form.useWatch('platformCategory', form) as PlatformCategory | '' | undefined

  const { data: shopsData, isLoading: shopsLoading } = useGetShopsQuery(
    { page: 1, limit: 100 },
    { skip: !open },
  )
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBusinessCategoriesQuery(
    undefined,
    { skip: !open },
  )
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetSubCategoriesQuery(
    { category: platformCategory as PlatformCategory, page: 1, limit: 100 },
    { skip: !open || !platformCategory },
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

  const subCategoryOptions = useMemo(() => {
    const fromApi = (subCategoriesData?.data ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => ({
        value: item._id,
        label: item.name,
      }))

    if (mode === 'edit' && initial?.subCategoryId) {
      const exists = fromApi.some((option) => option.value === initial.subCategoryId)
      if (!exists) {
        return [
          {
            value: initial.subCategoryId,
            label: initial.subCategoryName ?? initial.subCategoryId,
          },
          ...fromApi,
        ]
      }
    }

    return fromApi
  }, [subCategoriesData?.data, mode, initial?.subCategoryId, initial?.subCategoryName])

  useEffect(() => {
    if (!open) {
      setPendingImageFile(null)
      setIsUploadingImage(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const businessCategory =
      typeof user?.extra?.category === 'string' ? user.extra.category : undefined
    const fallbackPlatform = defaultPlatformCategory(dashboardRole, businessCategory)

    if (mode === 'edit' && initial) {
      setPendingImageFile(null)
      form.setFieldsValue({
        ...serviceToFormValues(initial),
        platformCategory:
          initial.platformCategory ||
          initialPlatformCategory ||
          fallbackPlatform,
      })
      return
    }

    form.setFieldsValue({
      ...blankValues(fallbackPlatform),
      branch: branchOptions[0]?.value ?? '',
      businessCategory: businessCategoryOptions[0]?.value ?? '',
    })
    setPendingImageFile(null)
  }, [
    open,
    mode,
    initial,
    initialPlatformCategory,
    form,
    branchOptions,
    businessCategoryOptions,
    dashboardRole,
    user?.extra?.category,
  ])

  useEffect(() => {
    if (!open || !platformCategory || subCategoriesLoading) return
    const currentSub = form.getFieldValue('subCategory') as string
    if (!currentSub || subCategoryOptions.length === 0) return
    const stillValid = subCategoryOptions.some((option) => option.value === currentSub)
    if (!stillValid) {
      form.setFieldValue('subCategory', '')
    }
  }, [open, platformCategory, subCategoryOptions, subCategoriesLoading, form])

  const handleOk = async () => {
    const values = await form.validateFields()

    let imageUrl = values.image?.trim() ?? ''

    if (pendingImageFile) {
      setIsUploadingImage(true)
      try {
        imageUrl = await uploadImageFile(pendingImageFile, async (payload) => {
          const result = await getPresignedUrl(payload).unwrap()
          return result
        })
        setPendingImageFile(null)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Image upload failed.'
        message.error(errorMessage)
        return
      } finally {
        setIsUploadingImage(false)
      }
    }

    if (!imageUrl) {
      message.error('Please select a cover image.')
      return
    }

    await onSubmit({
      ...values,
      image: imageUrl,
      price: Number(values.price),
      maxBookingPerDay: Number(values.maxBookingPerDay),
      duration: String(values.duration).trim(),
    })
  }

  const isBusy = submitting || isUploadingImage

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
          <Button onClick={onCancel} disabled={isBusy}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOk} loading={isBusy}>
            {isUploadingImage
              ? 'Uploading image…'
              : mode === 'edit'
                ? 'Save changes'
                : 'Add service'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={blankValues(dashboardRoleToPlatformCategory(dashboardRole))}
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
              <Input placeholder="e.g. Home Cleaning Service" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="serviceCode"
              label="Service code"
              rules={[{ required: true, message: 'Code is required' }]}
            >
              <Input placeholder="HC-001" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="image"
              label="Cover image"
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
                autoUpload={false}
                hint="Image uploads when you save the service"
                onFileSelect={setPendingImageFile}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="businessCategory"
              label="Business category"
              // rules={[{ required: true, message: 'Select a business category' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={categoriesLoading}
                options={businessCategoryOptions}
                placeholder="Select business category"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="platformCategory"
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
              // rules={[{ required: true, message: 'Select a sub category' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={subCategoriesLoading}
                options={subCategoryOptions}
                placeholder={
                  platformCategory ? 'Select sub category' : 'Select a category first'
                }
                disabled={!platformCategory}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Professional home cleaning service for apartments and houses."
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing & scheduling
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
              label="Price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="duration"
              label="Duration (hours)"
              rules={[{ required: true, message: 'Duration is required' }]}
            >
              <Input placeholder="3" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxBookingPerDay"
              label="Max bookings / day"
              rules={[{ required: true, message: 'Max bookings is required' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="branch"
              label="Branch (shop)"
              rules={[{ required: true, message: 'Select a branch' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={shopsLoading}
                options={branchOptions}
                placeholder="Select shop branch"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
