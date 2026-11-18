import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import FigmaCardFan from './FigmaCardFan'
import './FigmaAuth.css'

export default function FigmaKeranjang() {
  const navigate = useNavigate()
  const { cart, count, subtotal, updateQty, remove, clear } = useApp()

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  const isEmpty = !cart || cart.length === 0

  return (
    <div className="figma-cart-page" data-node-id="1:275" data-name="keranjang">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION (Node 1:298)
          ───────────────────────────────────────────────────────────── */}
      <header className="figma-auth-header" data-node-id="1:298" data-name="Nav keranajng">
        <div className="figma-auth-header-left">
          {/* Back button (Node 1:303) */}
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => navigate('/landing')}
            data-node-id="1:303"
            aria-label="Kembali ke landing page"
          >
            Back
          </button>

          {/* Logo (Node 1:299) */}
          <Link to="/landing" className="figma-auth-logo" data-node-id="1:299">
            <span className="logo-g" data-node-id="1:300">G</span>
            <span className="logo-star" data-node-id="1:301">★</span>
            <span className="logo-closerz" data-node-id="1:302">Closerz</span>
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN BODY (Node 1:276)
          ───────────────────────────────────────────────────────────── */}
      <main className="figma-cart-body" data-node-id="1:276" data-name="keranjang body">
        {isEmpty ? (
          /* ──────────────────────────────────────────────────────────
             EMPTY STATE: Exact 3-Card Fan from Figma (Node 1:277)
             ────────────────────────────────────────────────────────── */
          <section className="figma-cart-empty-section">
            {/* 3-Card Fan & Halftone Dot Matrix (Node 1:277) */}
            <div data-node-id="1:277" data-name="Card fan">
              <FigmaCardFan />
            </div>

            {/* Empty Notification Message (Node 1:297) */}
            <p className="figma-cart-empty-text" data-node-id="1:297">
              Ups! Keranjang kamu kosong, tambahkan photocard favoritmu dan kembali lagi kesini.
            </p>
          </section>
        ) : (
          /* ──────────────────────────────────────────────────────────
             FILLED STATE: Interactive Cart Items & Checkout
             ────────────────────────────────────────────────────────── */
          <section className="figma-cart-filled-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 22, margin: 0, color: '#2b1e79' }}>
                Keranjang Belanja ({count} item)
              </h1>
              <button
                type="button"
                onClick={clear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Kosongkan
              </button>
            </div>

            <div className="figma-cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="figma-cart-item-row">
                  <div className="figma-cart-item-info">
                    <div
                      className="figma-cart-item-badge"
                      style={{
                        background:
                          item.group === 'NOVA7'
                            ? 'linear-gradient(135deg, #6a4fd6, #7dc8ff)'
                            : item.group === 'LUNAR GIRLS'
                            ? 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                            : 'linear-gradient(135deg, #3b82f6, #1e1b4b)',
                      }}
                    >
                      ★
                    </div>
                    <div>
                      <div className="figma-cart-item-title">{item.name}</div>
                      <div className="figma-cart-item-meta">
                        {item.group} · {item.type}
                      </div>
                      <div className="figma-cart-item-price">{formatRupiah(item.price)}</div>
                    </div>
                  </div>

                  {/* Quantity control */}
                  <div className="figma-cart-qty-ctrl">
                    <button
                      type="button"
                      className="figma-cart-qty-btn"
                      onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                      aria-label="Kurangi kuantitas"
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 800, minWidth: 24, textAlign: 'center' }}>
                      {item.qty || 1}
                    </span>
                    <button
                      type="button"
                      className="figma-cart-qty-btn"
                      onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                      aria-label="Tambah kuantitas"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      style={{
                        marginLeft: 8,
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 16,
                      }}
                      title="Hapus item"
                    >
                      🗑
                    </button>
                  </div>

                  {/* Total per card */}
                  <div className="figma-cart-item-total">
                    {formatRupiah((item.price || 0) * (item.qty || 1))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total and Checkout */}
            <div className="figma-cart-summary">
              <div>
                <div className="figma-cart-total-label">Total Pembayaran PO:</div>
                <div className="figma-cart-total-value">{formatRupiah(subtotal)}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Link
                  to="/landing"
                  style={{
                    color: '#64748b',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: 14,
                  }}
                >
                  ← Lanjut Belanja
                </Link>
                <button
                  type="button"
                  className="figma-btn-checkout"
                  onClick={() => navigate('/checkout')}
                >
                  Checkout Sekarang →
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
