import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, loginModalReason } = useApp()
  const navigate = useNavigate()

  if (!loginModalOpen) return null

  const handleGoLogin = () => {
    setLoginModalOpen(false)
    navigate('/login')
  }

  return (
    <div
      className="auth-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={() => setLoginModalOpen(false)}
    >
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <button
            type="button"
            className="auth-modal-close"
            onClick={() => setLoginModalOpen(false)}
            aria-label="Tutup dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="auth-modal-body">
          <h2 id="auth-modal-title" className="auth-modal-title">
            Masuk Akun untuk Memesan Photocard
          </h2>
          <p className="auth-modal-desc">
            Silakan masuk atau daftar terlebih dahulu untuk{' '}
            <strong className="auth-highlight-action">{loginModalReason || 'menambahkan photocard ke keranjang'}</strong>.
          </p>

          <div className="auth-perks-box">
            <div className="auth-perks-header">
              <span>Mengapa akun diperlukan untuk belanja?</span>
            </div>
            <div className="auth-perks-list">
              <div className="auth-perk-item">
                <div className="auth-perk-text">
                  <strong>Notifikasi Pembayaran</strong>
                  <small>Konfirmasi instan saat pembayaran DP &amp; pelunasan diterima admin.</small>
                </div>
              </div>
              <div className="auth-perk-item">
                <div className="auth-perk-text">
                  <strong>Status Persiapan Batch</strong>
                  <small>Update berkala saat album &amp; photocard disiapkan dari Korea.</small>
                </div>
              </div>
              <div className="auth-perk-item">
                <div className="auth-perk-text">
                  <strong>Live Tracking Resi Pengiriman</strong>
                  <small>Pantau posisi paket batch pesananmu hingga tiba di alamat tujuan.</small>
                </div>
              </div>
              <div className="auth-perk-item">
                <div className="auth-perk-text">
                  <strong>Konfirmasi Tiba &amp; Ulasan</strong>
                  <small>Pemberitahuan barang sampai, kirim bukti foto paket, dan beri review.</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-modal-actions">
          <button
            type="button"
            className="btn primary wide auth-btn-login"
            onClick={handleGoLogin}
          >
            <span>Masuk / Daftar Akun Sekarang</span>
          </button>
          <button
            type="button"
            className="auth-btn-dismiss"
            onClick={() => setLoginModalOpen(false)}
          >
            Lanjut Lihat-Lihat Dulu
          </button>
        </div>
      </div>
    </div>
  )
}
