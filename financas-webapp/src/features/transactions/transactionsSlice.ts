import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiFetch } from '../../services/api'
import type { Category, CreateTransactionData, Transaction, TransactionType } from './types'
import type { RootState } from '../../app/store'

type PageResponse<T> = {
  content: T[]
  number: number
  totalPages: number
  totalElements: number
}

type Filters = {
  type?: TransactionType | ''
  categoryId?: string
  startDate?: string
  endDate?: string
}

type TransactionsState = {
  items: Transaction[]
  categories: Category[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  filters: Filters
}

const initialState: TransactionsState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
  page: 0,
  totalPages: 0,
  filters: {},
}

function normalizeTransaction(transaction: Transaction): Transaction {
  return { ...transaction, amount: Number(transaction.amount) }
}

export const fetchCategories = createAsyncThunk('transactions/fetchCategories', async () => {
  return apiFetch<Category[]>('/categories')
})

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: { page?: number; filters?: Filters } | undefined, { getState }) => {
    const state = getState() as RootState
    const page = params?.page ?? state.transactions.page ?? 0
    const filters = params?.filters ?? state.transactions.filters
    const query = new URLSearchParams({ page: String(page), size: '10', sort: 'date,desc' })

    if (filters.type) query.set('type', filters.type)
    if (filters.categoryId) query.set('categoryId', filters.categoryId)
    if (filters.startDate) query.set('startDate', filters.startDate)
    if (filters.endDate) query.set('endDate', filters.endDate)

    return apiFetch<PageResponse<Transaction>>(`/transactions?${query.toString()}`)
  },
)

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: CreateTransactionData) => {
    return apiFetch<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
)

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters(state, action: { payload: Filters }) {
      state.filters = action.payload
      state.page = 0
    },
    clearTransactionError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.content.map(normalizeTransaction)
        state.page = action.payload.number
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Erro ao buscar transações.'
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(normalizeTransaction(action.payload))
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Erro ao criar transação.'
      })
  },
})

export const { setFilters, clearTransactionError } = transactionsSlice.actions
export default transactionsSlice.reducer
