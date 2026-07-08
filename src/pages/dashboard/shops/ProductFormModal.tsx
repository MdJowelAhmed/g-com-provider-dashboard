import { useEffect, useMemo, useState } from 'react'
import { Modal, Form, Input, InputNumber, Select, Row, Col, Divider } from 'antd'
import ImageUploader from '../../../components/common/ImageUploader'
import { useGetBusinessCategoriesQuery } from '../../../redux/api/businessCategoryApi'
import { useGetShopsQuery } from '../../../redux/api/shopManagementApi'
import { useGetSubCategoriesQuery } from '../../../redux/api/serviceApi'
import {
  PRODUCT_CATEGORIES,
  type Product,
} from './productTypes'

const PRODUCT_PLATFORM_CATEGORY = 'shop'

export type ProductSubmitValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & {
  imageFile: File | null
}

type Props = {
  open: boolean
  mode: 'add' | 'edit'
  initial?: Product | null
  onCancel: () => void
  submitting?: boolean
  onSubmit: (values: ProductSubmitValues) => void
}

type FormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

const blankValues: FormValues = {
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
  deliveryTime: "",
  subCategory: '',
  branch: '',
  businessCategory: '',
  variants: '',
  tags: '',
  status: 'active',
  hidden: false,
  featured: false,
}

export default function ProductFormModal({
  open,
  mode,
  initial,
  onCancel,
  submitting = false,
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
    { category: PRODUCT_PLATFORM_CATEGORY, page: 1, limit: 100 },
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
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial
      void _id
      void _c
      void _u
      form.setFieldsValue(rest)
    } else {
      form.setFieldsValue(blankValues)
    }
    setSelectedImageFile(null)
  }, [open, mode, initial, form])

  // Prefill default branch / business category once options load — without
  // wiping the image or other fields the user already filled in.
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
      salePrice: values.salePrice ?? null,
      costPrice: values.costPrice ?? null,
      weight: values.weight ?? null,
      imageFile: selectedImageFile,
    })
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit product' : 'Add new product'}
      okText={mode === 'edit' ? 'Save changes' : 'Add product'}
      confirmLoading={submitting}
      onOk={handleOk}
      onCancel={onCancel}
      width={760}
      destroyOnHidden
      centered
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
                hint="Select image — uploads when you click Add product"
                heightClass="h-40"
              />
            </Form.Item>
          </Col>
      
        </Row>

      
        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
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
                placeholder="Select sub category"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="branch"
              label="Branch (shop)"
              // rules={[{ required: true, message: 'Select a branch' }]}
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

        <Divider titlePlacement="start" orientationMargin={0} plain>
          Pricing
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
    </Modal>
  )
}
