import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAuth.css'

export default function FigmaSignUp() {
  const navigate = useNavigate()
  const { login } = useApp()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Silakan masukkan email Anda.' })
      return
    }

    if (step === 1) {
      setStep(2)
      setMessage(null)
      return
    }

    // Step 2: Set password & complete sign up
    setIsLoading(true)
    setTimeout(() => {
      login(email)
      setMessage({ type: 'success', text: 'Pendaftaran berhasil! Mengalihkan ke halaman...' })
      setTimeout(() => {
        navigate('/landing')
      }, 700)
    }, 400)
  }

  return (
    <div className="figma-auth-page" data-node-id="1:221" data-name="sign up">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION (Node 1:222)
          ───────────────────────────────────────────────────────────── */}
      <header className="figma-auth-header" data-node-id="1:222" data-name="Nav sign up">
        <div className="figma-auth-header-left">
          {/* Back button (Node 1:272) */}
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => navigate('/landing')}
            data-node-id="1:272"
            aria-label="Kembali ke landing page"
          >
            Back
          </button>

          {/* Logo (Node 1:223) */}
          <Link to="/landing" className="figma-auth-logo" data-node-id="1:223">
            <span className="logo-g" data-node-id="1:224">G</span>
            <span className="logo-star" data-node-id="1:225">★</span>
            <span className="logo-closerz" data-node-id="1:226">Closerz</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB SWITCHER (Node 1:268)
          ───────────────────────────────────────────────────────────── */}
      <div className="figma-auth-tabs-wrap">
        <div className="figma-auth-tabs" data-node-id="1:268" data-name="login/signup">
          <Link
            to="/login-figma"
            className="figma-auth-tab"
            data-node-id="1:265"
            data-name="login tombol"
          >
            Log In
          </Link>
          <button
            type="button"
            className="figma-auth-tab is-active"
            data-node-id="1:269"
            data-name="sign up tombol"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN BODY & CENTER MODAL (Node 1:227 & 1:228)
          ───────────────────────────────────────────────────────────── */}
      <main className="figma-auth-body">
        {/* Floating Background Decorative Cards (Node 1:240) */}
        <div className="figma-auth-cards-decor" data-node-id="1:240" aria-hidden="true">
          {/* Card 1: KAI-R (Node 1:241) */}
          <div className="figma-decor-card card-kair" data-node-id="1:241">
            <div className="figma-decor-card-foil" />
            <div className="figma-decor-card-top">
              <span>01</span>
              <span className="figma-decor-card-star">✦</span>
            </div>
            <div className="figma-decor-card-bottom">
              <span className="figma-decor-card-name">KAI-R</span>
              <span className="figma-decor-card-group">NOVA7</span>
            </div>
          </div>

          {/* Card 2: YUNA (Node 1:248) */}
          <div className="figma-decor-card card-yuna" data-node-id="1:248">
            <div className="figma-decor-card-foil" />
            <div className="figma-decor-card-top">
              <span>07</span>
              <span className="figma-decor-card-star">✦</span>
            </div>
            <div className="figma-decor-card-bottom">
              <span className="figma-decor-card-name">YUNA</span>
              <span className="figma-decor-card-group">LUNAR GIRLS</span>
            </div>
          </div>

          {/* Card 3: MIRA (Node 1:254) */}
          <div className="figma-decor-card card-mira" data-node-id="1:254">
            <div className="figma-decor-card-foil" />
            <div className="figma-decor-card-top">
              <span>09</span>
              <span className="figma-decor-card-star">✦</span>
            </div>
            <div className="figma-decor-card-bottom">
              <span className="figma-decor-card-name">MIRA</span>
              <span className="figma-decor-card-group">STELLA-9</span>
            </div>
          </div>
        </div>

        {/* Center Modal Container (Node 1:228 & 1:229) */}
        <section className="figma-auth-modal" data-node-id="1:228" data-name="tempat login signuup">
          {/* Modal Logo (Node 1:261) */}
          <div className="figma-modal-logo" data-node-id="1:261">
            <span className="logo-g" data-node-id="1:262">G</span>
            <span className="logo-star" data-node-id="1:263">★</span>
            <span className="logo-closerz" data-node-id="1:264">Closerz</span>
          </div>

          {/* Title (Node 1:260) */}
          <h1 className="figma-modal-title" data-node-id="1:260">Welcome!</h1>

          {/* Sign Up Form */}
          <form className="figma-auth-form" onSubmit={handleNext}>
            {step === 1 ? (
              /* Field 1: Email with "Enter your mail" badge (Node 1:230) */
              <div className="figma-input-group" data-node-id="1:230" data-name="field 1">
                {/* Floating Badge (Node 1:238 & 1:239) */}
                <div className="figma-input-badge" data-node-id="1:238">
                  Enter your mail
                </div>
                {/* Pill input (Node 1:236 & 1:237) */}
                <input
                  type="email"
                  className="figma-pill-input"
                  placeholder="you@yourmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  autoFocus
                  aria-label="Enter your email"
                />
              </div>
            ) : (
              /* Step 2: Password Setup */
              <div className="figma-input-group">
                <div className="figma-input-badge">
                  Create password
                </div>
                <input
                  type="password"
                  className="figma-pill-input"
                  placeholder="Buat kata sandi aman"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  autoFocus
                  aria-label="Create password"
                />
              </div>
            )}

            {/* Next Button (Node 1:231 - 1:234) */}
            <div className="figma-auth-actions-row">
              <button
                type="submit"
                className="figma-btn-submit"
                disabled={isLoading}
                data-node-id="1:231"
                data-name="next"
              >
                <span data-node-id="1:233">{isLoading ? 'Loading...' : step === 1 ? 'Next' : 'Daftar Sekarang'}</span>
                <svg
                  viewBox="0 0 18.3 18.3"
                  fill="none"
                  aria-hidden="true"
                  data-node-id="1:234"
                >
                  <path
                    d="M7.63 14.5a1.2 1.2 0 0 1-.76-.32 1.15 1.15 0 0 1-.09-1.68L10.46 9.16 7.17 5.06a1.18 1.18 0 0 1 1.22-1.96l4.03 4.98a1.2 1.2 0 0 1 0 1.58l-4.03 4.98c-.2.25-.5.38-.76.38z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {/* Message feedback */}
            {message && (
              <div
                className={`figma-auth-message ${
                  message.type === 'error' ? 'is-error' : 'is-success'
                }`}
                role="status"
              >
                {message.text}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  )
}
