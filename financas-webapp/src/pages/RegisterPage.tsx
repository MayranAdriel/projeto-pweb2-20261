import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { register } from '../features/auth/authSlice'

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setValidationError('')

    if (!name.trim() || !username.trim() || !password.trim()) {
      setValidationError('Preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 6) {
      setValidationError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    const result = await dispatch(register({ name, username, password }))
    if (register.fulfilled.match(result)) navigate('/', { replace: true })
  }

  return (
    <section className="auth-card">
      <h1>Criar conta</h1>
      <p>Cadastre-se para começar a registrar suas transações.</p>

      {(validationError || error) && <div className="alert">{validationError || error}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Usuário ou e-mail
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>

      <p className="muted">Já tem conta? <Link to="/login">Entrar</Link></p>
    </section>
  )
}
