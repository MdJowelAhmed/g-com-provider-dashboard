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
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    // Backend returns the reset token in the "data" field
    data: string;
}

interface ResetPasswordPayload {
    newPassword: string;
    confirmNewPassword: string;
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
            query: (credentials) => ({
                url: '/auth/verify-email',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // Safely store the reset token from response.data into localStorage
                    if (data?.data) {
                        try {
                            if (typeof localStorage !== 'undefined') {
                                localStorage.setItem('resetPasswordToken', data.data);
                            }
                        } catch {
                            // ignore storage errors
                        }
                    }
                } catch {
                    // ignore errors; normal RTK Query error handling will apply
                }
            },
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                // Read the reset token that was returned from verify-email
                let resetToken: string | null = null;
                try {
                    resetToken = typeof localStorage !== 'undefined'
                        ? localStorage.getItem('resetPasswordToken')
                        : null;
                } catch {
                    resetToken = null;
                }

                const headers: Record<string, string> = {};
                if (resetToken) {
                    // Backend expects this token in the Authorization header
                    headers.Authorization = resetToken;
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: credentials,
                    headers,
                };
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
} =
    authApi