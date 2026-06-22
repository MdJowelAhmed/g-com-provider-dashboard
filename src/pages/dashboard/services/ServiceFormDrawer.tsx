import { useEffect, useMemo } from 'react'
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
} from 'antd'
import ImageUploader from '../../../components/common/ImageUploader'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
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

  const subCategoryOptions = useMemo(
    () =>
      (subCategoriesData?.data ?? [])
        .filter((item) => item.status === 'active')
        .map((item) => ({
          value: item._id,
          label: item.name,
        })),
    [subCategoriesData?.data],
  )

  useEffect(() => {
    if (!open) return

    const businessCategory =
      typeof user?.extra?.category === 'string' ? user.extra.category : undefined
    const fallbackPlatform = defaultPlatformCategory(dashboardRole, businessCategory)

    if (mode === 'edit' && initial) {
      form.setFieldsValue({
        ...serviceToFormValues(initial),
        platformCategory: initialPlatformCategory ?? fallbackPlatform,
      })
      return
    }

    form.setFieldsValue({
      ...blankValues(fallbackPlatform),
      branch: branchOptions[0]?.value ?? '',
      businessCategory: businessCategoryOptions[0]?.value ?? '',
    })
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
    if (!open || !platformCategory) return
    const currentSub = form.getFieldValue('subCategory') as string
    if (!currentSub) return
    const stillValid = subCategoryOptions.some((option) => option.value === currentSub)
    if (!stillValid && !subCategoriesLoading) {
      form.setFieldValue('subCategory', '')
    }
  }, [open, platformCategory, subCategoryOptions, subCategoriesLoading, form])

  const handlePlatformCategoryChange = () => {
    form.setFieldValue('subCategory', '')
  }

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit({
      ...values,
      price: Number(values.price),
      maxBookingPerDay: Number(values.maxBookingPerDay),
      duration: String(values.duration).trim(),
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
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOk} loading={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Add service'}
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
              rules={[{ required: true, message: 'Image is required' }]}
            >
              <ImageUploader autoUpload hint="Upload a service cover image" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="businessCategory"
              label="Business category"
              rules={[{ required: true, message: 'Select a business category' }]}
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
              rules={[{ required: true, message: 'Select a category' }]}
            >
              <Select
                options={PLATFORM_CATEGORY_OPTIONS}
                placeholder="Select category"
                onChange={handlePlatformCategoryChange}
              />
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
