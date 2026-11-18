import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAuth.css'

export default function FigmaLogin() {
  const navigate = useNavigate()
  const { login } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Silakan masukkan email Anda.' })
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      login(email)
      setMessage({ type: 'success', text: 'Berhasil login! Mengalihkan...' })
      setTimeout(() => {
        navigate('/landing')
      }, 700)
    }, 400)
  }

  return (
    <div className="figma-auth-page" data-node-id="1:169" data-name="login">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION (Node 1:170)
          ───────────────────────────────────────────────────────────── */}
      <header className="figma-auth-header" data-node-id="1:170" data-name="Nav login">
        <div className="figma-auth-header-left">
          {/* Back button (Node 1:203) */}
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => navigate('/landing')}
            data-node-id="1:203"
            aria-label="Kembali ke landing page"
          >
            Back
          </button>

          {/* Logo (Node 1:171) */}
          <Link to="/landing" className="figma-auth-logo" data-node-id="1:171">
            <span className="logo-g" data-node-id="1:172">G</span>
            <span className="logo-star" data-node-id="1:173">★</span>
            <span className="logo-closerz" data-node-id="1:174">Closerz</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB SWITCHER (Node 1:196)
          ───────────────────────────────────────────────────────────── */}
      <div className="figma-auth-tabs-wrap">
        <div className="figma-auth-tabs" data-node-id="1:196" data-name="login/signup">
          <button
            type="button"
            className="figma-auth-tab is-active"
            data-node-id="1:200"
            data-name="login tombol"
          >
            Log In
          </button>
          <Link
            to="/signup-figma"
            className="figma-auth-tab"
            data-node-id="1:197"
            data-name="sign up tombol"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN BODY & CENTER MODAL (Node 1:175 & 1:206)
          ───────────────────────────────────────────────────────────── */}
      <main className="figma-auth-body">
        {/* Floating Background Decorative Cards (Node 1:176) */}
        <div className="figma-auth-cards-decor" data-node-id="1:176" aria-hidden="true">
          {/* Card 1: KAI-R (Node 1:177) */}
          <div className="figma-decor-card card-kair" data-node-id="1:177">
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

          {/* Card 2: YUNA (Node 1:184) */}
          <div className="figma-decor-card card-yuna" data-node-id="1:184">
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

          {/* Card 3: MIRA (Node 1:190) */}
          <div className="figma-decor-card card-mira" data-node-id="1:190">
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

        {/* Center Modal Container (Node 1:206) */}
        <section className="figma-auth-modal" data-node-id="1:206" data-name="tempat login signuup">
          {/* Modal Logo (Node 1:217) */}
          <div className="figma-modal-logo" data-node-id="1:217">
            <span className="logo-g" data-node-id="1:218">G</span>
            <span className="logo-star" data-node-id="1:219">★</span>
            <span className="logo-closerz" data-node-id="1:220">Closerz</span>
          </div>

          {/* Title (Node 1:208) */}
          <h1 className="figma-modal-title" data-node-id="1:208">Welcome Back</h1>

          {/* Login Form */}
          <form className="figma-auth-form" onSubmit={handleSubmit}>
            {/* Email Field (Node 1:209 & 1:210) */}
            <div className="figma-input-group" data-node-id="1:209">
              <input
                type="email"
                className="figma-pill-input"
                placeholder="you@yourmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-label="Email Address"
              />
            </div>

            {/* Password Field (Node 1:211 & 1:212) */}
            <div className="figma-input-group" data-node-id="1:211">
              <input
                type="password"
                className="figma-pill-input"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                aria-label="Password"
              />
            </div>

            {/* Actions Row: Login Button & Forgot Password */}
            <div className="figma-auth-actions-row">
              {/* Login Button (Node 1:213 & 1:214) */}
              <button
                type="submit"
                className="figma-btn-submit"
                disabled={isLoading}
                data-node-id="1:213"
              >
                <span>{isLoading ? 'Loading...' : 'Login'}</span>
                <svg
                  viewBox="0 0 18.3 18.3"
                  fill="none"
                  aria-hidden="true"
                  data-node-id="1:215"
                >
                  <path
                    d="M7.63 14.5a1.2 1.2 0 0 1-.76-.32 1.15 1.15 0 0 1-.09-1.68L10.46 9.16 7.17 5.06a1.18 1.18 0 0 1 1.22-1.96l4.03 4.98a1.2 1.2 0 0 1 0 1.58l-4.03 4.98c-.2.25-.5.38-.76.38z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {/* Forgot Password Link (Node 1:216) */}
              <button
                type="button"
                className="figma-forgot-pwd"
                onClick={() => alert('Fitur reset password telah dikirim ke email Anda.')}
                data-node-id="1:216"
              >
                FORGOT PASSWORD
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
