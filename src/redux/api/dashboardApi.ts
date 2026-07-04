import { baseApi } from './baseApi'

export interface DashboardOverviewData {
  totalOrders: number
  totalSalesAmount: number
  totalProducts: number
  totalRevenueAmount: number
}

export interface DashboardStatsResponse {
  success: boolean
  message: string
  data: DashboardOverviewData
}

export interface MonthlyRevenuePoint {
  month: number
  monthName: string
  revenue: number
}

export interface MonthlyRevenueData {
  year: number
  data: MonthlyRevenuePoint[]
}

export interface MonthlyRevenueResponse {
  success: boolean
  message: string
  data: MonthlyRevenueData
}

export interface GetMonthlyRevenueParams {
  year: number
}

export interface PeriodSummaryData {
  range: number
  from: string
  to: string
  completedOrders: number
  totalProducts: number
  newMessages: number
  averageRating: number
  totalReviews: number
}

export interface PeriodSummaryResponse {
  success: boolean
  message: string
  data: PeriodSummaryData
}

export interface GetPeriodSummaryParams {
  range: number
}

export interface RecentOrderCustomer {
  _id: string
  name: string
}

export interface RecentOrder {
  _id: string
  orderId: string
  customer: RecentOrderCustomer
  status: string
  paymentStatus?: string
  createdAt: string
  updatedAt: string
}

export interface RecentOrdersResponse {
  success: boolean
  message: string
  data: RecentOrder[]
}

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => ({
        url: '/businesses/analytics/overview',
        method: 'GET',
      }),
      providesTags: ['DashboardStats'],
    }),
    getMonthlyRevenue: builder.query<MonthlyRevenueResponse, GetMonthlyRevenueParams>({
      query: ({ year }) => ({
        url: '/businesses/analytics/monthly-revenue',
        method: 'GET',
        params: { year },
      }),
      providesTags: ['DashboardStats'],
    }),
    getPeriodSummary: builder.query<PeriodSummaryResponse, GetPeriodSummaryParams>({
      query: ({ range }) => ({
        url: '/businesses/analytics/period-summary',
        method: 'GET',
        params: { range },
      }),
      providesTags: ['DashboardStats'],
    }),
    getRecentOrders: builder.query<RecentOrdersResponse, void>({
      query: () => ({
        url: '/businesses/analytics/recent-orders',
        method: 'GET',
      }),
      providesTags: ['DashboardStats'],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetMonthlyRevenueQuery,
  useGetPeriodSummaryQuery,
  useGetRecentOrdersQuery,
} = dashboardApi
