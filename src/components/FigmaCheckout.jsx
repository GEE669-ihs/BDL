import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAuth.css'

export default function FigmaCheckout() {
  const navigate = useNavigate()
  const { cart, count, subtotal, clear, reduceSlots } = useApp()

  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    address: '',
    city: '',
    paymentOption: 'dp50', // 'dp50' | 'full'
  })

  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderCode, setOrderCode] = useState('')

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  const ongkir = subtotal >= 200000 ? 0 : 15000
  const grandTotal = subtotal + ongkir
  const dpAmount = Math.round(grandTotal / 2)
  const toPayNow = form.paymentOption === 'dp50' ? dpAmount : grandTotal

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.whatsapp || !form.address) {
      alert('Silakan lengkapi formulir pengiriman.')
      return
    }

    const newCode = 'GCZ-' + Date.now().toString(36).toUpperCase()
    setOrderCode(newCode)
    reduceSlots(cart)

    // Siapkan pesan konfirmasi WhatsApp
    const orderItemsText = cart
      .map(
        (c) =>
          `• ${c.name} (${c.group} · ${c.type || c.edition || 'PO'}) × ${c.qty || 1} = ${formatRupiah(
            (c.price || 0) * (c.qty || 1)
          )}`
      )
      .join('\n')

    const waMessage =
      `Halo Admin GO Closerz!\n\n` +
      `Saya ingin konfirmasi pesanan Group Order Photocard:\n` +
      `*Kode Pesanan:* ${newCode}\n` +
      `*Nama Pembeli:* ${form.name}\n` +
      `*No. WhatsApp:* ${form.whatsapp}\n` +
      `*Alamat:* ${form.address}, ${form.city}\n\n` +
      `*Detail Pesanan:*\n${orderItemsText}\n\n` +
      `*Ongkir Lokal:* ${ongkir === 0 ? 'GRATIS' : formatRupiah(ongkir)}\n` +
      `*Total Biaya:* ${formatRupiah(grandTotal)}\n` +
      `*Metode:* ${form.paymentOption === 'dp50' ? 'DP 50%' : 'Pelunasan Penuh'}\n` +
      `*Jumlah Transfer Saat Ini:* *${formatRupiah(toPayNow)}*\n\n` +
      `Mohon info rekening pembayaran dan verifikasi slot batch saya. Terima kasih!`

    const encoded = encodeURIComponent(waMessage)
    const waUrl = `https://wa.me/6281234567890?text=${encoded}`

    clear()
    setIsSubmitted(true)
    window.open(waUrl, '_blank')
  }

  if (!cart || cart.length === 0) {
    if (!isSubmitted) {
      return (
        <div className="figma-cart-page">
          <header className="figma-auth-header">
            <button
              type="button"
              className="figma-btn-back"
              onClick={() => navigate('/landing')}
            >
              Back
            </button>
            <Link to="/landing" className="figma-auth-logo">
              <span className="logo-g">G</span>
              <span className="logo-star">★</span>
              <span className="logo-closerz">Closerz</span>
            </Link>
          </header>
          <div className="figma-cart-body" style={{ textAlign: 'center' }}>
            <p className="figma-cart-empty-text">Keranjang Anda masih kosong.</p>
            <Link to="/landing" className="figma-btn-explore-catalog">
              ← Kembali ke Katalog
            </Link>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="figma-cart-page">
      {/* Header */}
      <header className="figma-auth-header">
        <div className="figma-auth-header-left">
          <button
            type="button"
            className="figma-btn-back"
            onClick={() => navigate('/keranjang')}
          >
            Back
          </button>
          <Link to="/landing" className="figma-auth-logo">
            <span className="logo-g">G</span>
            <span className="logo-star">★</span>
            <span className="logo-closerz">Closerz</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="figma-cart-body">
        {isSubmitted ? (
          <div className="figma-cart-filled-wrap" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 24, color: '#2b1e79', marginBottom: 12 }}>
              Pesanan Berhasil Dibuat!
            </h1>
            <p style={{ color: '#475569', fontSize: 16, marginBottom: 8 }}>
              Kode Pesanan: <strong style={{ color: '#2b1e79' }}>{orderCode}</strong>
            </p>
            <p style={{ color: '#64748b', fontSize: 14, maxWidth: 480, margin: '0 auto 28px' }}>
              Tab WhatsApp telah dibuka untuk mengirimkan rincian pesanan ke Admin GO Closerz.
              Admin akan segera memverifikasi slot dan mengirim bukti batch order.
            </p>
            <Link to="/landing" className="figma-btn-explore-catalog">
              Kembali ke Beranda PO
            </Link>
          </div>
        ) : (
          <div className="figma-cart-filled-wrap" style={{ maxWidth: 840 }}>
            <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 22, color: '#2b1e79', marginBottom: 24 }}>
              Checkout Pre-Order ({count} Kartu)
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Form Data Pengiriman */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Anya Geraldine"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      padding: '0 16px',
                      fontSize: 15,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    placeholder="Contoh: 081234567890"
                    value={form.whatsapp}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      padding: '0 16px',
                      fontSize: 15,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Alamat Lengkap Pengiriman
                </label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Nama jalan, RT/RW, nomor rumah, kecamatan, kelurahan"
                  value={form.address}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    padding: 12,
                    fontSize: 15,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Contoh: Jakarta Selatan"
                  value={form.city}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    padding: '0 16px',
                    fontSize: 15,
                  }}
                />
              </div>

              {/* Pilihan Pembayaran */}
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  Skema Pembayaran
                </label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: form.paymentOption === 'dp50' ? '2px solid #2b1e79' : '1px solid #cbd5e1',
                      background: form.paymentOption === 'dp50' ? '#f5f3ff' : '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="dp50"
                      checked={form.paymentOption === 'dp50'}
                      onChange={handleChange}
                    />
                    <span>DP 50% ({formatRupiah(dpAmount)})</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 18px',
                      borderRadius: 10,
                      border: form.paymentOption === 'full' ? '2px solid #2b1e79' : '1px solid #cbd5e1',
                      background: form.paymentOption === 'full' ? '#f5f3ff' : '#ffffff',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value="full"
                      checked={form.paymentOption === 'full'}
                      onChange={handleChange}
                    />
                    <span>Bayar Penuh ({formatRupiah(grandTotal)})</span>
                  </label>
                </div>
              </div>

              {/* Rincian Biaya */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 18,
                  marginTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal Photocard ({count} item):</span>
                  <strong>{formatRupiah(subtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ongkos Kirim Lokal:</span>
                  <strong>{ongkir === 0 ? 'GRATIS' : formatRupiah(ongkir)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 8,
                    fontSize: 16,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>Total yang Harus Ditransfer Sekarang:</span>
                  <strong style={{ color: '#2b1e79', fontSize: 18 }}>{formatRupiah(toPayNow)}</strong>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="submit"
                  className="figma-btn-checkout"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Kirim Pesanan ke WhatsApp Admin →
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
