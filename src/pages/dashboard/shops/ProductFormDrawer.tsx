import { useEffect, useMemo, useState } from 'react'
import { Drawer, Form, Input, InputNumber, Select, Row, Col, Divider, Button, Space } from 'antd'
import ImageUploader from '../../../components/common/ImageUploader'
import { useDashboardRole } from '../../../auth/useDashboardRole'
import { useAuth } from '../../../context/AuthContext'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import {
  PLATFORM_CATEGORY_OPTIONS,
  businessCategoryToPlatformCategory,
  dashboardRoleToPlatformCategory,
  type PlatformCategory,
} from '../services/serviceTypes'
import {
  PRODUCT_CATEGORIES,
  type Product,
} from './productTypes'

export type ProductSubmitValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  imageFile: File | null
}

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Product | null
  onCancel: () => void
  submitting?: boolean
  onSubmit: (values: ProductSubmitValues) => void | Promise<void>
}

type FormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  platformCategory: PlatformCategory | ''
}

function defaultPlatformCategory(
  dashboardRole: string,
  profileCategory?: string,
): PlatformCategory {
  if (profileCategory?.trim()) {
    return businessCategoryToPlatformCategory(profileCategory)
  }
  return dashboardRoleToPlatformCategory(dashboardRole)
}

const blankValues = (platformCategory: PlatformCategory): FormValues => ({
  image: '',
  name: '',
  sku: '',
  description: '',
  category: PRODUCT_CATEGORIES[0],
  brand: '',
  price: 0,
  salePrice: null,
  costPrice: null,
  stock: 0,
  lowStockThreshold: 5,
  weight: null,
  deliveryMethod: 'external-delivery',
  deliveryFee: 0,
  deliveryTime: '',
  platformCategory,
  subCategory: '',
  branch: '',
  businessCategory: '',
  variants: '',
  tags: '',
  status: 'active',
  hidden: false,
  featured: false,
})

export default function ProductFormDrawer({
  open,
  mode,
  initial,
  onCancel,
  submitting = false,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>()
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const platformCategory = Form.useWatch('platformCategory', form) as
    | PlatformCategory
    | ''
    | undefined

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

    const profileCategory =
      typeof user?.extra?.category === 'string' ? user.extra.category : undefined
    const fallbackPlatform = defaultPlatformCategory(dashboardRole, profileCategory)

    setSelectedImageFile(null)

    if (mode === 'edit' && initial) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial
      void _id
      void _c
      void _u
      form.setFieldsValue({
        ...rest,
        platformCategory: rest.category
          ? dashboardRoleToPlatformCategory(rest.category)
          : fallbackPlatform,
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
    form,
    branchOptions,
    businessCategoryOptions,
    dashboardRole,
    user?.extra?.category,
  ])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const { platformCategory: _platformCategory, ...rest } = values
      void _platformCategory
      await onSubmit({
        ...rest,
        salePrice: rest.salePrice ?? null,
        costPrice: rest.costPrice ?? null,
        weight: rest.weight ?? null,
        imageFile: selectedImageFile,
      })
    } catch {
      // validation errors shown by ant form
    }
  }

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit product' : 'Add new product'}
      onClose={onCancel}
      width={780}
      placement="right"
      destroyOnHidden
      footer={
        <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOk} loading={submitting}>
            {mode === 'edit' ? 'Save changes' : 'Add product'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={blankValues(
          defaultPlatformCategory(dashboardRole, user?.extra?.category),
        )}
        requiredMark="optional"
      >
        <Divider titlePlacement="start" orientationMargin={0} plain>
          Basic info
        </Divider>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Product name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Classic Denim Jacket" />
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
                    if (current?.trim() || selectedImageFile) return
                    throw new Error('Image is required')
                  },
                },
              ]}
            >
              <ImageUploader
                value={form.getFieldValue('image')}
                autoUpload={false}
                onFileSelect={(file) => {
                  setSelectedImageFile(file ?? null)
                  form.setFields([{ name: 'image', errors: [] }])
                }}
                onChange={(url) => {
                  form.setFieldValue('image', url)
                }}
                hint="Select image — uploads when you save the product"
                heightClass="h-40"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Classification
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="platformCategory"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select options={PLATFORM_CATEGORY_OPTIONS} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="subCategory" label="Sub category">
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
          <Col span={8}>
            <Form.Item name="businessCategory" label="Business category">
              <Select
                showSearch
                optionFilterProp="label"
                loading={categoriesLoading}
                options={businessCategoryOptions}
                placeholder="Select business category"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="branch" label="Branch (shop)">
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

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing
        </Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Price (GH₵)"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="deliveryFee"
              label="Delivery fee (GH₵)"
              rules={[{ required: true, message: 'Delivery fee is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="deliveryTime"
              label="Delivery time (days)"
              rules={[{ required: true, message: 'Delivery time is required' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  )
}
