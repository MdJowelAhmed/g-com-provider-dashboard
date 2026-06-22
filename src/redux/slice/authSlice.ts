import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { decodeJwtPayload } from '../../auth/jwt'

const TOKEN_KEY = 'token'

export type AuthState = {
  token: string | null
  role: string | null
  email: string | null
}

function readStoredAuth(): AuthState {
  if (typeof localStorage === 'undefined') {
    return { token: null, role: null, email: null }
  }

  const token = localStorage.getItem(TOKEN_KEY)
  const claims = token ? decodeJwtPayload(token) : null

  return {
    token,
    role: claims?.role ?? null,
    email: claims?.email ?? null,
  }
}

const initialState: AuthState = readStoredAuth()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; email?: string; role?: string }>,
    ) => {
      state.token = action.payload.token
      const claims = decodeJwtPayload(action.payload.token)
      state.email = action.payload.email ?? claims?.email ?? null
      state.role = action.payload.role ?? claims?.role ?? null
    },

    logout: (state) => {
      state.token = null
      state.email = null
      state.role = null
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer

export function clearAuthStorage() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('role')
  localStorage.removeItem('email')
  localStorage.removeItem('refreshToken')
}

export function persistAuthStorage(token: string) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

