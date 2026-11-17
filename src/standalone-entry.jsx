import * as React from 'react'
import { useEffect } from 'react'
import * as ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

// Make React available globally in case any un-imported component accesses it
window.React = React

import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import CelestialAurora from './components/CelestialAurora'
import WhatsAppAdmin from './components/WhatsAppAdmin'
import Beranda from './pages/Beranda'
import Katalog from './pages/Katalog'
import Login from './pages/Login'
import Otp from './pages/Otp'
import CaraOrder from './pages/CaraOrder'
import FaqPage from './pages/Faq'
import Checkout from './pages/Checkout'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const screen = document.getElementById('phoneScreen') || window
    if (screen.scrollTo) {
      screen.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname])
  return null
}

function Layout({ children, hideNav }) {
  const { user, logout } = useApp()
  return (
    <>
      {!hideNav && <Navbar user={user} onLogout={logout} />}
      <main className={hideNav ? 'main--no-nav' : ''}>
        {children || <Outlet />}
      </main>
      <LoginModal />
      {!hideNav && (
        <footer>
          <span>© 2026 GO Closerz · A little closer to your bias.</span>
        </footer>
      )}
    </>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, login } = useApp()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/beranda" replace /> : <Login onLogin={login} />}
      />
      <Route
        path="/otp"
        element={user ? <Navigate to="/beranda" replace /> : <Otp onVerify={login} />}
      />

      <Route element={<Layout />}>
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/cara-order" element={<CaraOrder />} />
        <Route path="/faq" element={<FaqPage />} />
      </Route>

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout hideNav>
              <Checkout />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/beranda" replace />} />
      <Route path="*" element={<Navigate to="/beranda" replace />} />
    </Routes>
  )
}

export default function StandaloneApp() {
  return (
    <HashRouter>
      <AppProvider>
        <ScrollToTop />
        <CelestialAurora />
        <AppRoutes />
        <WhatsAppAdmin />
      </AppProvider>
    </HashRouter>
  )
}

function mountApp() {
  const rootEl = document.getElementById('root')
  if (rootEl && !rootEl._reactRoot) {
    try {
      const root = ReactDOM.createRoot(rootEl)
      rootEl._reactRoot = root
      root.render(React.createElement(StandaloneApp))
      console.log('GO Closerz Mobile Standalone mounted successfully!')
    } catch (err) {
      console.error('Error mounting StandaloneApp:', err)
      rootEl.innerHTML = `<div style="padding:24px; color:#ff7ccb; font-family:sans-serif;"><h3>Gagal memuat aplikasi</h3><p style="color:#fff; font-size:12px; margin-top:8px;">${err.message}</p></div>`
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp)
} else {
  mountApp()
}
