import { baseApi } from './baseApi'

export type HubPostPanel = 'hub' | 'business' | 'both'

export interface HubPostApiDoc {
  _id: string
  author: string
  business: string
  itemId: string
  panel: HubPostPanel
  itemPrice: number
  startDate: string
  endDate: string
  category?: string
  caption: string
  media: string
  likesCount?: number
  commentCount?: number
  shareCount?: number
  isTrending?: boolean
  searchText?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface HubPostsPagination {
  total: number
  limit: number
  page: number
  totalPage: number
}

export interface HubPostsListResponse {
  success: boolean
  message: string
  pagination: HubPostsPagination
  data: HubPostApiDoc[]
}

export interface GetHubPostsParams {
  page?: number
  limit?: number
}

export interface HubPostPayload {
  itemId: string
  panel: HubPostPanel
  caption: string
  media: string
  itemPrice: number
  startDate: string
  endDate: string
}

export interface HubPostMutationResponse {
  success: boolean
  message: string
  data?: HubPostApiDoc
}

export type UpdateHubPostBody = Partial<HubPostPayload>

export interface UpdateHubPostArgs {
  id: string
  body: UpdateHubPostBody
}

const hubPostApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createHubPost: builder.mutation<HubPostMutationResponse, HubPostPayload>({
      query: (body) => ({
        url: '/hub-posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HubPosts'],
    }),
    getHubPosts: builder.query<HubPostsListResponse, GetHubPostsParams | undefined>({
      query: (params = {}) => ({
        url: '/hub-posts/mine',
        method: 'GET',
        params,
      }),
      providesTags: ['HubPosts'],
    }),
    updateHubPost: builder.mutation<HubPostMutationResponse, UpdateHubPostArgs>({
      query: ({ id, body }) => ({
        url: `/hub-posts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['HubPosts'],
    }),
    deleteHubPost: builder.mutation<HubPostMutationResponse, string>({
      query: (id) => ({
        url: `/hub-posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HubPosts'],
    }),
  }),
})

export const {
  useCreateHubPostMutation,
  useGetHubPostsQuery,
  useUpdateHubPostMutation,
  useDeleteHubPostMutation,
} = hubPostApi
