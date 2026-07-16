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
} from 'antd'
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
import type { MenuFormValues, MenuItem } from './menuTypes'
import { menuItemToFormValues } from './menuMapping'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: MenuItem | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: MenuFormValues) => void | Promise<void>
}

type FormValues = Omit<MenuFormValues, 'imageFile'>

function defaultCategory(
  dashboardRole: string,
  profileCategory?: string,
): PlatformCategory {
  if (profileCategory?.trim()) {
    return businessCategoryToPlatformCategory(profileCategory)
  }
  return dashboardRoleToPlatformCategory(dashboardRole)
}

const blankValues = (category: PlatformCategory): FormValues => ({
  image: '',
  name: '',
  description: '',
  price: 0,
  deliveryFee: 0,
  deliveryTime: '',
  category,
  subCategory: '',
  branch: '',
  businessCategory: '',
})

export default function MenuFormDrawer({
  open,
  mode,
  initial,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>()
  const { user } = useAuth()
  const dashboardRole = useDashboardRole()
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

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
      (categoriesData?.data ?? []).map((cat) => ({
        value: cat._id,
        label: cat.name,
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
    const fallbackCategory = defaultCategory(dashboardRole, profileCategory)

    setSelectedImageFile(null)

    if (mode === 'edit' && initial) {
      form.setFieldsValue({
        ...menuItemToFormValues(initial),
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
      onSubmit({
        ...values,
        imageFile: selectedImageFile,
      })
    } catch {
      // validation errors shown by ant form
    }
  }

  return (
    <Drawer
      open={open}
      title={mode === 'edit' ? 'Edit menu item' : 'Add menu item'}
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
            {mode === 'edit' ? 'Save changes' : 'Add item'}
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
          <Col span={24}>
            <Form.Item
              name="name"
              label="Item name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input placeholder="e.g. Chicken Biryani" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Description is required' }]}
            >
              <Input.TextArea rows={3} placeholder="Describe the dish" />
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
            <Form.Item name="subCategory" label="Sub category">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                loading={subCategoriesLoading}
                options={subCategoryOptions}
                placeholder={category ? 'Select sub category' : 'Select a category first'}
                disabled={!category}
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
                onChange={(url) => form.setFieldValue('image', url)}
                hint="Select image — uploads when you save the item"
                heightClass="h-40"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Classification
        </Divider>
        <Row gutter={16}>
        
          <Col span={12}>
            <Form.Item name="businessCategory" label="Business category">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                loading={categoriesLoading}
                options={businessCategoryOptions}
                placeholder="Select business category"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="branch" label="Branch">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                loading={shopsLoading}
                options={branchOptions}
                placeholder="Select branch"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing & delivery
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
