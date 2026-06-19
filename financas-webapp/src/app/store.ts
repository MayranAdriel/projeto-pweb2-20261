import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import transactionsReducer from '../features/transactions/transactionsSlice'
import { injectStoreState } from '../services/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
  },
})

injectStoreState(store.getState)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
