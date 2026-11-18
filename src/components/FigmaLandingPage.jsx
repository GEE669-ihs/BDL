import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import FigmaCardFan from './FigmaCardFan'
import './FigmaLandingPage.css'

// Local Assets downloaded from Figma
import heroBgImg from '../assets/figma/hero-bg.png'
import userAvatarImg from '../assets/figma/user-avatar.png'
import dotSvg from '../assets/figma/dot.svg'

// PO Deadline
const PO_TARGET_DATE = new Date('2026-11-28T23:59:59+07:00')

// 12 Photocard Catalog Data matching Figma Node 1:104
const FIGMA_CATALOG_CARDS = [
  // Row 1 - NOVA7
  {
    id: 101,
    name: 'Kai-R',
    group: 'NOVA7',
    edition: 'Fotokard Album Ver. A',
    slots: 12,
    price: 18000,
    gradient: 'linear-gradient(180deg, #7dc8ff 0%, #d7b8ff 100%)',
    bg: '#6a4fd6',
  },
  {
    id: 102,
    name: 'Jiho',
    group: 'NOVA7',
    edition: 'Fotokard Album Ver. A',
    slots: 8,
    price: 18000,
    gradient: 'linear-gradient(180deg, #7dc8ff 0%, #d7b8ff 100%)',
    bg: '#4d3cad',
  },
  {
    id: 103,
    name: 'Sen',
    group: 'NOVA7',
    edition: 'Lucky Draw Edisi Silver',
    slots: 3,
    price: 45000,
    gradient: 'linear-gradient(180deg, #b8cde6 0%, #8ca9d3 100%)',
    bg: '#334155',
  },
  {
    id: 104,
    name: 'Rei',
    group: 'NOVA7',
    edition: 'Fotokard Album Ver. B',
    slots: 0,
    price: 18000,
    gradient: 'linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)',
    bg: '#4b5563',
  },

  // Row 2 - LUNAR GIRLS
  {
    id: 105,
    name: 'Yuna',
    group: 'LUNAR GIRLS',
    edition: 'Fotokard Album Ver. A',
    slots: 10,
    price: 20000,
    gradient: 'linear-gradient(180deg, #ff7ccb 0%, #c7dde9 100%)',
    bg: '#701a75',
  },
  {
    id: 106,
    name: 'Hana',
    group: 'LUNAR GIRLS',
    edition: 'POB Makestar Hologram',
    slots: 4,
    price: 35000,
    gradient: 'linear-gradient(180deg, #f472b6 0%, #818cf8 100%)',
    bg: '#831843',
  },
  {
    id: 107,
    name: 'Soo',
    group: 'LUNAR GIRLS',
    edition: 'Fotokard Album Ver. B',
    slots: 6,
    price: 20000,
    gradient: 'linear-gradient(180deg, #fbcfe8 0%, #a78bfa 100%)',
    bg: '#581c87',
  },
  {
    id: 108,
    name: 'Eun',
    group: 'LUNAR GIRLS',
    edition: 'Lucky Draw Pink Heart',
    slots: 2,
    price: 40000,
    gradient: 'linear-gradient(180deg, #fb7185 0%, #e879f9 100%)',
    bg: '#9d174d',
  },

  // Row 3 - STELLA-9
  {
    id: 109,
    name: 'Mira',
    group: 'STELLA-9',
    edition: 'Fotokard Album Ver. A',
    slots: 9,
    price: 22000,
    gradient: 'linear-gradient(180deg, #889fce 0%, #1a1040 100%)',
    bg: '#1e1b4b',
  },
  {
    id: 110,
    name: 'Dami',
    group: 'STELLA-9',
    edition: 'Fansign Event Benefit',
    slots: 1,
    price: 50000,
    gradient: 'linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)',
    bg: '#0c4a6e',
  },
  {
    id: 111,
    name: 'Rin',
    group: 'STELLA-9',
    edition: 'Fotokard Album Ver. B',
    slots: 7,
    price: 22000,
    gradient: 'linear-gradient(180deg, #818cf8 0%, #312e81 100%)',
    bg: '#312e81',
  },
  {
    id: 112,
    name: 'Nari',
    group: 'STELLA-9',
    edition: 'Special Edition Glitter',
    slots: 5,
    price: 38000,
    gradient: 'linear-gradient(180deg, #fcd34d 0%, #f43f5e 100%)',
    bg: '#78350f',
  },
]

// FAQ Items matching Figma Node 1:144
const FIGMA_FAQ_ITEMS = [
  {
    q: 'Apakah photocard dijamin official?',
    a: 'Ya, semua kartu berasal dari album dan merchandise resmi. Kami tidak menjual fotokopi atau unofficial.',
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
  const { cart, count, add, setCartOpen, user, logout } = useApp()

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

  const handleQtyChange = (cardId, delta) => {
    setCardQtys((prev) => {
      const current = prev[cardId] || 1
      const next = Math.max(1, Math.min(10, current + delta))
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

  // Filtered Cards
  const displayedCards =
    selectedFilter === 'Semua'
      ? FIGMA_CATALOG_CARDS
      : FIGMA_CATALOG_CARDS.filter((c) => c.group === selectedFilter)

  return (
    <div className="figma-landing" data-node-id="1:20">
      {/* ─────────────────────────────────────────────────────────────
          1. TICKER BAR (Node 1:23)
          ───────────────────────────────────────────────────────────── */}
      <aside className="figma-ticker" aria-label="Pengumuman Ticker" data-node-id="1:23">
        <div className="figma-ticker-track">
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✦ OPEN PO BATCH KR</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✦ OPEN PO BATCH CN</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          {/* Duplicate track for seamless loop */}
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✦ OPEN PO BATCH KR</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
          <span className="figma-ticker-item">✧ REALPICT</span>
          <span className="figma-ticker-item">★ 100% OFFICIAL</span>
          <span className="figma-ticker-item">✦ OPEN PO BATCH CN</span>
          <span className="figma-ticker-item">♡ INCLUDE GARANSI</span>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. NAV (Node 1:32)
          ───────────────────────────────────────────────────────────── */}
      <header className={`figma-nav ${isScrolled ? 'is-scrolled' : ''}`} data-node-id="1:32">
        <div className="figma-nav-inner">
          {/* Logo */}
          <div className="figma-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} data-node-id="1:33">
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
          ───────────────────────────────────────────────────────────── */}
      <section className="figma-katalog" id="figma-katalog" data-node-id="1:92">
        <div className="figma-section-inner">
          <h2 className="figma-section-title" data-node-id="1:93">Katalog PO</h2>
          <p className="figma-section-subtitle" data-node-id="1:94">
            Semua kartu adalah pre-order resmi dengan jaminan keaslian 100%.
          </p>

          {/* Filter Chips (Node 1:95) */}
          <div className="figma-filters" role="tablist" aria-label="Filter Grup" data-node-id="1:95">
            {['Semua', 'NOVA7', 'LUNAR GIRLS', 'STELLA-9'].map((filterName) => (
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

          {/* 12 Photocard Grid (Node 1:104) */}
          <div className="figma-grid" data-node-id="1:104">
            {displayedCards.map((card) => {
              const qty = cardQtys[card.id] || 1
              const isOutOfStock = card.slots <= 0

              return (
                <article className="figma-card" key={card.id}>
                  {/* Artwork Container */}
                  <div
                    className="figma-card-art"
                    style={{ background: card.gradient }}
                  >
                    <span className="figma-card-art-star">✦</span>
                    <div className="figma-card-art-info">
                      <div className="figma-card-art-name">{card.name}</div>
                      <div className="figma-card-art-group">{card.group}</div>
                    </div>
                  </div>

                  {/* Card Title & Meta */}
                  <h3 className="figma-card-title">{card.name} · {card.group}</h3>
                  <div className="figma-card-meta">
                    <span className="figma-card-version">{card.edition}</span>
                    <span className={`figma-card-slot ${isOutOfStock ? 'is-empty' : ''}`}>
                      {isOutOfStock ? 'Slot habis' : `Sisa ${card.slots} slot`}
                    </span>
                  </div>

                  {/* Price & Quantity Row */}
                  <div className="figma-card-bottom-row">
                    <span className="figma-card-price">
                      Rp{card.price.toLocaleString('id-ID')}
                    </span>
                    {!isOutOfStock && (
                      <div className="figma-qty-control" aria-label="Jumlah Kartu">
                        <button
                          type="button"
                          className="figma-qty-btn"
                          onClick={() => handleQtyChange(card.id, -1)}
                          disabled={qty <= 1}
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <span className="figma-qty-val">{qty}</span>
                        <button
                          type="button"
                          className="figma-qty-btn"
                          onClick={() => handleQtyChange(card.id, 1)}
                          disabled={qty >= card.slots}
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    className="figma-card-add-btn"
                    onClick={() => handleAddToCart(card)}
                    disabled={isOutOfStock}
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
