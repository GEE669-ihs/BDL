import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Ticker from './Ticker'
import { useApp } from '../context/AppContext'

const money = (n) => 'Rp' + n.toLocaleString('id-ID')

const NAV = [
  {
    to: '/beranda',
    label: 'Beranda',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/katalog',
    label: 'Katalog',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/>
        <rect x="14" y="3" width="7" height="5" rx="1"/>
        <rect x="14" y="12" width="7" height="9" rx="1"/>
        <rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/cara-order',
    label: 'Cara Order',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    to: '/faq',
    label: 'FAQ',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
]

export default function Navbar({ user, onLogout }) {
  const { items, count, total, cart, cartOpen, setCartOpen, toast, requireAuth } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const cartRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  /* Motion glide slider untuk active menu capsule */
  const linkRefs = useRef({})
  const [glideStyle, setGlideStyle] = useState({
    transform: 'translateX(0px)',
    width: 0,
    opacity: 0,
  })

  /* Update koordinat dan ukuran sliding capsule saat rute berganti atau resize */
  useEffect(() => {
    const updateGlide = () => {
      const current = location.pathname === '/' ? '/beranda' : location.pathname
      const target = linkRefs.current[current]
      if (target) {
        setGlideStyle({
          transform: `translateX(${target.offsetLeft}px)`,
          width: target.offsetWidth,
          opacity: 1,
        })
      } else {
        // Ketika di halaman non-menu utama (seperti /login atau /otp)
        setGlideStyle((prev) => ({ ...prev, opacity: 0 }))
      }
    }

    // Hitung posisi sekarang & di next animation frame untuk layout paint selesai
    updateGlide()
    const raf = requestAnimationFrame(updateGlide)

    window.addEventListener('resize', updateGlide)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updateGlide)
    }
  }, [location.pathname])

  /* Navbar makin gelap saat di-scroll (RAF throttled untuk scroll 60+ FPS bebas jank) */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20
          setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev))
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Tutup cart saat klik di luar */
  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setCartOpen])

  return (
    <>
      <header className={`top${scrolled ? ' scrolled' : ''}`}>
        <nav className="nav glass-nav">

          {/* Brand Logo di Kiri */}
          <button
            className="nav-logo"
            onClick={() => navigate('/beranda')}
            aria-label="GO Closerz Beranda"
          >
            <span className="logo-sparkle" aria-hidden="true">✦</span>
            <span>GO Closerz</span>
          </button>

          {/* Menu Links: Capsule Terpisah & Sliding Motion (Tampil di Desktop & Tablet Landscape) */}
          <div className="nav-links">
            {/* Active capsule glow yang meluncur mulus */}
            <span
              className="nav-active-glide"
              style={glideStyle}
              aria-hidden="true"
            />

            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                ref={(el) => {
                  if (el) linkRefs.current[to] = el
                }}
                className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
              >
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="nav-right" ref={cartRef}>
            {/* Cart button */}
            <button
              className={`glass-btn cart-btn${count > 0 ? ' cart-btn--has-items' : ''}`}
              onClick={() => setCartOpen((o) => !o)}
              aria-label={`Keranjang, ${count} item`}
            >
              <span className="cart-icon">🛒</span>
              <span className="cart-btn-text">Keranjang</span>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </button>

            {/* User Logout atau Tombol Capsule Masuk */}
            {user ? (
              <button className="glass-btn user-btn" onClick={onLogout} title={`Keluar dari ${user}`}>
                <span className="user-avatar">{user?.[0]?.toUpperCase() ?? '?'}</span>
                <span className="user-label">Keluar</span>
              </button>
            ) : (
              <button
                className="glass-btn nav-login-btn"
                onClick={() => navigate('/login')}
                aria-label="Masuk ke Akun Closerz"
              >
                <span className="login-avatar-icon" aria-hidden="true">✦</span>
                <span className="login-label">Masuk</span>
              </button>
            )}

            {/* Mobile Backdrop saat Cart Buka */}
            {cartOpen && (
              <div
                className="cart-mobile-backdrop"
                onClick={() => setCartOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Cart Dropdown / Mobile Sheet */}
            {cartOpen && (
              <div className="cart-dropdown glass-panel">
                <div className="cart-header">
                  <span>🛒 Keranjangmu</span>
                  <button className="cart-close" onClick={() => setCartOpen(false)} aria-label="Tutup keranjang">✕</button>
                </div>

                {items.length === 0 ? (
                  <div className="cart-empty">
                    <span>✦</span>
                    <p>Keranjang masih kosong.</p>
                    <button className="btn-sm" onClick={() => { setCartOpen(false); navigate('/katalog') }}>
                      Lihat Katalog
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {items.map((c) => (
                        <div key={c.id} className="cart-row">
                          <div className="cart-thumb">
                            {c.image ? (
                              <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            ) : (
                              '✦'
                            )}
                          </div>
                          <div className="cart-info">
                            <span className="cart-name">{c.name}</span>
                            <span className="cart-group">{c.group}</span>
                          </div>
                          <div className="cart-price-col">
                            <span className="cart-qty">× {cart[c.id]}</span>
                            <span className="cart-price">{money(c.price * cart[c.id])}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-footer">
                      <div className="cart-total-row">
                        <span>Total</span>
                        <span className="cart-total-price">{money(total)}</span>
                      </div>
                      <button
                        className="cart-checkout-btn"
                        onClick={() => {
                          setCartOpen(false)
                          if (!user) {
                            requireAuth('melakukan checkout pesanan photocard')
                            return
                          }
                          navigate('/checkout')
                        }}
                      >
                        Lanjut ke Checkout →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </nav>

        {/* Tulisan Berjalan (Ticker) di Bawah Navbar */}
        <Ticker />

        {toast && (
          <div className="cart-toast" role="status" aria-live="polite">
            <span className="toast-icon">✓</span>
            <span>{toast}</span>
          </div>
        )}
      </header>

      {/* Floating Bottom Nav Dock khusus Layar HP & Tablet Portrait (< 768px) */}
      <nav className="mobile-bottom-dock" aria-label="Navigasi Bawah">
        <div className="mobile-dock-inner">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-dock-item${isActive ? ' mobile-dock-item--active' : ''}`}
            >
              <span className="mobile-dock-icon" aria-hidden="true">{icon}</span>
              <span className="mobile-dock-label">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
