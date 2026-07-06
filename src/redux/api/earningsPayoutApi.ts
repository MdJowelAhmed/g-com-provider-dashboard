import { baseApi } from './baseApi'

export type MomoProvider = 'MTN' | 'Vodafone' | 'AirtelTigo'

export interface WalletData {
  _id: string
  user: string
  balance: number
  pendingBalance: number
  totalEarnings: number
  limit: number
  currency: string
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface WalletResponse {
  success: boolean
  message: string
  data: WalletData
}

export interface PaymentAccountVerifyPayload {
  momoNumber: string
  momoProvider: MomoProvider
}

export interface PaymentAccountVerifyData {
  accountName: string
  verificationToken: string
}

export interface PaymentAccountVerifyResponse {
  success: boolean
  statusCode?: number
  message: string
  data: PaymentAccountVerifyData
}

export interface SavePaymentAccountPayload {
  verificationToken: string
}

export interface PaymentAccountData {
  _id: string
  business: string
  isActive: boolean
  momoName: string
  momoNumber: string
  momoProvider: MomoProvider | string
  createdAt: string
  updatedAt: string
}

export interface SavePaymentAccountResponse {
  success: boolean
  message: string
  data?: PaymentAccountData
}

export interface UpdatePaymentAccountPayload {
  verificationToken: string
}

export interface UpdatePaymentAccountResponse {
  success: boolean
  message: string
  data?: PaymentAccountData
}

export interface GetPaymentAccountResponse {
  success: boolean
  message: string
  data: PaymentAccountData | null
}

export interface WithdrawEarningsPayload {
  amount: number
}

export interface WithdrawEarningsResponse {
  success: boolean
  message: string
  data?: unknown
}

const earningsPayoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEarningsStats: builder.query<WalletResponse, void>({
      query: () => ({
        url: '/wallets/mine',
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),
    paymentAccountVerify: builder.mutation<
      PaymentAccountVerifyResponse,
      PaymentAccountVerifyPayload
    >({
      query: (payload) => ({
        url: '/payment-accounts/verify',
        method: 'POST',
        body: payload,
      }),
    }),
    savePaymentAccount: builder.mutation<
      SavePaymentAccountResponse,
      SavePaymentAccountPayload
    >({
      query: (payload) => ({
        url: '/payment-accounts',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['PaymentAccount'],
    }),
    getPaymentAccount: builder.query<GetPaymentAccountResponse, void>({
      query: () => ({
        url: '/payment-accounts',
        method: 'GET',
      }),
      providesTags: ['PaymentAccount'],
    }),

    updatePaymentAccount: builder.mutation<UpdatePaymentAccountResponse, UpdatePaymentAccountPayload>({
      query: (payload) => ({
        url: '/payment-accounts',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['PaymentAccount'],
    }),

    withdrawEarnings: builder.mutation<WithdrawEarningsResponse, WithdrawEarningsPayload>({
      query: (payload) => ({
        url: '/withdraws',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Wallet'],
    }),
  }),
})

export const {
  useGetEarningsStatsQuery,
  usePaymentAccountVerifyMutation,
  useSavePaymentAccountMutation,
  useGetPaymentAccountQuery,
  useUpdatePaymentAccountMutation,
  useWithdrawEarningsMutation,
} = earningsPayoutApi
