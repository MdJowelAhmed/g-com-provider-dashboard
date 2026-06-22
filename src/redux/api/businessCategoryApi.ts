import { baseApi } from './baseApi'

export type BusinessCategoryStatus = 'active' | 'inactive'

export interface BusinessCategoryDoc {
  _id: string
  name: string
  business: string
  parent: string | null
  status: BusinessCategoryStatus
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface BusinessCategoriesListResponse {
  success: boolean
  message: string
  data: BusinessCategoryDoc[]
}

export interface BusinessCategoryPayload {
  name: string
}

export interface BusinessCategoryMutationResponse {
  success: boolean
  message: string
  data?: BusinessCategoryDoc
}

export type UpdateBusinessCategoryBody = Partial<BusinessCategoryPayload> & {
  status?: BusinessCategoryStatus
}

export interface UpdateBusinessCategoryArgs {
  id: string
  body: UpdateBusinessCategoryBody
}

const businessCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBusinessCategory: builder.mutation<
      BusinessCategoryMutationResponse,
      BusinessCategoryPayload
    >({
      query: (body) => ({
        url: '/business-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BusinessCategories'],
    }),
    getBusinessCategories: builder.query<BusinessCategoriesListResponse, void>({
      query: () => ({
        url: '/business-categories/my-categories',
        method: 'GET',
      }),
      providesTags: ['BusinessCategories'],
    }),
    updateBusinessCategory: builder.mutation<
      BusinessCategoryMutationResponse,
      UpdateBusinessCategoryArgs
    >({
      query: ({ id, body }) => ({
        url: `/business-categories/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['BusinessCategories'],
    }),
    deleteBusinessCategory: builder.mutation<BusinessCategoryMutationResponse, string>({
      query: (id) => ({
        url: `/business-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BusinessCategories'],
    }),
  }),
})

export const {
  useCreateBusinessCategoryMutation,
  useGetBusinessCategoriesQuery,
  useUpdateBusinessCategoryMutation,
  useDeleteBusinessCategoryMutation,
} = businessCategoryApi
