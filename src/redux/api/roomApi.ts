import { baseApi } from './baseApi'

export interface RoomNamedRef {
  _id: string
  name: string
}

export interface RoomBranchRef {
  _id: string
  branchName: string
}

export type RoomRelationRef = string | RoomNamedRef | RoomBranchRef | null | undefined

export interface RoomApiDoc {
  _id: string
  business: string
  name: string
  roomNumber: string
  roomCode: string
  roomType: string
  bedType: string
  size: string
  basePrice: number
  mainCategory?: string
  subCategory?: RoomRelationRef
  businessCategory?: RoomRelationRef
  branch?: RoomRelationRef
  image: string
  description: string
  bedCount: number
  maxAdult: number
  maxChildren: number
  totalGuest: number
  otherAmenities: string[]
  status?: string
  createdAt: string
  updatedAt: string
}

export interface RoomsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface RoomsListResponse {
  success: boolean
  message: string
  pagination?: RoomsPagination
  data: RoomApiDoc[]
}

export interface GetRoomsParams {
  page?: number
  limit?: number
}

export interface RoomPayload {
  name: string
  roomNumber: string
  roomCode: string
  roomType: string
  bedType: string
  size: string
  basePrice: number
  subCategory: string
  businessCategory: string
  description: string
  bedCount: number
  maxAdult: number
  maxChildren: number
  totalGuest: number
  otherAmenities: string[]
  branch: string
  image: string
}

export interface RoomMutationResponse {
  success: boolean
  message: string
  data?: RoomApiDoc
}

export type UpdateRoomBody = Partial<RoomPayload>

export interface UpdateRoomArgs {
  id: string
  body: UpdateRoomBody
}

const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<RoomMutationResponse, RoomPayload>({
      query: (body) => ({
        url: '/rooms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Rooms'],
    }),
    getRooms: builder.query<RoomsListResponse, GetRoomsParams | undefined>({
      query: (params = {}) => ({
        url: '/rooms/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Rooms'],
    }),
    updateRoom: builder.mutation<RoomMutationResponse, UpdateRoomArgs>({
      query: ({ id, body }) => ({
        url: `/rooms/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Rooms'],
    }),
    deleteRoom: builder.mutation<RoomMutationResponse, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rooms'],
    }),
  }),
})

export const {
  useCreateRoomMutation,
  useGetRoomsQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi
