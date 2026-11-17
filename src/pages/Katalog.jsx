import { useRef, useState, useMemo, useEffect, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { CARDS, GROUPS } from '../data'
import { useApp } from '../context/AppContext'
import CardArtwork from '../components/CardArtwork'

const money = (n) => 'Rp' + n.toLocaleString('id-ID')
const GROUP_TONES = {
  CYE: 'aurora',
  ILLIT: 'mist',
  aespa: 'dusk',
  BABYMONSTER: 'aurora',
  Hearts2Hearts: 'mist',
  TREASURE: 'aurora',
  '&TEAM': 'dusk',
  'THE BOYZ': 'dusk',
}

/* Susunan menu band K-Pop */
const BAND_MENU = [
  'Semua',
  'CYE',
  'ILLIT',
  'aespa',
  'BABYMONSTER',
  'Hearts2Hearts',
  'TREASURE',
  '&TEAM',
  'THE BOYZ',
]

/* ---------- Komponen Kartu Photocard Katalog ---------- */
const CatalogCard = memo(function CatalogCard({ card, index = 0 }) {
  const { add } = useApp()
  const ref = useRef(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const rafId = useRef(null)
  const rectRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const isHovered = useRef(false)

  const handleMouseEnter = () => {
    isHovered.current = true
    if (ref.current) rectRef.current = ref.current.getBoundingClientRect()
  }

  const handleMouseMove = (e) => {
    if (!ref.current) return
    mousePos.current = { x: e.clientX, y: e.clientY }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        if (!isHovered.current || !ref.current) {
          rafId.current = null
          return
        }

        if (!rectRef.current) {
          rectRef.current = ref.current.getBoundingClientRect()
        }

        const r = rectRef.current
        if (!r.width || !r.height) {
          rafId.current = null
          return
        }

        // Clamp antara 0.0 sampai 1.0 agar saat kursor cepat tidak terjadi glitch
        const rawPx = (mousePos.current.x - r.left) / r.width
        const rawPy = (mousePos.current.y - r.top) / r.height
        const px = Math.max(0, Math.min(1, rawPx))
        const py = Math.max(0, Math.min(1, rawPy))

        if (ref.current) {
          const el = ref.current.style
          el.setProperty('--ry', `${((px - 0.5) * 16).toFixed(2)}deg`)
          el.setProperty('--rx', `${((0.5 - py) * 16).toFixed(2)}deg`)
          el.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
          el.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        }
        rafId.current = null
      })
    }
  }

  const handleMouseLeave = () => {
    isHovered.current = false
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    rectRef.current = null
    if (ref.current) {
      const el = ref.current.style
      el.setProperty('--rx', '0deg')
      el.setProperty('--ry', '0deg')
      el.setProperty('--mx', '50%')
      el.setProperty('--my', '50%')
    }
  }

  const handleAdd = () => {
    const success = add(card, qty)
    if (success) {
      setAdded(true)
      setTimeout(() => setAdded(false), 1400)
    }
  }

  const soldOut = card.stock === 0
  const tone = card.tone || GROUP_TONES[card.group] || 'aurora'

  return (
    <article
      className="pcard"
      ref={ref}
      style={{ '--stagger': `${Math.min(index * 42, 320)}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 55:85 Photocard Artwork */}
      <div className={`art collector-card tone-${tone}`}>
        <div className="shine" />
        <CardArtwork card={card} />
      </div>

      {/* Info & Tombol Aksi Photocard */}
      <div className="pcard-info">
        <div className="pcard-header-block">
          <h3>{card.name} · {card.group}</h3>
          <p className="meta">
            <span className="card-type-text">{card.type}</span>
            <span className="stock">{soldOut ? 'Habis' : `Sisa ${card.stock} slot`}</span>
          </p>
        </div>

        <div className="pcard-action-block">
          <div className="row">
            <div className="price-group">
              <span className="price-tag">Harga PO</span>
              <strong className="price-val">{money(card.price)}</strong>
            </div>
            <span className="qty" aria-label="Jumlah pesanan kartu">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={soldOut || qty <= 1}
                aria-label="Kurangi jumlah kartu"
              >−</button>
              <span className="qty-num">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(card.stock || 1, q + 1))}
                disabled={soldOut || qty >= (card.stock || 1)}
                aria-label="Tambah jumlah kartu"
              >+</button>
            </span>
          </div>

          <button
            type="button"
            className={`add ${added ? 'added' : ''}`}
            disabled={soldOut}
            onClick={handleAdd}
            aria-label={`Tambah kartu ${card.name} ke keranjang`}
          >
            {soldOut ? 'Slot habis' : added ? '✓ Kartu Ditambahkan!' : '+ Tambah Kartu'}
          </button>
        </div>
      </div>
    </article>
  )
})

/* ══════════════════════════════════════════════════════════════
   HALAMAN KATALOG UTAMA (VIRTUALIZED 1-BARIS STAGED SNAP)
══════════════════════════════════════════════════════════════ */
export default function Katalog() {
  const location = useLocation()
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  // Motion glide state untuk capsule menu band: Hanya bergerak saat di-hold
  const [heldBand, setHeldBand] = useState(null)
  const [pendingBand, setPendingBand] = useState(null)
  const [isBandHolding, setIsBandHolding] = useState(false)
  const [isKatalogMounted, setIsKatalogMounted] = useState(false)
  const dragTargetBandRef = useRef(null)
  const pointerStartBandRef = useRef(null)
  const bandBtnRefs = useRef({})
  const [bandGlideStyle, setBandGlideStyle] = useState({
    transform: 'translate3d(0px, 0px, 0px) scale(1)',
    width: 0,
    height: 0,
    opacity: 0,
  })

  useEffect(() => {
    setIsKatalogMounted(true)
  }, [])

  // Sinkronkan pendingBand saat filter state telah diperbarui
  useEffect(() => {
    if (pendingBand && (filter === pendingBand || (filter === 'Semua' && pendingBand === 'Semua'))) {
      setPendingBand(null)
    }
  }, [filter, pendingBand])

  // Window-level tracking saat di-hold untuk menu band secara presisi & mulus
  useEffect(() => {
    if (!isBandHolding) return

    const handlePointerMove = (e) => {
      for (const g of BAND_MENU) {
        const el = bandBtnRefs.current[g]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (e.clientX >= rect.left - 4 && e.clientX <= rect.right + 4) {
            setHeldBand((prev) => (prev !== g ? g : prev))
            dragTargetBandRef.current = g
            break
          }
        }
      }
    }

    const handlePointerUp = (e) => {
      let releasedBand = null
      for (const g of BAND_MENU) {
        const el = bandBtnRefs.current[g]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (
            e.clientX >= rect.left - 4 &&
            e.clientX <= rect.right + 4 &&
            e.clientY >= rect.top - 25 &&
            e.clientY <= rect.bottom + 25
          ) {
            releasedBand = g
            break
          }
        }
      }

      // Hanya jalankan di handlePointerUp jika dilepas pada tombol yang BERBEDA dari awal tekan (gesture drag)
      // Jika ditekan dan dilepas di tombol yang sama (klik biasa), biarkan event onClick yang memproses
      if (releasedBand && pointerStartBandRef.current && releasedBand !== pointerStartBandRef.current) {
        handleFilterChange(releasedBand)
      }

      setIsBandHolding(false)
      setHeldBand(null)
      dragTargetBandRef.current = null
      pointerStartBandRef.current = null
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isBandHolding, filter])

  // Virtualized Stage State: 0: Header & Filter, 1..totalRows: 1 Baris Kartu
  const [activeStage, setActiveStage] = useState(0)
  const [animDirection, setAnimDirection] = useState('down')
  const stageLockRef = useRef(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  // Otomatis klik / aktifkan tombol 'Semua' saat halaman di-refresh atau setelah berpindah halaman
  useEffect(() => {
    setFilter('Semua')
    setPendingBand(null)
    setSearch('')
    setActiveStage(0)
  }, [location.pathname, location.key])

  // Update sliding capsule: tetap diam saat hover kursor biasa, hanya meluncur saat di-hold
  useEffect(() => {
    const updateBandGlide = () => {
      const activeBand = pendingBand !== null ? pendingBand : filter
      const targetBand = isBandHolding && heldBand ? heldBand : activeBand
      const target = targetBand ? bandBtnRefs.current[targetBand] : null
      if (target) {
        setBandGlideStyle({
          transform: `translate3d(${target.offsetLeft}px, ${target.offsetTop}px, 0) scale(${isBandHolding ? 0.94 : 1})`,
          width: target.offsetWidth,
          height: target.offsetHeight,
          opacity: 1,
        })
      } else {
        setBandGlideStyle((prev) => ({
          ...prev,
          opacity: 0,
        }))
      }
    }

    updateBandGlide()
    const raf = requestAnimationFrame(updateBandGlide)
    window.addEventListener('resize', updateBandGlide)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updateBandGlide)
    }
  }, [heldBand, filter, isBandHolding, pendingBand])

  // Deteksi jumlah kartu per baris secara responsif
  const [itemsPerRow, setItemsPerRow] = useState(() => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth <= 640) return 2
    if (window.innerWidth <= 1024) return 3
    return 4
  })

  // Bar geser indicator di bawah menu pilihan nama-nama band
  const chipsScrollRef = useRef(null)
  const [chipsScrollLeft, setChipsScrollLeft] = useState(0)
  const [chipsMaxScroll, setChipsMaxScroll] = useState(1)

  const handleChipsScroll = (e) => {
    const el = e.currentTarget
    setChipsScrollLeft(el.scrollLeft)
    setChipsMaxScroll(Math.max(1, el.scrollWidth - el.clientWidth))
  }

  const handleTrackClick = (e) => {
    const track = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - track.left
    const percent = Math.max(0, Math.min(1, clickX / track.width))
    const el = chipsScrollRef.current
    if (el) {
      el.scrollTo({
        left: percent * (el.scrollWidth - el.clientWidth),
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const updateScrollMetrics = () => {
      const el = chipsScrollRef.current
      if (el) {
        setChipsScrollLeft(el.scrollLeft)
        setChipsMaxScroll(Math.max(1, el.scrollWidth - el.clientWidth))
      }
    }
    updateScrollMetrics()
    window.addEventListener('resize', updateScrollMetrics)
    return () => window.removeEventListener('resize', updateScrollMetrics)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      let count = 4
      if (w <= 640) count = 2
      else if (w <= 1024) count = 3
      setItemsPerRow((prev) => (prev !== count ? count : prev))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter daftar kartu berdasarkan grup band & kata kunci pencarian
  const list = useMemo(() => {
    let res = filter === 'Semua' ? CARDS : CARDS.filter((c) => c.group === filter)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      res = res.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        (c.type && c.type.toLowerCase().includes(q))
      )
    }
    return res
  }, [filter, search])

  // Pecah daftar kartu menjadi baris-baris (1 Baris = 4 kartu di desktop, 3 di tablet, 2 di mobile)
  const rows = useMemo(() => {
    if (!list.length) return []
    const chunks = []
    for (let i = 0; i < list.length; i += itemsPerRow) {
      chunks.push(list.slice(i, i + itemsPerRow))
    }
    return chunks
  }, [list, itemsPerRow])

  const totalRows = rows.length

  // Navigasi perpindahan stage / baris dengan proteksi lock debounce
  const goToStage = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > totalRows || targetIndex === activeStage) return
    if (stageLockRef.current) return
    stageLockRef.current = true
    setAnimDirection(targetIndex > activeStage ? 'down' : 'up')
    setActiveStage(targetIndex)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => {
      stageLockRef.current = false
    }, 450)
  }

  // Reset ke Layar Awal (Stage 0) dan aktifkan tombol 'Semua' saat tombol Katalog di navbar ditekan
  useEffect(() => {
    const handleResetTop = () => {
      setFilter('Semua')
      setSearch('')
      setActiveStage(0)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    window.addEventListener('closerz:scroll-to-top', handleResetTop)
    return () => window.removeEventListener('closerz:scroll-to-top', handleResetTop)
  }, [])

  // Jika filter berganti (klik band untuk filter, klik lagi untuk kembali tampilkan semua)
  const handleFilterChange = (g) => {
    const nextFilter = (g === 'Semua' || filter === g) ? 'Semua' : g
    setPendingBand(nextFilter)
    setFilter(nextFilter)
    setActiveStage(0)
  }

  const handleSearchChange = (val) => {
    setSearch(val)
    setActiveStage(0)
  }

  // Event Listeners: Wheel, Touch Swipe & Keyboard Arrow Nav
  useEffect(() => {
    const handleWheel = (e) => {
      if (stageLockRef.current) return
      if (e.target.closest('input, textarea, select, .cart-dropdown, .qty')) return

      if (e.deltaY > 35) {
        if (activeStage < totalRows) {
          e.preventDefault()
          goToStage(activeStage + 1)
        }
      } else if (e.deltaY < -35) {
        if (activeStage > 0) {
          e.preventDefault()
          goToStage(activeStage - 1)
        }
      }
    }

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e) => {
      if (stageLockRef.current) return
      if (e.target.closest('input, textarea, select, .cart-dropdown, .qty, button')) return

      const deltaY = touchStartY.current - e.changedTouches[0].clientY
      const deltaX = touchStartX.current - e.changedTouches[0].clientX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && activeStage < totalRows) {
          goToStage(activeStage + 1)
        } else if (deltaY < 0 && activeStage > 0) {
          goToStage(activeStage - 1)
        }
      }
    }

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.target.closest('.cart-dropdown')) return

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeStage < totalRows) {
          e.preventDefault()
          goToStage(activeStage + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeStage > 0) {
          e.preventDefault()
          goToStage(activeStage - 1)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeStage, totalRows])

  // Data baris kartu yang aktif saat ini (Stage >= 1)
  const currentRowCards = activeStage > 0 ? rows[activeStage - 1] || [] : []
  const startCardIndex = activeStage > 0 ? (activeStage - 1) * itemsPerRow + 1 : 0
  const endCardIndex = activeStage > 0 ? Math.min(activeStage * itemsPerRow, list.length) : 0

  return (
    <div className={`katalog-stage-viewport anim-${animDirection}`}>
      {/* ── STAGE 0: TAMPILAN AWAL KATALOG (TEKS UTAMA + SEARCH BAR + PILIHAN BAND SAJA) ── */}
      {activeStage === 0 && (
        <div className="katalog-stage-pane katalog-stage-pane--header" key="katalog-stage-0">
          <div className="katalog-header-content">
            <div className="katalog-header">
              <h2>{filter === 'Semua' ? 'Katalog Photocard K-Pop' : `Katalog Photocard ${filter}`}</h2>
              <p className="sub">
                {filter === 'Semua'
                  ? `Koleksi lengkap ${CARDS.length} photocard resmi dari 8 grup band K-Pop pilihan.`
                  : `Koleksi ${list.length} photocard resmi ${filter} Group Order.`}
              </p>
            </div>

            {/* Search Bar */}
            <div className="katalog-controls-wrap">
              <div className="katalog-search-box">
                <input
                  type="text"
                  placeholder="Yuk cari member favoritmu lalu scroll atau swipe misal: Karina, Minwook, Yuha"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="katalog-search-input"
                  aria-label="Cari photocard member atau grup"
                />
                {search && (
                  <button
                    type="button"
                    className="katalog-search-clear"
                    onClick={() => handleSearchChange('')}
                    aria-label="Hapus pencarian"
                  >✕</button>
                )}
              </div>
            </div>

            {/* Menu Pilihan Band dengan Bar Geser di Bawahnya */}
            <div className="band-menu-wrapper">
              <div
                ref={chipsScrollRef}
                onScroll={handleChipsScroll}
                className="chips-glide-container"
                role="tablist"
                aria-label="Filter Band K-Pop"
              >
                {/* Active capsule glow yang meluncur mulus HANYA saat di-hold */}
                <span
                  className={`chips-active-glide${isBandHolding ? ' is-holding' : ''}`}
                  style={{
                    ...bandGlideStyle,
                    transition: isKatalogMounted ? undefined : 'none',
                  }}
                  aria-hidden="true"
                />

                {BAND_MENU.map((g) => {
                  const activeBand = isBandHolding && heldBand ? heldBand : (pendingBand !== null ? pendingBand : filter)
                  const isCurrentBand = activeBand === g
                  return (
                    <button
                      key={g}
                      data-band={g}
                      ref={(el) => {
                        if (el) bandBtnRefs.current[g] = el
                      }}
                      type="button"
                      role="tab"
                      aria-selected={g === filter}
                      className={`chip-glide-btn ${isCurrentBand ? 'chip-glide-btn--active' : ''}`}
                      onPointerDown={(e) => {
                        if (e.button !== 0 && e.pointerType === 'mouse') return
                        setIsBandHolding(true)
                        setHeldBand(g)
                        dragTargetBandRef.current = g
                        pointerStartBandRef.current = g
                      }}
                      onClick={() => handleFilterChange(g)}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>

              {/* Bar Geser Indikator Menu Band K-Pop (Memudahkan user mobile mengetahui ada banyak band) */}
              <div
                className="band-scroll-track"
                onClick={handleTrackClick}
                title="Geser atau klik untuk melihat pilihan band lainnya"
                aria-hidden="true"
              >
                <div
                  className="band-scroll-thumb"
                  style={{
                    transform: `translateX(${Math.min(100, Math.max(0, (chipsScrollLeft / chipsMaxScroll) * 100)) * 0.88}px)`,
                  }}
                />
              </div>
            </div>

            {/* Empty State jika hasil pencarian kosong */}
            {list.length === 0 && (
              <div className="katalog-empty-state" style={{ margin: '10px auto' }}>
                <span className="katalog-empty-icon" aria-hidden="true">✦</span>
                <h3>Photocard Tidak Ditemukan</h3>
                <p>Tidak ada photocard yang cocok dengan kata kunci "{search}". Coba cari nama member lain atau reset pencarian.</p>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => { setSearch(''); setFilter('Semua') }}
                >
                  Lihat Semua Photocard
                </button>
              </div>
            )}
          </div>

          {/* Teks biasa warna abu di bagian bawah tampilan (sesuai contoh gambar, tanpa capsule) */}
          {list.length > 0 && (
            <div className="katalog-bottom-hint">
              <span>Scroll atau swipe untuk melihat photocard yang kamu mau ↓</span>
            </div>
          )}
        </div>
      )}

      {/* ── STAGE > 0: SATU BARIS KARTU SAJA (TAMPILAN LAIN DI-UNMOUNT UNTUK PERFORMA SUPER RINGAN) ── */}
      {activeStage > 0 && currentRowCards.length > 0 && (
        <div className="katalog-stage-pane katalog-stage-pane--row" key={`katalog-stage-${activeStage}`}>
          {/* Header Ringkas / Toolbar Baris Kartu */}
          <div className="katalog-row-toolbar">
            <div className="katalog-row-info">
              <span className="katalog-row-counter">
                Menampilkan Kartu <strong>{startCardIndex} - {endCardIndex}</strong> dari <strong>{list.length}</strong>
                <span style={{ opacity: 0.6, marginLeft: '6px' }}>(Baris {activeStage} dari {totalRows})</span>
              </span>
            </div>
          </div>

          {/* Satu Baris Kartu Photocard Terpusat */}
          <div className="katalog-row-cards" aria-label={`Baris ${activeStage} koleksi photocard`}>
            {currentRowCards.map((c, index) => (
              <CatalogCard key={c.id} card={c} index={index} />
            ))}
          </div>

          {/* Petunjuk Bawah */}
          <div className="katalog-row-bottom">
            {activeStage < totalRows ? (
              <span>Scroll ke bawah untuk melihat baris berikutnya ({activeStage + 1} dari {totalRows}) ↓</span>
            ) : (
              <span>
                ✓ Kamu telah melihat seluruh {list.length} kartu koleksi{' '}
                <button
                  type="button"
                  className="btn-katalog-end-reset"
                  onClick={() => goToStage(0)}
                >
                  Kembali ke Menu Utama ↑
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
