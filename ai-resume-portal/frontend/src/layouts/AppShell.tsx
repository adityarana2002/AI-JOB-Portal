import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

interface AppShellProps {
  title: string
  roleLabel: string
  roleBadgeClass: string
  navItems: NavItem[]
}

const AppShell = ({ title, roleLabel, roleBadgeClass, navItems }: AppShellProps) => {
  const { user, logout } = useAuth()

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand brand-inline">
          <img className="brand-logo brand-logo-sidebar" src={new URL('../images/app-logo.png', import.meta.url).href} alt="ScreenIQ" />
        </div>

        <div className="nav-section-label">Navigation</div>
        <div className="nav-group">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-info__name">{user?.fullName}</div>
              <div className="user-info__role">{user?.email}</div>
            </div>
          </div>
          <span className={`badge ${roleBadgeClass}`} style={{ marginBottom: '12px', display: 'inline-flex' }}>{roleLabel}</span>
          <button className="button secondary sm" style={{ width: '100%' }} onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <h2>{title}</h2>
          <div className="topbar-right">
            <span className="badge accent">{user?.email}</span>
          </div>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
