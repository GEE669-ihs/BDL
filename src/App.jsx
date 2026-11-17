import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
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

/* Scroll ke Layar Paling Atas Setiap Kali Rute / Halaman Berpindah */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
  }, [pathname])

  return null
}

/* Persistent Layout: Navbar tetap hidup dan tidak di-unmount saat berpindah rute */
function Layout({ children, hideNav }) {
  const { user, logout } = useApp()
  return (
    <>
      {!hideNav && <Navbar user={user} onLogout={logout} />}
      <main className={hideNav ? 'main--no-nav' : ''}>
        {children || (
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        )}
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
      {/* Halaman Autentikasi Login & OTP */}
      <Route
        path="/login"
        element={
          <Suspense fallback={null}>
            {user ? <Navigate to="/beranda" replace /> : <Login onLogin={login} />}
          </Suspense>
        }
      />
      <Route
        path="/otp"
        element={
          <Suspense fallback={null}>
            {user ? <Navigate to="/beranda" replace /> : <Otp onVerify={login} />}
          </Suspense>
        }
      />

      {/* Rute Utama dengan Persistent Layout: Navbar tidak unmount saat ganti halaman */}
      <Route element={<Layout />}>
        <Route path="/beranda" element={<Beranda />} />
        <Route path="/katalog" element={<Katalog />} />
        <Route path="/cara-order" element={<CaraOrder />} />
        <Route path="/faq" element={<FaqPage />} />
      </Route>

      {/* Halaman Checkout: Khusus pengguna yang sudah login (tanpa navbar) */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout hideNav>
              <Suspense fallback={null}>
                <Checkout />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Saat pertama kali membuka website langsung membuka halaman Beranda */}
      <Route path="/" element={<Navigate to="/beranda" replace />} />
      <Route path="*" element={<Navigate to="/beranda" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/go-closerz">
      <AppProvider>
        <ScrollToTop />
        <CelestialAurora />
        <AppRoutes />
        <WhatsAppAdmin />
      </AppProvider>
    </BrowserRouter>
  )
}
