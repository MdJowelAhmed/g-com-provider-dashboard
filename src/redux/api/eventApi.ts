import { baseApi } from './baseApi'

export interface EventNamedRef {
  _id: string
  name: string
}

export interface EventBranchRef {
  _id: string
  branchName: string
}

export interface EventBusinessRef {
  _id: string
  businessName: string
  category?: string
}

export type EventRelationRef = string | EventNamedRef | EventBranchRef | null | undefined

export interface EventLocation {
  type: 'Point'
  coordinates: [number, number]
}

export interface EventApiDoc {
  _id: string
  business?: EventBusinessRef | string
  createdByAdmin?: boolean
  organizerName?: string
  branch?: EventRelationRef
  name: string
  mainCategory?: string
  subCategory?: EventRelationRef
  businessCategory?: EventRelationRef
  image: string
  description: string
  startTime: string
  endTime: string
  registrationDeadline: string
  location: EventLocation
  maxCapacity: number
  bookedCapacity?: number
  ticketPrice: number
  status?: string
  createdAt: string
  updatedAt: string
}

export interface EventsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface EventsListResponse {
  success: boolean
  message: string
  pagination?: EventsPagination
  data: EventApiDoc[]
}

export interface GetEventsParams {
  page?: number
  limit?: number
  searchTerm?: string
}

export interface EventPayload {
  name: string
  description: string
  startTime: string
  endTime: string
  registrationDeadline: string
  location: EventLocation
  maxCapacity: number
  ticketPrice: number
  image: string
  subCategory?: string
  businessCategory?: string
  organizerName?: string
  branch?: string
}

export interface EventMutationResponse {
  success: boolean
  message: string
  data?: EventApiDoc
}

export type UpdateEventBody = Partial<EventPayload>

export interface UpdateEventArgs {
  id: string
  body: UpdateEventBody
}

const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEvent: builder.mutation<EventMutationResponse, EventPayload>({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    getEvents: builder.query<EventsListResponse, GetEventsParams | undefined>({
      query: (params = {}) => ({
        url: '/events/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['Events'],
    }),
    updateEvent: builder.mutation<EventMutationResponse, UpdateEventArgs>({
      query: ({ id, body }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Events'],
    }),
    deleteEvent: builder.mutation<EventMutationResponse, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),
  }),
})

export const {
  useCreateEventMutation,
  useGetEventsQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi
