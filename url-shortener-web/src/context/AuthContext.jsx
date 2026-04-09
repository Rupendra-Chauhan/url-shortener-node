import { createContext, useMemo, useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'url_shortener_token'
const USER_KEY = 'url_shortener_user'

// eslint-disable-next-line react-refresh/only-export-components -- context + provider co-located
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY)
      const u = localStorage.getItem(USER_KEY)
      if (t) setToken(t)
      if (u) setUser(JSON.parse(u))
    } catch {
      /* ignore */
    }
    setReady(true)
  }, [])

  const login = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      isLoggedIn: Boolean(token),
      login,
      logout
    }),
    [token, user, ready, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
