import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const USERS_KEY = 'gc_users'
const SAVED_EMAIL_KEY = 'gc_saved_email'
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

const Icon = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

import { HERO_CARDS } from '../data'
import CardArtwork from '../components/CardArtwork'
import FlipCard from '../components/FlipCard'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(SAVED_EMAIL_KEY) || ''
    } catch {
      return ''
    }
  })
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  // State untuk LINE OAuth Modal
  const [showLineModal, setShowLineModal] = useState(false)
  const [lineCustomEmail, setLineCustomEmail] = useState('closer.cye@line.me')

  // Stage state khusus mobile (dua halaman terpisah yang tidak saling render, persis seperti Beranda)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900)
  const [loginStage, setLoginStage] = useState(0) // 0: Kartu & Teks di Atas, 1: Form Login/Daftar di Bawah
  const stageLockRef = useRef(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  const isLogin = mode === 'login'

  const goToLoginStage = (target) => {
    if (stageLockRef.current) return
    stageLockRef.current = true
    setLoginStage(target)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => {
      stageLockRef.current = false
    }, 400)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Event Listeners: Wheel & Touch Swipe untuk berpindah antar stage di mobile
  useEffect(() => {
    if (!isMobile) return

    const handleWheel = (e) => {
      if (e.target.closest('input, textarea, select')) return
      if (stageLockRef.current) return

      if (e.deltaY > 30 && loginStage === 0) {
        e.preventDefault()
        goToLoginStage(1)
      } else if (e.deltaY < -30 && loginStage === 1) {
        if (window.scrollY <= 5) {
          e.preventDefault()
          goToLoginStage(0)
        }
      }
    }

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
      // Izinkan scroll normal jika berinteraksi di dalam elemen form input/select
      if (e.target.closest('input, textarea, select')) return
      // Kunci layar agar tidak mengalami native pull-to-refresh browser mobile
      if (e.cancelable) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e) => {
      if (e.target.closest('input, textarea, select, button')) return
      if (stageLockRef.current) return

      const deltaY = touchStartY.current - e.changedTouches[0].clientY
      const deltaX = touchStartX.current - e.changedTouches[0].clientX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 40) {
        if (deltaY > 0 && loginStage === 0) {
          goToLoginStage(1)
        } else if (deltaY < 0 && loginStage === 1) {
          if (window.scrollY <= 5) {
            goToLoginStage(0)
          }
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, loginStage])

  // Periksa apakah ada callback dari LINE Login API resmi via query code -> Langsung Masuk
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const emailFromLine = sessionStorage.getItem('gc_line_auth_email') || 'closer.line@line.me'
      try {
        localStorage.setItem(SAVED_EMAIL_KEY, emailFromLine)
      } catch { }
      onLogin(emailFromLine)
      navigate('/beranda', { replace: true })
    }
  }, [searchParams, navigate, onLogin])

  const switchTo = (m) => { setMode(m); setErr(''); setNotice('') }

  // Handler klik tombol LINE
  const handleLineClick = () => {
    const channelId = import.meta.env.VITE_LINE_CHANNEL_ID
    if (channelId) {
      // Hubungkan ke endpoint API LINE OAuth 2.1 Resmi
      const redirectUri = window.location.origin + window.location.pathname
      const state = Math.random().toString(36).substring(7)
      sessionStorage.setItem('gc_line_state', state)
      sessionStorage.setItem('gc_line_auth_email', lineCustomEmail)
      const lineUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid%20email`
      window.location.href = lineUrl
    } else {
      // Buka dialog otorisasi LINE bawaan (LINE Consent Modal)
      setShowLineModal(true)
    }
  }

  // Konfirmasi otorisasi LINE -> Langsung Masuk & Simpan Akun
  const handleConfirmLineAuth = (e) => {
    e.preventDefault()
    const targetEmail = lineCustomEmail.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(targetEmail)) {
      setErr('Format email akun LINE belum benar.')
      return
    }
    try {
      const users = read(USERS_KEY, {})
      users[targetEmail] = users[targetEmail] || 'line_oauth_pass'
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      localStorage.setItem(SAVED_EMAIL_KEY, targetEmail)
    } catch { }
    setShowLineModal(false)
    onLogin(targetEmail)
    navigate('/beranda', { replace: true })
  }

  const submit = (e) => {
    e.preventDefault()
    setErr(''); setNotice('')
    const users = read(USERS_KEY, {})
    const em = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(em)) return setErr('Format email belum benar.')
    if (pass.length < 6) return setErr('Kata sandi minimal 6 karakter.')

    if (mode === 'signup') {
      if (users[em]) return setErr('Email ini sudah terdaftar. Silakan alihkan ke opsi Masuk di bawah.')
      users[em] = pass
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        localStorage.setItem(SAVED_EMAIL_KEY, em)
      } catch (e) {
        console.error('Storage error:', e)
      }
      // Pengguna yang baru mendaftar langsung otomatis login dan diarahkan ke Beranda
      onLogin(em)
      navigate('/beranda', { replace: true })
      return
    } else {
      // User tidak bisa masuk apabila email belum terdaftar
      if (!users[em]) {
        return setErr('Email belum terdaftar. Silakan buat akun terlebih dahulu.')
      }
      if (users[em] !== pass) {
        return setErr('Kata sandi salah. Silakan periksa kembali.')
      }
      try {
        localStorage.setItem(SAVED_EMAIL_KEY, em)
      } catch (e) {
        console.error('Storage error:', e)
      }
      onLogin(em)
      navigate('/beranda', { replace: true })
    }
  }

  const renderHero = (!isMobile || loginStage === 0)
  const renderForm = (!isMobile || loginStage === 1)

  return (
    <main className={`login ${isMobile ? 'login--mobile-staged' : ''}`}>
      {/* Tombol kembali ke Halaman Beranda (dikecilkan agar rapi dan tidak mengganggu tampilan) */}
      <button
        type="button"
        className="login-nav-back-btn"
        onClick={() => navigate('/beranda')}
        aria-label="Kembali ke Beranda"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Beranda</span>
      </button>

      <div className="login-wrap">
        {/* HALAMAN 1 (ATAS PADA MOBILE): TAMPILAN TEKS & KARTU PHOTOCARD */}
        {renderHero && (
          <section
            className="login-hero"
            id="login-intro"
            aria-label="Pengenalan koleksi photocard"
          >
            <h1 className="login-title">Koleksi Photocard<span>Bias Impianmu</span></h1>
            <p className="login-lead">Masuk atau buat akun untuk mengamankan slot photocard official favoritmu.</p>
            <div className="hero-cards" aria-label="Klik kartu untuk membaliknya">
              {HERO_CARDS.map((c, i) => (
                <FlipCard
                  key={c.name}
                  card={c}
                  style={{
                    '--rot': `${c.rot}deg`,
                    '--x': `${c.x}px`,
                    '--y': `${c.y}px`,
                    '--stagger': `${160 + i * 220}ms`,
                    zIndex: c.zIndex ?? (i + 1),
                  }}
                />
              ))}
              <p className="hint">Flip the Photocard</p>
            </div>

            {/* Teks abu-abu di bawah kartu untuk scroll ke form login mobile */}
            {isMobile && (
              <div
                className="login-scroll-hint"
                onClick={() => goToLoginStage(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToLoginStage(1) }}
              >
                <span>scroll untuk buat akun atau login yah closerz</span>
                <span className="login-scroll-hint-arrow" aria-hidden="true">↓</span>
              </div>
            )}
          </section>
        )}

        {/* HALAMAN 2 (BAWAH PADA MOBILE): FORM LOGIN & DAFTAR AKUN */}
        {renderForm && (
          <section
            className="login-screen"
            id="login-form-section"
            aria-label="Masuk ke GO Closerz"
          >
            {isMobile && (
              <div
                className="login-back-hint"
                onClick={() => goToLoginStage(0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToLoginStage(0) }}
              >
                <span>↑ kembali ke pengenalan closerz</span>
              </div>
            )}
            <div className="login-grid">
              <div className="login-card">
                <h2 className="card-title">{isLogin ? 'Welcome back, Closerz.' : 'Join the Closerz.'}</h2>
                <p className="card-sub">{isLogin ? 'Masuk untuk mengelola pesanan & koleksi photocard-mu.' : 'Buat akun dalam sekejap untuk mulai berbelanja.'}</p>

                {/* Form Login / Signup Menggunakan Email */}
                <form onSubmit={submit} noValidate>
                  <label>
                    <span>Email</span>
                    <div className="input-wrap">
                      <span className="input-icon" aria-hidden="true">
                        <Icon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>
                      </span>
                      <input
                        type="email"
                        value={email}
                        placeholder="nama@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label>
                    <span>Kata sandi</span>
                    <div className="input-wrap pw">
                      <span className="input-icon" aria-hidden="true">
                        <Icon><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
                      </span>
                      <input
                        type={show ? 'text' : 'password'}
                        value={pass}
                        placeholder={isLogin ? 'Masukkan kata sandi' : 'Minimal 6 karakter'}
                        onChange={(e) => setPass(e.target.value)}
                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="eye"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        <Icon>
                          {show
                            ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 004.2 4.2" /><path d="M6.3 6.3C3.9 8 2.5 12 2.5 12s3.5 7 9.5 7a9.7 9.7 0 004-.9M9.9 5.1A10 10 0 0112 5c6 0 9.5 7 9.5 7a16 16 0 01-2.2 3.2" /></>
                            : <><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>
                          }
                        </Icon>
                      </button>
                    </div>
                  </label>

                  {err && <p className="err" role="alert">{err}</p>}
                  {notice && <p className="success" role="status">{notice}</p>}

                  <button type="submit" className="btn primary wide submit-btn">
                    <span>{isLogin ? 'Masuk ke GO Closerz' : 'Daftar & Mulai Koleksi'}</span>
                    <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
                  </button>
                </form>

                {/* Divider Opsi Login Alternatif */}
                <div className="login-divider" aria-hidden="true">
                  <span>atau gunakan LINE</span>
                </div>

                {/* Tombol Capsule LINE Glowing */}
                <button
                  type="button"
                  className="btn-line-capsule"
                  onClick={handleLineClick}
                  aria-label="Lanjut masuk dengan akun LINE"
                >
                  <svg className="line-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  <span>Lanjut dengan LINE</span>
                </button>

                <div className="login-footer-action">
                  <p className="swap">
                    {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                    <button type="button" className="link" onClick={() => switchTo(isLogin ? 'signup' : 'login')}>
                      {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                    </button>
                  </p>
                  <div className="login-home-return-wrap">
                    <button
                      type="button"
                      className="login-home-return-link"
                      onClick={() => navigate('/beranda')}
                    >
                      ← Kembali ke Beranda
                    </button>
                  </div>
                  <p className="login-note">{/*  */}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modal Dialog Otorisasi Akun LINE */}
      {showLineModal && (
        <div className="line-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="line-modal-title">
          <div className="line-modal-card">
            <div className="line-modal-header">
              <div className="line-brand-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <span>LINE Login Authorization</span>
              </div>
              <button
                type="button"
                className="line-modal-close"
                onClick={() => setShowLineModal(false)}
                aria-label="Tutup dialog LINE"
              >
                ✕
              </button>
            </div>

            <div className="line-modal-body">
              <h3 id="line-modal-title">Hubungkan Akun LINE ke GO Closerz</h3>
              <p className="line-modal-desc">
                Aplikasi <strong>GO Closerz Official</strong> meminta izin otorisasi untuk mengakses identitas profil dan alamat email asli akun LINE Anda.
              </p>

              <div className="line-permissions-list">
                <div className="line-perm-item">
                  <span className="perm-check">✓</span>
                  <span>Nama tampilan &amp; foto profil akun LINE</span>
                </div>
                <div className="line-perm-item">
                  <span className="perm-check">✓</span>
                  <span>Alamat email resmi untuk notifikasi pesanan photocard</span>
                </div>
              </div>

              <div className="line-email-field">
                <label htmlFor="line-email-input">
                  <span>Konfirmasi Email Akun LINE Anda:</span>
                </label>
                <input
                  id="line-email-input"
                  type="email"
                  value={lineCustomEmail}
                  onChange={(e) => setLineCustomEmail(e.target.value)}
                  placeholder="email.line.kamu@gmail.com"
                  className="line-input"
                  autoFocus
                />
                <small className="line-helper-text">
                  Email ini akan digunakan untuk notifikasi &amp; konfirmasi slot photocard kamu.
                </small>
              </div>
            </div>

            <div className="line-modal-actions">
              <button
                type="button"
                className="btn-line-capsule btn-modal-confirm"
                onClick={handleConfirmLineAuth}
              >
                <span>Izinkan &amp; Masuk Sekarang →</span>
              </button>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowLineModal(false)}
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
