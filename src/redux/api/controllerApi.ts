import { baseApi } from './baseApi'

export type ControllerApiStatus = 'pending' | 'active' | 'inactive' | 'suspended'

export interface ControllerApiDoc {
  _id: string
  business: string
  user: string
  roleName: string
  permissions: string[]
  status: ControllerApiStatus | string
  createdAt: string
  updatedAt: string
  staffEmail: string
  staffName: string
}

export interface ControllersPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface ControllersListResponse {
  success: boolean
  message: string
  pagination: ControllersPagination
  data: ControllerApiDoc[]
}

export interface GetControllersParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface ControllerPayload {
  name: string
  email: string
  roleName: string
  permissions: string[]
}

export interface ControllerMutationResponse {
  success: boolean
  message: string
  data?: ControllerApiDoc
}

export type UpdateControllerBody = Partial<ControllerPayload> & {
  status?: ControllerApiStatus | string
}

export interface UpdateControllerArgs {
  id: string
  body: UpdateControllerBody
}

const controllerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createController: builder.mutation<ControllerMutationResponse, ControllerPayload>({
      query: (body) => ({
        url: '/business-staffs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Controllers'],
    }),
    getControllers: builder.query<ControllersListResponse, GetControllersParams | undefined>({
      query: (params = {}) => ({
        url: '/business-staffs',
        method: 'GET',
        params,
      }),
      providesTags: ['Controllers'],
    }),
    updateController: builder.mutation<ControllerMutationResponse, UpdateControllerArgs>({
      query: ({ id, body }) => ({
        url: `/business-staffs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Controllers'],
    }),
    deleteController: builder.mutation<ControllerMutationResponse, string>({
      query: (id) => ({
        url: `/business-staffs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Controllers'],
    }),
  }),
})

export const {
  useCreateControllerMutation,
  useGetControllersQuery,
  useUpdateControllerMutation,
  useDeleteControllerMutation,
} = controllerApi
