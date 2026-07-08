import { baseApi } from './baseApi'

export interface ProductNamedRef {
  _id: string
  name: string
}

export interface ProductBranchRef {
  _id: string
  branchName: string
}

export type ProductRelationRef = string | ProductNamedRef | ProductBranchRef | null | undefined

export type ProductStatus = 'active' | 'draft' | 'archive' | 'archived' | string

export interface ProductApiDoc {
  _id: string
  business: string
  branch?: ProductRelationRef
  name: string
  mainCategory?: string
  subCategory?: ProductRelationRef
  businessCategory?: ProductRelationRef
  image: string
  description: string
  deliveryMethod?: string
  sku?: string
  deliveryTime?: number | string
  deliveryFee?: number
  price: number
  status?: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ProductsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ProductsListResponse {
  success: boolean
  message: string
  pagination?: ProductsPagination
  data: ProductApiDoc[]
}

export interface GetProductsParams {
  page?: number
  limit?: number
}

export interface ProductPayload {
  name: string
  price: number
  deliveryFee: number
  deliveryTime: string
  image: string
  description: string
  subCategory?: string
  branch?: string
  businessCategory?: string
}

export interface ProductMutationResponse {
  success: boolean
  message: string
  data?: ProductApiDoc
}

export type UpdateProductBody = Partial<ProductPayload>

export interface UpdateProductArgs {
  id: string
  body: UpdateProductBody
}

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation<ProductMutationResponse, ProductPayload>({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
    getProducts: builder.query<ProductsListResponse, GetProductsParams | undefined>({
      query: (params = {}) => ({
        url: '/products/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Products'],
    }),
    updateProduct: builder.mutation<ProductMutationResponse, UpdateProductArgs>({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<ProductMutationResponse, string>({
      query: (id) => ({
        url: `/products/${id}/soft-delete`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
})

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
