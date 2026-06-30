import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../store'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL + '/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const stateToken = (getState() as RootState).auth.token
            const token =
                stateToken ??
                (typeof localStorage !== 'undefined'
                    ? localStorage.getItem('token')
                    : null)
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
 tagTypes: [
  'Auth',
  'Category',
  'Chats',

  'DailySafetyReports',
  'Customers',
  'Payment',
  'Notification',
  'Promotions',
  'Users',
  'Controllers',
  'Events',
  'Shops',
  'BusinessCategories',
  'HubPosts',
  'Services',
  'Products',
  'SubCategory',
  'Rooms',
  'Setting',
  'ProviderOrders',
],
  
   
    endpoints: () => ({}),
})

export const imageUrl = import.meta.env.VITE_API_BASE_URL
export const socketUrl = import.meta.env.VITE_API_BASE_URL 
