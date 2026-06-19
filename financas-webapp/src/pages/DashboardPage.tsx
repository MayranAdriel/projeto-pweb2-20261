import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchTransactions } from '../features/transactions/transactionsSlice'
import {
  selectBalance,
  selectExpenseTotal,
  selectIncomeTotal,
  selectRecentTransactions,
} from '../features/transactions/selectors'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector((state) => state.transactions.loading)
  const balance = useAppSelector(selectBalance)
  const income = useAppSelector(selectIncomeTotal)
  const expense = useAppSelector(selectExpenseTotal)
  const recentTransactions = useAppSelector(selectRecentTransactions)

  useEffect(() => {
    dispatch(fetchTransactions({ page: 0 }))
  }, [dispatch])

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Dashboard financeiro</h1>
          <p>Resumo do mês atual calculado a partir do estado do Redux.</p>
        </div>
        <Link className="button" to="/transactions/new">Nova transação</Link>
      </div>

      <div className="cards">
        <article className="card"><span>Saldo do mês</span><strong>{money.format(balance)}</strong></article>
        <article className="card"><span>Receitas</span><strong>{money.format(income)}</strong></article>
        <article className="card"><span>Despesas</span><strong>{money.format(expense)}</strong></article>
      </div>

      <div className="panel">
        <h2>5 transações mais recentes</h2>
        {loading && <p>Carregando...</p>}
        {!loading && recentTransactions.length === 0 && <p>Nenhuma transação cadastrada.</p>}
        {recentTransactions.map((transaction) => (
          <div className="transaction-row" key={transaction.id}>
            <div>
              <strong>{transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}</strong>
              <span>{transaction.categoryName} • {new Date(`${transaction.date}T00:00:00`).toLocaleDateString('pt-BR')}</span>
            </div>
            <strong>{money.format(transaction.amount)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
