import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch } from '../../services/api'

export type User = {
  id: number
  username: string
  name: string
}

type AuthResponse = User & { token: string }

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

const savedToken = localStorage.getItem('token')
const savedUser = localStorage.getItem('user')

const initialState: AuthState = {
  token: savedToken,
  user: savedUser ? JSON.parse(savedUser) : null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }) => {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(credentials),
    })
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; username: string; password: string }) => {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(data),
    })
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          name: action.payload.name,
        }
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(state.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Credenciais inválidas.'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          name: action.payload.name,
        }
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(state.user))
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Não foi possível criar a conta.'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
