import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchCategories, fetchTransactions, setFilters } from '../features/transactions/transactionsSlice'
import type { TransactionType } from '../features/transactions/types'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, categories, loading, error, page, totalPages, filters } = useAppSelector((state) => state.transactions)
  const [type, setType] = useState<TransactionType | ''>(filters.type ?? '')
  const [categoryId, setCategoryId] = useState(filters.categoryId ?? '')
  const [startDate, setStartDate] = useState(filters.startDate ?? '')
  const [endDate, setEndDate] = useState(filters.endDate ?? '')

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchTransactions({ page: 0 }))
  }, [dispatch])

  function handleFilter(event: FormEvent) {
    event.preventDefault()
    const newFilters = { type, categoryId, startDate, endDate }
    dispatch(setFilters(newFilters))
    dispatch(fetchTransactions({ page: 0, filters: newFilters }))
  }

  function goToPage(nextPage: number) {
    dispatch(fetchTransactions({ page: nextPage }))
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Transações</h1>
          <p>Listagem cronológica de receitas e despesas.</p>
        </div>
        <Link className="button" to="/transactions/new">Nova transação</Link>
      </div>

      <form className="filters" onSubmit={handleFilter}>
        <select value={type} onChange={(e) => setType(e.target.value as TransactionType | '')}>
          <option value="">Todos os tipos</option>
          <option value="INCOME">Receita</option>
          <option value="EXPENSE">Despesa</option>
        </select>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button>Filtrar</button>
      </form>

      {error && <div className="alert">{error}</div>}
      {loading && <p>Carregando...</p>}

      <div className="panel table-panel">
        <table>
          <thead>
            <tr><th>Tipo</th><th>Valor</th><th>Categoria</th><th>Data</th><th>Descrição</th><th>Tag</th></tr>
          </thead>
          <tbody>
            {items.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                <td>{money.format(transaction.amount)}</td>
                <td>{transaction.categoryName}</td>
                <td>{new Date(`${transaction.date}T00:00:00`).toLocaleDateString('pt-BR')}</td>
                <td>{transaction.description || '-'}</td>
                <td>{transaction.tag || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page <= 0 || loading} onClick={() => goToPage(page - 1)}>Anterior</button>
        <span>Página {page + 1} de {Math.max(totalPages, 1)}</span>
        <button disabled={page + 1 >= totalPages || loading} onClick={() => goToPage(page + 1)}>Próxima</button>
      </div>
    </section>
  )
}
