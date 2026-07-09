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
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import type { MenuFormValues, MenuItem } from './menuTypes'
import { menuItemToFormValues } from './menuMapping'

const MENU_PLATFORM_CATEGORY = 'dine'

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: MenuItem | null
  submitting?: boolean
  onCancel: () => void
  onSubmit: (values: MenuFormValues) => void | Promise<void>
}

type FormValues = Omit<MenuFormValues, 'imageFile'>

const blankValues: FormValues = {
  image: '',
  name: '',
  description: '',
  price: 0,
  deliveryFee: 0,
  deliveryTime: '',
  subCategory: '',
  branch: '',
  businessCategory: '',
}

export default function MenuFormDrawer({
  open,
  mode,
  initial,
  submitting = false,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm<FormValues>()
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  const { data: shopsData, isLoading: shopsLoading } = useGetShopsQuery(
    { page: 1, limit: 100 },
    { skip: !open },
  )
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBusinessCategoriesQuery(
    undefined,
    { skip: !open },
  )
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useGetSubCategoriesQuery(
    { category: MENU_PLATFORM_CATEGORY, page: 1, limit: 100 },
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
        .map((item) => ({
          value: item._id,
          label: item.name,
        })),
    [subCategoriesData?.data],
  )

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initial) {
      form.setFieldsValue(menuItemToFormValues(initial))
    } else {
      form.setFieldsValue(blankValues)
    }
    setSelectedImageFile(null)
  }, [open, mode, initial, form])

  useEffect(() => {
    if (!open || mode !== 'add') return
    if (!form.getFieldValue('branch') && branchOptions[0]) {
      form.setFieldValue('branch', branchOptions[0].value)
    }
    if (!form.getFieldValue('businessCategory') && businessCategoryOptions[0]) {
      form.setFieldValue('businessCategory', businessCategoryOptions[0].value)
    }
  }, [open, mode, form, branchOptions, businessCategoryOptions])

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit({
      ...values,
      imageFile: selectedImageFile,
    })
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
      <Form form={form} layout="vertical" initialValues={blankValues} requiredMark="optional">
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
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item name="subCategory" label="Sub category">
              <Select
                showSearch
                allowClear
                optionFilterProp="label"
                loading={subCategoriesLoading}
                options={subCategoryOptions}
                placeholder="Select sub category"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
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
              label="Price ($)"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="deliveryFee"
              label="Delivery fee ($)"
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
