import { baseApi } from './baseApi'
import {
    clearAuthStorage,
    loginSuccess,
    logout as logoutAction,
    persistAuthStorage,
} from '../slice/authSlice'
import { clearStoredUser } from '../../auth/userProfile'

interface LoginResponse {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: {
        accessToken: string;
        refreshToken?: string;
        role?: string;
    };
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number;
    purpose?: 'forgot' | 'register';
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    data: string | { token: string };
}

function extractVerifyEmailToken(data: VerifyEmailResponse['data']): string | null {
    if (!data) return null;
    if (typeof data === 'string' && data.trim()) return data.trim();
    if (typeof data === 'object' && typeof data.token === 'string' && data.token.trim()) {
        return data.token.trim();
    }
    return null;
}

interface ResetPasswordPayload {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

interface GetMyProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

export interface BusinessProfile {
    _id: string;
    businessName?: string;
    category?: string;
    description?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessLocation?: string;
    businessLogo?: string;
    coverImage?: string;
    paymentsActive?: boolean;
    isBusinessVerified?: boolean;
    socialLinks?: Record<string, string>;
    deliveryMethods?: string[];
    location?: {
        type?: string;
        coordinates?: [number, number];
    };
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    profileImage: string;
    image?: string;
    address: string;
    about?: string;
    status: string;
    isVerified: boolean;
    isOnline?: boolean;
    isDeleted: boolean;
    authProviders: string[];
    business: BusinessProfile | null;
    customer: unknown | null;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

interface UpdateMyProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

export interface UpdateMyProfilePayload {
    name?: string;
    phone?: string;
    address?: string;
    profileImage?: string;
}

export interface BusinessRegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface BusinessRegisterResponse {
    success: boolean;
    message: string;
    data?: {
        accessToken?: string;
        refreshToken?: string;
        role?: string;
    };
}

export interface BusinessSocialLinks {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
}

export const DELIVERY_METHOD = {
    IN_HOUSE_DELIVERY: 'in-house-delivery',
    EXTERNAL_DELIVERY: 'external-delivery',
    PICKUP: 'pickup',
} as const;

export type DeliveryMethodValue =
    (typeof DELIVERY_METHOD)[keyof typeof DELIVERY_METHOD];

export const DELIVERY_METHOD_OPTIONS: {
    value: DeliveryMethodValue;
    label: string;
}[] = [
    { value: DELIVERY_METHOD.IN_HOUSE_DELIVERY, label: 'In-house delivery' },
    { value: DELIVERY_METHOD.EXTERNAL_DELIVERY, label: 'External delivery' },
    { value: DELIVERY_METHOD.PICKUP, label: 'Pickup' },
];

export interface BusinessInformationPayload {
    businessName: string;
    description: string;
    category: string;
    socialLinks: BusinessSocialLinks;
    coverImage: string;
    businessLogo: string;
    businessAddress: string;
    businessLocation: string;
    deliveryMethods: DeliveryMethodValue[];
    latitude: number;
    longitude: number;
    businessPhone: string;
}

export interface BusinessInformationResponse {
    success: boolean;
    message: string;
    data?: BusinessProfile;
}

export interface BusinessInfoVerifyPayload {
    businessProof: string;
    verificationDocumentType: string;
    verificationDocument: string;
}

export interface BusinessInfoVerifyResponse {
    success: boolean;
    message: string;
    data?: BusinessProfile;
}

export interface VerificationDocumentPayload {
    /** Private storage key, e.g. `image/user-….jpg` */
    businessProof?: string;
    verificationDocumentType: string;
    /** Private storage key, e.g. `image/user-….jpg` */
    verificationDocument: string;
}

export interface VerificationDocumentResponse {
    success: boolean;
    message: string;
    data?: BusinessProfile;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: {
                    email: credentials.email,
                    password: credentials.password,
                },
            }),
            async onQueryStarted(credentials, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    const accessToken = data?.data?.accessToken;
                    const role = data?.data?.role;
                    if (!data?.success || !accessToken) return;

                    persistAuthStorage(accessToken)

                    dispatch(
                        loginSuccess({
                            token: accessToken,
                            email: credentials.email,
                            role,
                        }),
                    )
                } catch {
                    // RTK Query handles mutation errors
                }
            },
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation<LoginResponse, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled
                } catch {
                    // still clear local session on logout failure
                } finally {
                    clearAuthStorage()
                    clearStoredUser()
                    dispatch(logoutAction())
                }
            },
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        resentOtp: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: ({ email, oneTimeCode }) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: { email, oneTimeCode },
            }),
            async onQueryStarted(credentials, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled;
                    const token = extractVerifyEmailToken(data?.data);
                    if (!token) return;

                    if (credentials.purpose === 'forgot') {
                        if (typeof localStorage !== 'undefined') {
                            localStorage.setItem('resetPasswordToken', token);
                        }
                        return;
                    }

                    persistAuthStorage(token);
                    dispatch(
                        loginSuccess({
                            token,
                            email: credentials.email,
                        }),
                    );
                } catch {
                    // RTK Query handles mutation errors
                }
            },
            invalidatesTags: ['Auth'],
        }),

        businessRegister: builder.mutation<BusinessRegisterResponse, BusinessRegisterPayload>({
            query: (body) => ({
                url: '/businesses/register',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),
        businessInformation: builder.mutation<BusinessInformationResponse, BusinessInformationPayload>({
            query: (credentials) => ({
                url: '/businesses/information',
                method: 'PATCH',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        businessInfoVerify: builder.mutation<BusinessInfoVerifyResponse, BusinessInfoVerifyPayload>({
            query: (credentials) => ({
                url: '/businesses/information/verify',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                let resetToken: string | null = null
                try {
                    resetToken =
                        typeof localStorage !== 'undefined'
                            ? localStorage.getItem('resetPasswordToken')
                            : null
                } catch {
                    resetToken = null
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: {
                        email: credentials.email,
                        newPassword: credentials.newPassword,
                        confirmPassword: credentials.confirmPassword,
                    },
                    ...(resetToken
                        ? { headers: { authorization: resetToken } }
                        : {}),
                }
            },
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    if (typeof localStorage !== 'undefined') {
                        localStorage.removeItem('resetPasswordToken');
                    }
                } catch {
                    // RTK Query handles mutation errors
                }
            },
            invalidatesTags: ['Auth'],
        }),

        getMyProfile: builder.query<GetMyProfileResponse, void>({
            query: () => ({
                url: '/users/profile',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),

        updateMyProfile: builder.mutation<UpdateMyProfileResponse, UpdateMyProfilePayload>({
            query: (body) => ({
                url: '/users/profile',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),
        verificationDocument: builder.mutation<
            VerificationDocumentResponse,
            VerificationDocumentPayload
        >({
            query: (body) => ({
                url: '/business-verifications/request',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResentOtpMutation,
    useGetMyProfileQuery,
    useLazyGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useBusinessRegisterMutation,
    useBusinessInformationMutation,
    useBusinessInfoVerifyMutation,
    useVerificationDocumentMutation,
} =
    authApi