import { STEPS } from '../data'

export default function CaraOrder() {
  return (
    <div className="stage">
      <section className="block" id="cara-order">
        <div className="block-header block-header--center">
          <h2>Panduan Order Group Order Photocard</h2>
          <p className="sub">Empat langkah mudah dari memilih member favorit sampai photocard tiba di tanganmu.</p>
        </div>

        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <div
              className="step"
              key={t}
              style={{ '--stagger': `${120 + i * 140}ms` }}
            >
              <div className="step-badge-wrap">
                <span className="step-label">Langkah {i + 1}</span>
              </div>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>

        {/* Jaminan Layanan & Keuntungan Berbelanja di GO Closerz */}
        <div className="order-perks-container" aria-label="Jaminan Layanan GO Closerz">
          <div className="hero-perks">
            <div className="perk-item">
              <span className="perk-icon" aria-hidden="true">✦</span>
              <div className="perk-content">
                <strong>100% Official Goods</strong>
                <small>Photocard asli album resmi K-Pop pilihan.</small>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </span>
              <div className="perk-content">
                <strong>Safe Packing Innersleeve</strong>
                <small>Gratis toploader, sleeve pelindung, &amp; bubblewrap tebal.</small>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </span>
              <div className="perk-content">
                <strong>Sistem DP 50% Praktis</strong>
                <small>Cukup bayar setengah di muka, sisa saat barang tiba.</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
