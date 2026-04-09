import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'

import Shorten from './modules/Shorten'
import Qr from './modules/Qr'
import MyData from './modules/MyData'
import Analytics from './modules/Analytics'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="shorten" element={<Shorten />} />
            <Route path="qr" element={<Qr />} />
            <Route
              path="analytics"
              element={
                <RequireAuth>
                  <Analytics />
                </RequireAuth>
              }
            />
            <Route
              path="my-links"
              element={
                <RequireAuth>
                  <MyData />
                </RequireAuth>
              }
            />
            <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
