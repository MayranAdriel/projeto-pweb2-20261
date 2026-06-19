import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setValidationError('')

    if (!username.trim() || !password.trim()) {
      setValidationError('Preencha usuário/e-mail e senha.')
      return
    }

    const result = await dispatch(login({ username, password }))
    if (login.fulfilled.match(result)) {
      const from = location.state?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    }
  }

  return (
    <section className="auth-card">
      <h1>Entrar</h1>
      <p>Acesse sua conta para gerenciar suas finanças.</p>

      {(validationError || error) && <div className="alert">{validationError || error}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Usuário ou e-mail
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>

      <p className="muted">Ainda não tem conta? <Link to="/register">Cadastre-se</Link></p>
    </section>
  )
}
