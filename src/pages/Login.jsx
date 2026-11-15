import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const USERS_KEY = 'gc_users'
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

const Icon = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

import { HERO_CARDS } from '../data'
import CardArtwork from '../components/CardArtwork'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [notice, setNotice] = useState('')

  // State untuk LINE OAuth Modal
  const [showLineModal, setShowLineModal] = useState(false)
  const [lineCustomEmail, setLineCustomEmail] = useState('closer.cye@line.me')

  const isLogin = mode === 'login'

  // Periksa apakah ada callback dari LINE Login API resmi via query code
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const emailFromLine = sessionStorage.getItem('gc_line_auth_email') || 'closer.line@line.me'
      sessionStorage.setItem('gc_pending_email', emailFromLine)
      sessionStorage.setItem('gc_pending_provider', 'LINE')
      navigate('/otp', { state: { email: emailFromLine, provider: 'LINE' }, replace: true })
    }
  }, [searchParams, navigate])

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

  // Konfirmasi otorisasi LINE -> Lanjut ke Halaman OTP
  const handleConfirmLineAuth = (e) => {
    e.preventDefault()
    const targetEmail = lineCustomEmail.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(targetEmail)) {
      setErr('Format email akun LINE belum benar.')
      return
    }
    setShowLineModal(false)
    sessionStorage.setItem('gc_pending_email', targetEmail)
    sessionStorage.setItem('gc_pending_provider', 'LINE')
    navigate('/otp', { state: { email: targetEmail, provider: 'LINE' } })
  }

  const submit = (e) => {
    e.preventDefault()
    setErr(''); setNotice('')
    const users = read(USERS_KEY, {})
    const em = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(em)) return setErr('Format email belum benar.')
    if (pass.length < 6) return setErr('Kata sandi minimal 6 karakter.')

    if (mode === 'signup') {
      if (users[em]) return setErr('Email ini sudah terdaftar. Silakan masuk.')
      users[em] = pass
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      // Arahkan ke OTP untuk verifikasi keaslian email pendaftar baru
      sessionStorage.setItem('gc_pending_email', em)
      sessionStorage.setItem('gc_pending_provider', 'Email')
      navigate('/otp', { state: { email: em, provider: 'Email' } })
      return
    } else if (users[em] !== pass) {
      if (!users[em]) {
        users[em] = pass
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
        sessionStorage.setItem('gc_pending_email', em)
        sessionStorage.setItem('gc_pending_provider', 'Email')
        navigate('/otp', { state: { email: em, provider: 'Email' } })
        return
      }
      return setErr('Email atau kata sandi salah.')
    }

    // Arahkan ke OTP untuk verifikasi email asli sebelum masuk
    sessionStorage.setItem('gc_pending_email', em)
    sessionStorage.setItem('gc_pending_provider', 'Email')
    navigate('/otp', { state: { email: em, provider: 'Email' } })
  }

  return (
    <main className="login">
      <div className="login-wrap">
        <section className="login-screen" aria-label="Masuk ke GO Closerz">
          <div className="login-grid">
            <div className="login-card">
              <h2 className="card-title">{isLogin ? 'Welcome back, Closer.' : 'Join the Closerz.'}</h2>
              <p className="card-sub">{isLogin ? 'Masuk untuk mengelola pesanan & koleksi photocard-mu.' : 'Buat akun dalam sekejap untuk mulai berbelanja.'}</p>

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

              <div className="login-divider" aria-hidden="true">
                <span>atau gunakan email</span>
              </div>

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

              <div className="login-footer-action">
                <p className="swap">
                  {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                  <button type="button" className="link" onClick={() => switchTo(isLogin ? 'signup' : 'login')}>
                    {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                  </button>
                </p>
                <p className="login-note">
                  <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></Icon>
                  <span>100% aman untuk Group Order & photocard resmi CYE.</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="login-hero" id="login-intro" aria-label="Pengenalan koleksi photocard">
          <h1 className="login-title">A little closer.<span>A lot more you.</span></h1>
          <p className="login-lead">Satu tempat untuk bias dan kartu favoritmu. Masuk dulu, lalu temukan koleksi yang paling kamu.</p>
          <div className="login-cards" aria-label="Photocard pilihan">
            <i className="twinkle t1">✦</i><i className="twinkle t2">✦</i><i className="twinkle t3">✦</i>
            {HERO_CARDS.map((c, i) => (
              <div key={c.name} className={`lc lc${i} collector-card tone-${c.tone}`}>
                <CardArtwork card={{ ...c, no: c.no }} />
              </div>
            ))}
          </div>
        </section>
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
                  Kode verifikasi OTP 6 digit akan dikirimkan ke email ini.
                </small>
              </div>
            </div>

            <div className="line-modal-actions">
              <button
                type="button"
                className="btn-line-capsule btn-modal-confirm"
                onClick={handleConfirmLineAuth}
              >
                <span>Izinkan &amp; Lanjut Verifikasi OTP →</span>
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
