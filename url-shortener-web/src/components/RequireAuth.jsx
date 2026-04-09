import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { isLoggedIn, ready } = useAuth()
  const location = useLocation()

  if (!ready) return null
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

