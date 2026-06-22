import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from './api/baseApi'
import './api/authApi'
import './api/shopManagementApi'
import './api/businessCategoryApi'
import './api/controllerApi'
import './api/hubPostApi'
import './api/serviceApi'
import authReducer from './slice/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
