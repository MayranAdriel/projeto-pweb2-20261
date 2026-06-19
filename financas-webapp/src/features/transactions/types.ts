export type TransactionType = 'INCOME' | 'EXPENSE'

export type Category = {
  id: number
  name: string
}

export type Transaction = {
  id: number
  amount: number
  type: TransactionType
  categoryId: number
  categoryName: string
  date: string
  description?: string
  tag?: string
}

export type CreateTransactionData = {
  amount: number
  type: TransactionType
  categoryId: number
  date: string
  description?: string
  tag?: string
}
