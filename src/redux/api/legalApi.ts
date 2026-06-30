import { baseApi } from './baseApi'

export interface LegalDisclaimerDoc {
  _id: string
  type: string
  content: string
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface LegalDisclaimerResponse {
  success: boolean
  message: string
  data: LegalDisclaimerDoc
}

const legalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query<LegalDisclaimerResponse, void>({
      query: () => ({
        url: '/disclaimers/customer-terms-and-conditions',
        method: 'GET',
      }),
    }),
    getPrivacyPolicy: builder.query<LegalDisclaimerResponse, void>({
      query: () => ({
        url: '/disclaimers/customer-privacy-policy',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetTermsAndConditionsQuery, useGetPrivacyPolicyQuery } = legalApi