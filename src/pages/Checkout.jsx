import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CARDS } from '../data'

const money = (n) => 'Rp' + n.toLocaleString('id-ID')
const ONGKIR = 15000
const GRATIS_ONGKIR = 200000

export default function Checkout() {
  const { items, cart, total, clear } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nama: '', wa: '', alamat: '', kota: '', kodepos: '' })
  const [submitted, setSubmitted] = useState(false)
  const [orderId] = useState(() => 'GCZ-' + Date.now().toString(36).toUpperCase())

  const ongkir = total >= GRATIS_ONGKIR ? 0 : ONGKIR
  const grandTotal = total + ongkir

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    // Simpan order ke localStorage
    const order = { id: orderId, items: items.map(c => ({ ...c, qty: cart[c.id] })), form, total: grandTotal, createdAt: Date.now() }
    const orders = JSON.parse(localStorage.getItem('gc_orders') || '[]')
    orders.push(order)
    localStorage.setItem('gc_orders', JSON.stringify(orders))
    clear()
    setSubmitted(true)
  }

  // Pesan WhatsApp otomatis
  const waText = encodeURIComponent(
    `Halo Admin GO Closerz!\n\nNomor Order: *${orderId}*\nNama: ${form.nama}\nWA: ${form.wa}\nAlamat: ${form.alamat}, ${form.kota} ${form.kodepos}\n\nPesanan:\n` +
    items.map(c => `- ${c.name} (${c.group}) × ${cart[c.id]} = ${money(c.price * cart[c.id])}`).join('\n') +
    `\n\nOngkir: ${ongkir === 0 ? 'GRATIS' : money(ongkir)}\nTotal: *${money(grandTotal)}*`
  )

  if (items.length === 0 && !submitted) {
    return (
      <div className="stage">
        <section className="block checkout-block">
          <div className="checkout-empty-state">
            <span className="empty-icon">🛍️</span>
            <h2>Keranjang Masih Kosong</h2>
            <p className="sub">Kamu belum memilih photocard CYE untuk dimasukkan ke keranjang.</p>
            <button className="btn primary" onClick={() => navigate('/katalog')}>
              Jelajahi Katalog Photocard Sekarang →
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="stage">
        <section className="block checkout-block">
          <div className="checkout-success-card">
            <div className="success-badge-icon">🎉</div>
            <h2>Order Berhasil Dibuat!</h2>
            <p className="sub">
              ID Pesanan: <strong className="order-id-highlight">{orderId}</strong>
            </p>
            <div className="order-instruction-box">
              <h4>Langkah Konfirmasi Selanjutnya:</h4>
              <ol>
                <li>Kirim rincian order ke admin via WhatsApp melalui tombol di bawah.</li>
                <li>Lakukan transfer DP 50% ({money(Math.round(grandTotal / 2))}) ke rekening admin yang tertera di chat WA.</li>
                <li>Admin akan memverifikasi dan mengirimkan bukti slot photocard CYE resmimu.</li>
              </ol>
            </div>
            <div className="cta success-cta">
              <a
                className="btn wa-btn"
                href={`https://wa.me/628XXXXXXXXX?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>💬 Konfirmasi via WhatsApp</span>
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
        <div className="block-header">
          <h2>Checkout Pesanan CYE</h2>
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
                  <span className="item-total-price">{money(c.price * cart[c.id])}</span>
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
                <p className="free-ongkir-promo">🎉 Kamu mendapatkan promo Gratis Ongkir untuk order &gt; Rp200.000!</p>
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
