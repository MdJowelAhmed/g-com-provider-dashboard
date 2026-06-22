import { baseApi } from './baseApi'

export type ServicePricingType = 'fixed' | 'per_hour' | 'request_a_quote'

export interface ServiceApiDoc {
  _id: string
  business: string
  name: string
  serviceCode: string
  subCategory: string
  businessCategory: string
  branch: string
  description: string
  pricingType: ServicePricingType
  price: number
  duration: string
  maxBookingPerDay: number
  image: string
  status?: string
  createdAt: string
  updatedAt: string
}

export interface ServicesPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ServicesListResponse {
  success: boolean
  message: string
  pagination?: ServicesPagination
  data: ServiceApiDoc[]
}

export interface GetServicesParams {
  page?: number
  limit?: number
}

export interface ServicePayload {
  name: string
  serviceCode: string
  subCategory: string
  businessCategory: string
  description: string
  pricingType: ServicePricingType
  price: number
  duration: string
  maxBookingPerDay: number
  branch: string
  image: string
}

export interface ServiceMutationResponse {
  success: boolean
  message: string
  data?: ServiceApiDoc
}

export type UpdateServiceBody = Partial<ServicePayload>

export interface UpdateServiceArgs {
  id: string
  body: UpdateServiceBody
}

export type SubCategoryStatus = 'active' | 'inactive'

export interface SubCategoryDoc {
  _id: string
  name: string
  category: string
  parent: string | null
  status: SubCategoryStatus
  createdAt: string
  updatedAt: string
}

export interface SubCategoriesPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface SubCategoriesListResponse {
  success: boolean
  message: string
  pagination: SubCategoriesPagination
  data: SubCategoryDoc[]
}

export interface GetSubCategoriesParams {
  category: string
  page?: number
  limit?: number
}

const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createService: builder.mutation<ServiceMutationResponse, ServicePayload>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Services'],
    }),
    getServices: builder.query<ServicesListResponse, GetServicesParams | undefined>({
      query: (params = {}) => ({
        url: '/services/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Services'],
    }),
    updateService: builder.mutation<ServiceMutationResponse, UpdateServiceArgs>({
      query: ({ id, body }) => ({
        url: `/services/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Services'],
    }),
    deleteService: builder.mutation<ServiceMutationResponse, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),
    getSubCategories: builder.query<SubCategoriesListResponse, GetSubCategoriesParams>({
      query: (params) => ({
        url: '/sub-categories',
        method: 'GET',
        params,
      }),
      providesTags: ['SubCategory'],
    }),
  }),
})

export const {
  useCreateServiceMutation,
  useGetServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetSubCategoriesQuery,
} = serviceApi
