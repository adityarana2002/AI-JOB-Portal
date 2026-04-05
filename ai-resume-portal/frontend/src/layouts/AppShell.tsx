import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export interface NavItem {
  label: string
  to: string
}

interface AppShellProps {
  title: string
  roleLabel: string
  navItems: NavItem[]
}

const AppShell = ({ title, roleLabel, navItems }: AppShellProps) => {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">AI Resume Portal</div>
        <div className="nav-group">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">
          <div>{roleLabel}</div>
          <div style={{ marginTop: '8px' }}>{user?.fullName}</div>
          <button className="button secondary" style={{ marginTop: '16px' }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <h2>{title}</h2>
          <span className="badge">{user?.email}</span>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
