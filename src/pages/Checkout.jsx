import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CARDS } from '../data'

const money = (n) => 'Rp' + n.toLocaleString('id-ID')
const ONGKIR = 15000
const GRATIS_ONGKIR = 200000

export default function Checkout() {
  const { items, cart, total, clear, remove } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', wa: '', alamat: '', kota: '', kodepos: '' })
  const [submitted, setSubmitted] = useState(false)
  const [orderId] = useState(() => 'GCZ-' + Date.now().toString(36).toUpperCase())
  const [orderSummaryWa, setOrderSummaryWa] = useState('')

  const ongkir = total >= GRATIS_ONGKIR ? 0 : ONGKIR
  const grandTotal = total + ongkir

  const handleBack = () => {
    navigate('/katalog')
  }

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    // Siapkan pesan WA sebelum keranjang di-clear
    const waMessage = encodeURIComponent(
      `Halo Admin GO Closerz!\n\nNomor Order: *${orderId}*\nNama: ${form.nama}\nWA: ${form.wa}\nAlamat: ${form.alamat}, ${form.kota} ${form.kodepos}\n\nPesanan:\n` +
      items.map(c => `- ${c.name} (${c.group}) × ${cart[c.id]} = ${money(c.price * cart[c.id])}`).join('\n') +
      `\n\nOngkir: ${ongkir === 0 ? 'GRATIS' : money(ongkir)}\nTotal: *${money(grandTotal)}*`
    )
    setOrderSummaryWa(waMessage)

    // Simpan order ke localStorage
    const order = { id: orderId, items: items.map(c => ({ ...c, qty: cart[c.id] })), form, total: grandTotal, createdAt: Date.now() }
    const orders = JSON.parse(localStorage.getItem('gc_orders') || '[]')
    orders.push(order)
    localStorage.setItem('gc_orders', JSON.stringify(orders))
    clear()
    setSubmitted(true)
  }

  // Admin WhatsApp resmi GO Closerz (nomor terpusat sama dengan WhatsAppAdmin)
  const ADMIN_PHONE = '628881815063'

  if (items.length === 0 && !submitted) {
    return (
      <div className="stage checkout-stage--centered">
        <section className="block checkout-block checkout-block--centered">
          <div className="checkout-empty-state">
            <span className="empty-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <h2>Keranjang Masih Kosong</h2>
            <p className="sub">Kamu belum memilih photocard untuk dimasukkan ke keranjang.</p>
            <button className="btn primary" onClick={() => navigate('/katalog')}>
              Jelajahi Katalog Photocard Sekarang
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="stage checkout-stage--centered">
        <section className="block checkout-block checkout-block--centered">
          <div className="checkout-success-card">
            {/* Motion Centang Hijau Luminous */}
            <div className="success-motion-checkmark" aria-hidden="true">
              <svg className="checkmark-svg" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h2>Order Berhasil Dibuat!</h2>
            <p className="sub">
              ID Pesanan: <strong className="order-id-highlight">{orderId}</strong>
            </p>
            <div className="order-instruction-box">
              <h4>Langkah Konfirmasi Selanjutnya:</h4>
              <ol>
                <li>Kirim rincian order ke admin via WhatsApp melalui tombol di bawah.</li>
                <li>Lakukan transfer DP 50% ({money(Math.round(grandTotal / 2))}) ke rekening admin yang tertera di chat WA.</li>
                <li>Admin akan memverifikasi dan mengirimkan bukti slot photocard resmimu.</li>
              </ol>
            </div>
            <div className="cta success-cta">
              <a
                className="btn wa-btn"
                href={`https://wa.me/${ADMIN_PHONE}?text=${orderSummaryWa}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ marginRight: '6px' }}>
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.944 2.796.944h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.128-.521-1.615-.668-2.673-2.316-2.753-2.424-.08-.108-.66-.878-.66-1.674 0-.796.417-1.189.566-1.349.149-.16.326-.2.434-.2.108 0 .216.001.311.006.1.006.234-.038.366.28.138.334.469 1.144.51 1.228.042.085.07.184.014.296-.056.113-.085.184-.17.283-.085.1-.179.223-.255.3-.085.085-.174.179-.075.35.099.171.442.729.948 1.18.652.581 1.202.761 1.373.846.17.085.27.071.37-.043.1-.114.426-.496.54-.666.113-.17.227-.142.383-.085.156.057.994.469 1.164.554.17.085.284.128.326.199.043.071.043.412-.101.817z" />
                </svg>
                <span>Konfirmasi via WhatsApp</span>
              </a>
              <button className="btn ghost" onClick={() => navigate('/beranda')}>
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="stage">
      <section className="block checkout-block">
        <div className="checkout-top-bar">
          <button
            type="button"
            className="checkout-back-btn"
            onClick={handleBack}
            aria-label="Kembali ke Katalog Photocard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Kembali ke Katalog</span>
          </button>
        </div>

        <div className="block-header">
          <h2>Checkout Pesanan Group Order</h2>
          <p className="sub">Lengkapi data pengiriman dengan akurat untuk pengiriman photocard resmi Batch 04.</p>
        </div>

        <div className="checkout-grid">
          {/* Form Data Pembeli */}
          <div className="checkout-card form-card">
            <h3 className="checkout-card-title">Data Pengiriman</h3>
            <form onSubmit={submit} className="checkout-form">
              {[
                { name: 'nama', label: 'Nama Lengkap', placeholder: 'cth: Siti Rahmawati', type: 'text' },
                { name: 'wa', label: 'Nomor WhatsApp Aktif', placeholder: 'cth: 081234567890', type: 'tel' },
                { name: 'alamat', label: 'Alamat Pengiriman Lengkap', placeholder: 'Jalan, no. rumah, RT/RW, kelurahan, kecamatan', type: 'text' },
                { name: 'kota', label: 'Kota / Kabupaten', placeholder: 'cth: Jakarta Selatan', type: 'text' },
                { name: 'kodepos', label: 'Kode Pos', placeholder: 'cth: 12345', type: 'text' },
              ].map(({ name, label, placeholder, type }) => (
                <label key={name} className="checkout-field">
                  <span className="field-label">{label}</span>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={change}
                    placeholder={placeholder}
                    required
                    className="checkout-input"
                  />
                </label>
              ))}

              <button type="submit" className="btn primary wide checkout-submit-btn">
                <span>Konfirmasi & Lanjut ke WhatsApp →</span>
              </button>
            </form>
          </div>

          {/* Ringkasan Order */}
          <div className="checkout-card summary-card">
            <h3 className="checkout-card-title">Ringkasan Pesanan</h3>
            <div className="checkout-items-list">
              {items.map((c) => (
                <div key={c.id} className="checkout-item-row">
                  <div className="item-meta">
                    {c.image && (
                      <div className="item-thumb-wrap">
                        <img src={c.image} alt={c.name} className="item-thumb" />
                      </div>
                    )}
                    <div className="item-names">
                      <strong>{c.name}</strong>
                      <small>{c.group} · {c.type}</small>
                      <span className="item-qty-tag">Jumlah: {cart[c.id]} kartu</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="item-total-price">{money(c.price * cart[c.id])}</span>
                    <button
                      type="button"
                      className="cart-item-remove-btn"
                      onClick={() => remove(c.id)}
                      title={`Hapus ${c.name} dari pesanan`}
                      aria-label={`Hapus ${c.name}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-calc-table">
              <div className="calc-row">
                <span>Subtotal Photocard</span>
                <span>{money(total)}</span>
              </div>
              <div className="calc-row">
                <span>Ongkos Kirim</span>
                <span className={ongkir === 0 ? 'free-tag' : ''}>
                  {ongkir === 0 ? '✓ GRATIS ONGKIR' : money(ongkir)}
                </span>
              </div>
              {ongkir === 0 ? (
                <p className="free-ongkir-promo">Kamu mendapatkan promo Gratis Ongkir untuk order &gt; Rp200.000!</p>
              ) : (
                <p className="free-ongkir-hint">Tambah {money(GRATIS_ONGKIR - total)} lagi untuk gratis ongkir.</p>
              )}
              <div className="calc-row total-row">
                <span>Total Estimasi</span>
                <span className="grand-total-val">{money(grandTotal)}</span>
              </div>
            </div>

            <div className="checkout-dp-box">
              <div className="dp-header">
                <span className="dp-badge">DP 50%</span>
                <strong>{money(Math.round(grandTotal / 2))}</strong>
              </div>
              <p>
                Sistem Group Order K-Pop: Kamu hanya perlu membayar DP 50% di muka. Sisa pelunasan 50% dilakukan saat photocard resmi tiba di Indonesia (~3-4 minggu).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
