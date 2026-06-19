import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../features/auth/authSlice'

export function Layout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" to="/">Finanças Pessoais</Link>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/transactions">Transações</NavLink>
          <NavLink to="/transactions/new">Nova transação</NavLink>
        </nav>
        <div className="user-menu">
          <span>{user?.name}</span>
          <button type="button" onClick={handleLogout}>Sair</button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
