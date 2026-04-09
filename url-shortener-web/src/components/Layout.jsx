import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/shorten', label: 'Shorten' },
    { to: '/app/qr', label: 'QR' },
    ...(isLoggedIn
      ? [
          { to: '/app/analytics', label: 'Analytics' },
          { to: '/app/my-links', label: 'My links' },
          { to: '/app/profile', label: 'Profile' }
        ]
      : [])
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">LS</div>
          <div>
            <div className="brand-title">LinkShort</div>
            <div className="brand-sub">Short links + QR</div>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {navItems.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                isActive ? 'side-link active' : 'side-link'
              }
              end={i.to === '/app'}
            >
              {i.label}
            </NavLink>
          ))}
        </nav>

        <div className="side-footer">
          <div className="side-user">
            <div className="avatar">{(user?.phone || 'G').slice(-2)}</div>
            <div>
              <div className="side-user-main">
                {isLoggedIn ? user?.phone : 'Guest'}
              </div>
              <div className="side-user-sub">
                {isLoggedIn ? 'Signed in' : 'Not signed in'}
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              className="btn secondary"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              Log out
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/login')}
            >
              Log in
            </button>
          )}
        </div>
      </aside>

      <div className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

