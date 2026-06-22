import { baseApi } from './baseApi'

export type ShopDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface ShopLocation {
  type: 'Point'
  coordinates: [number, number]
}

export interface ShopApiDoc {
  _id: string
  business: string
  branchName: string
  contact: string
  locationName?: string
  location: ShopLocation
  availableDay: ShopDay[]
  openTime?: string
  closeTime?: string
  timeZone: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface ShopsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ShopsListResponse {
  success: boolean
  message: string
  pagination: ShopsPagination
  data: ShopApiDoc[]
}

export interface GetShopsParams {
  page?: number
  limit?: number
}

export interface ShopPayload {
  branchName: string
  contact: string
  locationName: string
  latitude: number
  longitude: number
  openTime: string
  closeTime: string
  availableDay: ShopDay[]
  description: string
}

export interface ShopMutationResponse {
  success: boolean
  message: string
  data?: ShopApiDoc
}

export type UpdateShopBody = Partial<ShopPayload>

export interface UpdateShopArgs {
  id: string
  body: UpdateShopBody
}

export interface ShopFormValues {
  branchName: string
  contact: string
  locationName: string
  latitude: string
  longitude: string
  openTime: string
  closeTime: string
  availableDay: ShopDay[]
  description: string
}

export function toShopPayload(form: ShopFormValues): ShopPayload {
  return {
    branchName: form.branchName.trim(),
    contact: form.contact.trim(),
    locationName: form.locationName.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    openTime: form.openTime,
    closeTime: form.closeTime,
    availableDay: form.availableDay,
    description: form.description.trim(),
  }
}

const shopManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createShop: builder.mutation<ShopMutationResponse, ShopPayload>({
      query: (body) => ({
        url: '/business-branches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shops'],
    }),
    getShops: builder.query<ShopsListResponse, GetShopsParams | undefined>({
      query: (params = {}) => ({
        url: '/business-branches',
        method: 'GET',
        params,
      }),
      providesTags: ['Shops'],
    }),
    updateShop: builder.mutation<ShopMutationResponse, UpdateShopArgs>({
      query: ({ id, body }) => ({
        url: `/business-branches/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Shops'],
    }),
    deleteShop: builder.mutation<ShopMutationResponse, string>({
      query: (id) => ({
        url: `/business-branches/${id}/soft-delete`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shops'],
    }),
  }),
})

export const {
  useCreateShopMutation,
  useGetShopsQuery,
  useUpdateShopMutation,
  useDeleteShopMutation,
} = shopManagementApi
