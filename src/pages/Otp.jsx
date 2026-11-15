import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DEFAULT_EMAIL = 'closer.cye@line.me'
const OTP_STORAGE_KEY = 'gc_pending_otp'
const EMAIL_STORAGE_KEY = 'gc_pending_email'

export default function Otp({ onVerify }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Ambil email dari location.state atau sessionStorage
  const [email, setEmail] = useState(() => {
    return location.state?.email || sessionStorage.getItem(EMAIL_STORAGE_KEY) || DEFAULT_EMAIL
  })
  const provider = location.state?.provider || sessionStorage.getItem('gc_pending_provider') || 'LINE'

  // Simpan OTP 6 digit
  const [targetOtp, setTargetOtp] = useState(() => {
    const saved = sessionStorage.getItem(OTP_STORAGE_KEY)
    if (saved) return saved
    const generated = String(Math.floor(100000 + Math.random() * 900000))
    sessionStorage.setItem(OTP_STORAGE_KEY, generated)
    return generated
  })

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const inputsRef = useRef([])

  // Simpan email ke sessionStorage jika belum ada
  useEffect(() => {
    if (email) {
      sessionStorage.setItem(EMAIL_STORAGE_KEY, email)
    }
  }, [email])

  // Countdown timer 60s
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true)
      return
    }
    const id = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(id)
  }, [timer])

  // Auto focus input pertama saat halaman dimuat
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }, [])

  const handleChange = (val, idx) => {
    setErr('')
    const char = val.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[idx] = char
    setDigits(newDigits)

    // Pindah ke kotak berikutnya jika angka diisi
    if (char && idx < 5 && inputsRef.current[idx + 1]) {
      inputsRef.current[idx + 1].focus()
    }
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0 && inputsRef.current[idx - 1]) {
      inputsRef.current[idx - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    setErr('')
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ''
    }
    setDigits(newDigits)

    const focusIdx = Math.min(pasted.length, 5)
    if (inputsRef.current[focusIdx]) {
      inputsRef.current[focusIdx].focus()
    }
  }

  const handleAutoFill = () => {
    const chars = targetOtp.split('')
    setDigits(chars)
    setErr('')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (inputsRef.current[5]) {
      inputsRef.current[5].focus()
    }
  }

  const handleResend = () => {
    if (!canResend) return
    const newCode = String(Math.floor(100000 + Math.random() * 900000))
    setTargetOtp(newCode)
    sessionStorage.setItem(OTP_STORAGE_KEY, newCode)
    setDigits(['', '', '', '', '', ''])
    setTimer(60)
    setCanResend(false)
    setErr('')
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus()
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    setErr('')
    const entered = digits.join('')

    if (entered.length < 6) {
      return setErr('Mohon masukkan seluruh 6 digit kode OTP.')
    }

    if (entered !== targetOtp) {
      return setErr('Kode OTP tidak sesuai. Silakan periksa kembali.')
    }

    setSuccess(true)
    // Bersihkan sesi OTP
    sessionStorage.removeItem(OTP_STORAGE_KEY)
    sessionStorage.removeItem(EMAIL_STORAGE_KEY)
    sessionStorage.removeItem('gc_pending_provider')

    setTimeout(() => {
      onVerify(email)
      navigate('/beranda', { replace: true })
    }, 900)
  }

  return (
    <main className="otp-page">
      <div className="otp-container">
        <div className="otp-card">
          {/* Badge Icon Header */}
          <div className="otp-icon-wrap" aria-hidden="true">
            {provider === 'LINE' ? (
              <svg className="otp-line-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>

          <h1 className="otp-title">Verifikasi Email Anda</h1>
          <p className="otp-sub">
            {provider === 'LINE' ? 'LINE Authentication berhasil. ' : ''}
            Kami telah mengirimkan 6 digit kode OTP verifikasi ke email asli Anda:
          </p>
          <div className="otp-email-badge">
            <span className="otp-email-text">{email}</span>
          </div>

          {/* Banner Bantuan Simulasi OTP untuk Testing */}
          <div className="otp-demo-hint">
            <div className="otp-hint-content">
              <span className="hint-label">Kode Verifikasi Simulasi:</span>
              <strong className="hint-code">{targetOtp}</strong>
            </div>
            <button
              type="button"
              className="hint-btn"
              onClick={handleAutoFill}
              aria-label="Isi kode OTP otomatis"
            >
              {copied ? '✓ Terisi' : 'Isi Cepat'}
            </button>
          </div>

          <form onSubmit={handleVerify} noValidate>
            {/* Input 6 Digit Box */}
            <div className="otp-inputs" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={success}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`otp-box ${digit ? 'filled' : ''}`}
                  aria-label={`Digit ke-${idx + 1}`}
                />
              ))}
            </div>

            {err && <p className="err otp-err" role="alert">{err}</p>}
            {success && (
              <p className="success otp-success" role="status">
                ✓ Email terverifikasi! Mengalihkan ke Beranda...
              </p>
            )}

            <button
              type="submit"
              className="btn primary wide otp-submit-btn"
              disabled={success}
            >
              <span>{success ? 'Berhasil Terverifikasi' : 'Verifikasi & Masuk ke Beranda'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>

          {/* Resend Timer & Kembali ke Login */}
          <div className="otp-footer">
            <div className="otp-resend">
              {canResend ? (
                <button
                  type="button"
                  className="link-resend"
                  onClick={handleResend}
                >
                  Kirim Ulang Kode OTP
                </button>
              ) : (
                <span className="timer-text">
                  Kirim ulang kode dalam <b>{timer}s</b>
                </span>
              )}
            </div>

            <button
              type="button"
              className="otp-back-link"
              onClick={() => navigate('/login')}
            >
              ← Kembali ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
