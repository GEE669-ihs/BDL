import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import FigmaCardFan from './FigmaCardFan'
import './FigmaLandingPage.css'

// Local Assets downloaded from Figma
import heroBgImg from '../assets/figma/hero-bg.png'
import userAvatarImg from '../assets/figma/user-avatar.png'

// PO Deadline
const PO_TARGET_DATE = new Date('2026-11-28T23:59:59+07:00')

// FAQ Items matching Figma Node 1:144
const FIGMA_FAQ_ITEMS = [
  {
    q: 'Apakah photocard dijamin official?',
    a: 'Ya, semua kartu berasal dari album dan merchandise resmi Close Your Eyes (CYE). Kami tidak menjual fotokopi atau unofficial.',
  },
  {
    q: 'Bisa batal setelah bayar DP?',
    a: 'DP tidak dapat dikembalikan setelah PO ditutup, karena barang sudah dipesan langsung ke supplier di Korea.',
  },
  {
    q: 'Berapa ongkir lokal?',
    a: 'Flat Rp15.000 se-Indonesia menggunakan ekspedisi terpercaya, gratis untuk total belanja di atas Rp200.000.',
  },
  {
    q: 'Bagaimana jika kartu rusak saat tiba?',
    a: 'Kirim video unboxing utuh tanpa cut maksimal 2×24 jam sejak barang diterima. Tim kami akan bantu klaim garansi atau penggantian unit.',
  },
]

export default function FigmaLandingPage() {
  const navigate = useNavigate()
  const {
    cart,
    count,
    add,
    user,
    logout,
    groups,
    catalogCards,
    getCardSlot,
  } = useApp()

  // Sticky Navbar state
  const [isScrolled, setIsScrolled] = useState(false)

  // Countdown State
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft())

  // Catalog Filter & Quantities
  const [selectedFilter, setSelectedFilter] = useState('Semua')
  const [cardQtys, setCardQtys] = useState({})

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Scroll watcher
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function calculateTimeLeft() {
    const diff = Math.max(0, PO_TARGET_DATE.getTime() - Date.now())
    const totalSecs = Math.floor(diff / 1000)
    return {
      days: Math.floor(totalSecs / (3600 * 24)),
      hours: Math.floor((totalSecs % (3600 * 24)) / 3600),
      minutes: Math.floor((totalSecs % 3600) / 60),
      seconds: totalSecs % 60,
    }
  }

  const handleQtyChange = (cardId, delta, maxAvailable) => {
    setCardQtys((prev) => {
      const current = prev[cardId] || 1
      const next = Math.max(1, Math.min(maxAvailable || 10, current + delta))
      return { ...prev, [cardId]: next }
    })
  }

  const handleAddToCart = (card) => {
    const qty = cardQtys[card.id] || 1
    add(
      {
        id: card.id,
        name: card.name,
        group: card.group,
        type: card.edition,
        edition: card.edition,
        status: card.status || 'Ready Stock',
        image: card.image,
        price: card.price,
        stock: card.slots,
      },
      qty
    )
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Dynamic filter options based on Admin groups ("Semua", "CYE", + any added groups)
  const filterOptions = ['Semua', ...groups.map((g) => g.name)]

  // Filtered Cards matching current selection
  const displayedCards =
    selectedFilter === 'Semua'
      ? catalogCards
      : catalogCards.filter(
        (c) => (c.group || '').toUpperCase() === selectedFilter.toUpperCase()
      )

  return (
    <div className="figma-landing" data-node-id="1:20">
      {/* ─────────────────────────────────────────────────────────────
          1. TICKER BAR (Node 1:23)
          ───────────────────────────────────────────────────────────── */}
      <aside className="figma-ticker" aria-label="Pengumuman Ticker" data-node-id="1:23">
        <div className="figma-ticker-track">
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✧ OPEN PO BATCH KR</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✧ OPEN PO BATCH CN</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          {/* Duplicate track for seamless loop */}
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✧ OPEN PO BATCH KR</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✧ OPEN PO BATCH CN</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. NAV (Node 1:32)
          ───────────────────────────────────────────────────────────── */}
      <header className={`figma-nav ${isScrolled ? 'is-scrolled' : ''}`} data-node-id="1:32">
        <div className="figma-nav-inner">
          {/* Logo */}
          <div
            className="figma-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            data-node-id="1:33"
          >
            <span className="figma-logo-g" data-node-id="1:34">G</span>
            <span className="figma-logo-star" data-node-id="1:35">★</span>
            <span className="figma-logo-closerz" data-node-id="1:36">Closerz</span>
          </div>

          {/* Navigation Links */}
          <nav className="figma-nav-links" aria-label="Menu Utama">
            <button
              type="button"
              className="figma-nav-link"
              onClick={() => scrollToSection('figma-katalog')}
              data-node-id="1:37"
            >
              Katalog
            </button>
            <button
              type="button"
              className="figma-nav-link"
              onClick={() => scrollToSection('figma-cara-order')}
              data-node-id="1:38"
            >
              Cara order
            </button>
            <button
              type="button"
              className="figma-nav-link"
              onClick={() => scrollToSection('figma-faq')}
              data-node-id="1:39"
            >
              FAQ
            </button>
            <button
              type="button"
              className="figma-nav-link figma-admin-link"
              onClick={() => navigate('/admin')}
              title="Dashboard Admin Kelola Grup & Photocard"
            >
              Admin
            </button>
          </nav>

          {/* Action Badges */}
          <div className="figma-nav-actions">
            <div className="figma-badge" data-node-id="1:46">
              <span className="figma-badge-dot" data-node-id="1:47" />
              <span data-node-id="1:48">Batch 04</span>
            </div>

            <button
              type="button"
              className="figma-cart-btn"
              onClick={() => navigate('/keranjang-figma')}
              aria-label={`Buka Keranjang (${count || 0} item)`}
              data-node-id="1:40"
            >
              <span data-node-id="1:41">Keranjang</span>
              <span className="figma-cart-count" data-node-id="1:42">{count || 0}</span>
            </button>

            <button
              type="button"
              className="figma-profile-btn"
              onClick={() => {
                if (user) {
                  if (window.confirm(`Halo ${user.name || user.email}! Ingin logout?`)) {
                    logout()
                  }
                } else {
                  navigate('/login-figma')
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              title={user ? `Logged in as ${user.name || user.email}` : 'Masuk ke Akun'}
              data-node-id="1:43"
            >
              <img
                src={userAvatarImg}
                alt="Profile Avatar"
                className="figma-profile-avatar"
                data-node-id="1:45"
              />
              <span className="figma-profile-label" data-node-id="1:44">
                {user ? (user.name || 'Akun') : 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. HALAMAN AWAL (HERO) (Node 1:49)
          ───────────────────────────────────────────────────────────── */}
      <section className="figma-hero" id="figma-hero" data-node-id="1:49">
        {/* Background Image Texture */}
        <div className="figma-hero-bg-overlay" aria-hidden="true">
          <img src={heroBgImg} alt="" />
        </div>

        <div className="figma-hero-inner">
          {/* Left Text & Countdown */}
          <div className="figma-hero-content" data-node-id="1:50">
            <div className="figma-hero-title" data-node-id="1:51">
              <span className="figma-hero-title-top" data-node-id="1:52">GO Closerz</span>
              <span className="figma-hero-title-bottom" data-node-id="1:53">Photocard</span>
            </div>

            <p className="figma-hero-desc" data-node-id="1:54">
              INI DIISI APA YHHH
            </p>

            {/* Countdown Box (Node 1:55) */}
            <div className="figma-countdown" role="timer" aria-label="Sisa Waktu PO" data-node-id="1:55">
              <div className="figma-cd-box" data-node-id="1:56">
                <span className="figma-cd-num" data-node-id="1:57">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="figma-cd-label" data-node-id="1:58">hari</span>
              </div>
              <div className="figma-cd-box" data-node-id="1:59">
                <span className="figma-cd-num" data-node-id="1:60">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="figma-cd-label" data-node-id="1:61">jam</span>
              </div>
              <div className="figma-cd-box" data-node-id="1:62">
                <span className="figma-cd-num" data-node-id="1:63">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="figma-cd-label" data-node-id="1:64">menit</span>
              </div>
              <div className="figma-cd-box" data-node-id="1:65">
                <span className="figma-cd-num" data-node-id="1:66">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="figma-cd-label" data-node-id="1:67">detik</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="figma-hero-cta-row">
              <button
                type="button"
                className="figma-btn-primary"
                onClick={() => scrollToSection('figma-katalog')}
                data-node-id="1:70"
              >
                <span data-node-id="1:71">Pilih photocard</span>
              </button>
              <button
                type="button"
                className="figma-btn-secondary"
                onClick={() => scrollToSection('figma-cara-order')}
                data-node-id="1:68"
              >
                <span data-node-id="1:69">Cara order</span>
              </button>
            </div>
          </div>

          {/* Right Card Fan (Node 1:72) - Halftone Dot Matrix & 3D Interactive FlipCards */}
          <div data-node-id="1:72">
            <FigmaCardFan />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. KATALOG PO (Node 1:92)
          Exact Figma Layout, Color Palette & Template Structure
          ───────────────────────────────────────────────────────────── */}
      <section className="figma-katalog" id="figma-katalog" data-node-id="1:92">
        <div className="figma-section-inner">
          <h2 className="figma-section-title" data-node-id="1:93">Katalog PO</h2>
          <p className="figma-section-subtitle" data-node-id="1:94">
            Semua kartu adalah pre-order resmi dengan jaminan keaslian 100%.
          </p>

          {/* Dynamic Filter Chips (Node 1:95) */}
          <div className="figma-filters" role="tablist" aria-label="Filter Grup" data-node-id="1:95">
            {filterOptions.map((filterName) => (
              <button
                key={filterName}
                type="button"
                role="tab"
                aria-selected={selectedFilter === filterName}
                className={`figma-chip ${selectedFilter === filterName ? 'is-active' : ''}`}
                onClick={() => setSelectedFilter(filterName)}
              >
                {filterName}
              </button>
            ))}
          </div>

          {/* Photocard Grid (Node 1:104) with Exact Figma Card Template */}
          <div className="figma-grid" data-node-id="1:104">
            {displayedCards.map((card, idx) => {
              const isPO = card.status === 'Pre-Order'
              const currentSlots = getCardSlot(card.id)
              const qty = cardQtys[card.id] || 1
              // Kartu Pre-Order selalu bisa dipesan tanpa dibatasi slot habis
              const isOutOfStock = !isPO && currentSlots <= 0

              return (
                <article
                  className="figma-card figma-card-dealing"
                  key={`${selectedFilter}-${card.id}`}
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  {/* Art Box (Node 3:68) */}
                  <div
                    className="figma-card-art"
                    style={{
                      background: card.gradient || 'linear-gradient(180deg, #7dc8ff 0%, #d7b8ff 100%)',
                    }}
                    data-name="art"
                  >
                    {/* Member Photo Asset */}
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        className="figma-card-art-img"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <div className="figma-card-art-gradient" />
                        <p className="figma-card-art-star">✦</p>
                        <div className="figma-card-art-info">
                          <p className="figma-card-art-name">{card.name}</p>
                          <p className="figma-card-art-group">{card.group}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Title (Node 3:72): Member · CYE */}
                  <p className="figma-card-title">
                    {card.name} · {card.group}
                  </p>

                  {/* Info: Version & Sisa Slot (Node 3:73) */}
                  <div className="figma-card-meta" data-name="info">
                    <p className="figma-card-version">{card.edition}</p>
                    {isPO ? (
                      /* Status Pre-Order: Hanya status Pre-Order, TIDAK ADA tulisan sisa slot */
                      <p className="figma-card-slot is-po" title="Status Pre-Order">
                        Pre-Order
                      </p>
                    ) : (
                      /* Status Ready Stock: Tampilkan sisa slot */
                      <p className={`figma-card-slot ${isOutOfStock ? 'is-empty' : ''}`}>
                        {isOutOfStock ? 'Slot habis' : `Sisa ${currentSlots} slot`}
                      </p>
                    )}
                  </div>

                  {/* Price & Quantity Stepper (Node 3:76) */}
                  <div className="figma-card-bottom-row" data-name="price-row">
                    <div>
                      <span className="figma-card-price-label">{isPO ? 'HARGA PO' : 'HARGA'}</span>
                      <p className="figma-card-price">
                        Rp{(card.price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {(!isOutOfStock || isPO) && (
                      <div className="figma-qty-control" data-name="qty">
                        <button
                          type="button"
                          className="figma-qty-btn"
                          onClick={() => handleQtyChange(card.id, -1, isPO ? 99 : currentSlots)}
                          disabled={qty <= 1}
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <p className="figma-qty-val">{qty}</p>
                        <button
                          type="button"
                          className="figma-qty-btn"
                          onClick={() => handleQtyChange(card.id, 1, isPO ? 99 : currentSlots)}
                          disabled={!isPO && qty >= currentSlots}
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Button: Pre-Order selalu bisa dipesan */}
                  <button
                    type="button"
                    className={`figma-card-add-btn ${isOutOfStock ? 'is-empty' : ''}`}
                    onClick={() => handleAddToCart(card)}
                    disabled={isOutOfStock}
                    data-name="button"
                  >
                    {isOutOfStock ? 'Slot habis' : 'Tambah ke keranjang'}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CARA ORDER (Node 1:120)
          ───────────────────────────────────────────────────────────── */}
      <section className="figma-cara-order" id="figma-cara-order" data-node-id="1:120">
        <div className="figma-section-inner">
          <h2 className="figma-section-title" style={{ color: '#ffffff' }} data-node-id="1:121">
            Cara order
          </h2>
          <p className="figma-section-subtitle" style={{ color: '#d9dce6' }} data-node-id="1:122">
            Empat langkah dari memilih kartu sampai paket tiba.
          </p>

          <div className="figma-steps-row" data-node-id="1:123">
            {/* Step 1 */}
            <div className="figma-step-card" data-node-id="1:124">
              <div className="figma-step-num" data-node-id="1:125">1</div>
              <h3 className="figma-step-title" data-node-id="1:127">Pilih kartu</h3>
              <p className="figma-step-desc" data-node-id="1:128">
                Tambahkan photocard ke keranjang sebelum slot habis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="figma-step-card" data-node-id="1:129">
              <div className="figma-step-num" data-node-id="1:130">2</div>
              <h3 className="figma-step-title" data-node-id="1:132">Isi data</h3>
              <p className="figma-step-desc" data-node-id="1:133">
                Masukkan nama, nomor WhatsApp, dan alamat pengiriman.
              </p>
            </div>

            {/* Step 3 */}
            <div className="figma-step-card" data-node-id="1:134">
              <div className="figma-step-num" data-node-id="1:135">3</div>
              <h3 className="figma-step-title" data-node-id="1:137">Bayar DP 50%</h3>
              <p className="figma-step-desc" data-node-id="1:138">
                Transfer sesuai kode order, lalu kirim bukti ke WhatsApp admin.
              </p>
            </div>

            {/* Step 4 */}
            <div className="figma-step-card" data-node-id="1:139">
              <div className="figma-step-num" data-node-id="1:140">4</div>
              <h3 className="figma-step-title" data-node-id="1:142">Tunggu & lunasi</h3>
              <p className="figma-step-desc" data-node-id="1:143">
                Pelunasan saat barang tiba. Estimasi 3–4 minggu setelah PO ditutup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FAQ (Node 1:144)
          ───────────────────────────────────────────────────────────── */}
      <section className="figma-faq" id="figma-faq" data-node-id="1:144">
        <div className="figma-section-inner">
          <h2 className="figma-section-title" style={{ color: '#ffffff' }} data-node-id="1:145">
            FAQ
          </h2>
          <p className="figma-section-subtitle" style={{ color: '#d9dce6' }} data-node-id="1:146">
            Pertanyaan yang paling sering masuk.
          </p>

          <div className="figma-faq-list" data-node-id="1:147">
            {FIGMA_FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx

              return (
                <div
                  key={idx}
                  className="figma-faq-item"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                >
                  <div className="figma-faq-question-wrap">
                    <h3 className="figma-faq-question">{item.q}</h3>
                    <span className={`figma-faq-chevron ${isOpen ? 'is-open' : ''}`}>▼</span>
                  </div>
                  {isOpen && (
                    <p className="figma-faq-answer">{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FOOTER (Node 1:160)
          ───────────────────────────────────────────────────────────── */}
      <footer className="figma-footer" data-node-id="1:160">
        <div className="figma-footer-inner">
          <div className="figma-footer-brand" data-node-id="1:161">
            <div className="figma-logo" data-node-id="1:162">
              <span className="figma-logo-g" data-node-id="1:163">G</span>
              <span className="figma-logo-star" data-node-id="1:164">★</span>
              <span className="figma-logo-closerz" data-node-id="1:165">Closerz</span>
            </div>
            <p className="figma-footer-desc" data-node-id="1:166">
              Platform Group Order photocard K-Pop resmi, terpercaya, dan amanah.
            </p>
          </div>
          <p className="figma-footer-copy" data-node-id="1:167">
            © 2026 GO Closerz · All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
