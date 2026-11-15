import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import CelestialAurora from './components/CelestialAurora'
import WhatsAppAdmin from './components/WhatsAppAdmin'
import Beranda from './pages/Beranda'
import Katalog from './pages/Katalog'

/* Lazy loading rute sekunder agar bundle awal lebih ringan & loading instan */
const Login = lazy(() => import('./pages/Login'))
const Otp = lazy(() => import('./pages/Otp'))
const CaraOrder = lazy(() => import('./pages/CaraOrder'))
const FaqPage = lazy(() => import('./pages/Faq'))
const Checkout = lazy(() => import('./pages/Checkout'))

function Layout({ children, hideNav }) {
  const { user, logout } = useApp()
  return (
    <>
      {!hideNav && <Navbar user={user} onLogout={logout} />}
      <main className={hideNav ? 'main--no-nav' : ''}>{children}</main>
      <LoginModal />
      <footer>

        <span>© 2026 GO Closerz · A little closer to your bias.</span>
      </footer>
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
    <Suspense fallback={null}>
      <Routes>
        {/* Halaman Autentikasi Login & OTP */}
        <Route
          path="/login"
          element={user ? <Navigate to="/beranda" replace /> : <Login onLogin={login} />}
        />
        <Route
          path="/otp"
          element={user ? <Navigate to="/beranda" replace /> : <Otp onVerify={login} />}
        />

        {/* Halaman Publik (Pengunjung umum dapat membuka beranda, katalog, cara order, faq) */}
        <Route
          path="/beranda"
          element={
            <Layout>
              <Beranda />
            </Layout>
          }
        />
        <Route
          path="/katalog"
          element={
            <Layout>
              <Katalog />
            </Layout>
          }
        />
        <Route
          path="/cara-order"
          element={
            <Layout>
              <CaraOrder />
            </Layout>
          }
        />
        <Route
          path="/faq"
          element={
            <Layout>
              <FaqPage />
            </Layout>
          }
        />

        {/* Halaman Checkout: Khusus pengguna yang sudah login */}
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

        {/* Saat pertama kali membuka website langsung membuka halaman Beranda */}
        <Route path="/" element={<Navigate to="/beranda" replace />} />
        <Route path="*" element={<Navigate to="/beranda" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/go-closerz">
      <AppProvider>
        <CelestialAurora />
        <AppRoutes />
        <WhatsAppAdmin />
      </AppProvider>
    </BrowserRouter>
  )
}
