import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'

// Figma Pages (Frame 1:20 - Landing 1:21, Login 1:169, Sign Up 1:221, Keranjang 1:275)
const LandingPage = lazy(() => import('./components/FigmaLandingPage'))
const Login = lazy(() => import('./components/FigmaLogin'))
const SignUp = lazy(() => import('./components/FigmaSignUp'))
const Keranjang = lazy(() => import('./components/FigmaKeranjang'))
const Checkout = lazy(() => import('./components/FigmaCheckout'))
const Admin = lazy(() => import('./components/FigmaAdmin'))

// Scroll ke atas saat navigasi halaman
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

// Global Toast Notification
function GlobalToast() {
  const { toast } = useApp()
  if (!toast) return null
  return <div className="figma-global-toast">{toast}</div>
}

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Landing Page Figma (Node 1:21) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Halaman Autentikasi Figma */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-figma" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup-figma" element={<SignUp />} />

        {/* Halaman Keranjang Figma (Node 1:275) */}
        <Route path="/keranjang" element={<Keranjang />} />
        <Route path="/keranjang-figma" element={<Keranjang />} />

        {/* Halaman Checkout */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Dashboard Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* Redirect semua rute lama / tidak dikenal ke beranda landing page */}
        <Route path="/beranda" element={<Navigate to="/" replace />} />
        <Route path="/katalog" element={<Navigate to="/" replace />} />
        <Route path="/cara-order" element={<Navigate to="/" replace />} />
        <Route path="/faq" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <ScrollToTop />
        <AppRoutes />
        <GlobalToast />
      </AppProvider>
    </BrowserRouter>
  )
}
