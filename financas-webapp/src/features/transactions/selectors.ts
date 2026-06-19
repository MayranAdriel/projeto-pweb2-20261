import type { RootState } from '../../app/store'

const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()

export const selectTransactions = (state: RootState) => state.transactions.items

export const selectCurrentMonthTransactions = (state: RootState) =>
  state.transactions.items.filter((transaction) => {
    const date = new Date(`${transaction.date}T00:00:00`)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

export const selectIncomeTotal = (state: RootState) =>
  selectCurrentMonthTransactions(state)
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

export const selectExpenseTotal = (state: RootState) =>
  selectCurrentMonthTransactions(state)
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

export const selectBalance = (state: RootState) => selectIncomeTotal(state) - selectExpenseTotal(state)

export const selectRecentTransactions = (state: RootState) =>
  [...state.transactions.items]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
