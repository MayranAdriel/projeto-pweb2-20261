import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createTransaction, fetchCategories } from '../features/transactions/transactionsSlice'
import type { TransactionType } from '../features/transactions/types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function NewTransactionPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { categories, loading, error } = useAppSelector((state) => state.transactions)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState('')
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setValidationError('')

    if (!amount || !type || !categoryId || !date) {
      setValidationError('Preencha valor, tipo, categoria e data.')
      return
    }

    const numericAmount = Number(amount)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setValidationError('Informe um valor maior que zero.')
      return
    }

    const result = await dispatch(createTransaction({
      amount: numericAmount,
      type,
      categoryId: Number(categoryId),
      date,
      description: description || undefined,
      tag: tag || undefined,
    }))

    if (createTransaction.fulfilled.match(result)) {
      navigate('/transactions')
    }
  }

  return (
    <section className="form-page">
      <h1>Nova transação</h1>
      <p>Registre uma receita ou despesa informando os campos obrigatórios.</p>

      {(validationError || error) && <div className="alert">{validationError || error}</div>}

      <form className="card-form" onSubmit={handleSubmit}>
        <label>
          Valor
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </select>
        </label>
        <label>
          Categoria
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Selecione</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Descrição
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Tag opcional
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="ex.: cartão, pix" />
        </label>
        <button disabled={loading}>{loading ? 'Salvando...' : 'Salvar transação'}</button>
      </form>
    </section>
  )
}
