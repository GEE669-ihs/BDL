import { useRef, useState, useMemo, memo } from 'react'
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

export default function Katalog() {
  const [filter, setFilter] = useState('Semua')
  const [search, setSearch] = useState('')

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

  // Tentukan class layout grid berdasarkan grup & jumlah kartu (misal ILLIT 5 kartu: 3 atas, 2 bawah)
  const gridLayoutClass = [
    'grid',
    filter !== 'Semua' && !search ? `grid-${filter.toLowerCase().replace(/[^a-z0-9]/g, '')}` : 'grid-all',
    list.length === 5 ? 'grid-5' : '',
    list.length === 7 ? 'grid-7' : '',
    list.length === 3 ? 'grid-3' : '',
    list.length === 4 ? 'grid-4' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="stage">
      <section className="block" id="katalog">
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
              placeholder="Cari member favorit (misal: Karina, Minwook, Wonhee, Haruto...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="katalog-search-input"
              aria-label="Cari photocard member atau grup"
            />
            {search && (
              <button
                type="button"
                className="katalog-search-clear"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
              >✕</button>
            )}
          </div>
        </div>

        {/* Tombol Kategori / Filter Band & Semua (Menu Pilihan dengan 1 Capsule Aktif) */}
        <div className="chips-container">
          <div className="chips chips-bands" role="tablist" aria-label="Filter Band K-Pop">
            {GROUPS.filter((g) => g !== 'Semua').map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={g === filter}
                className={g === filter ? 'on' : ''}
                onClick={() => setFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="chips chips-all-row">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'Semua'}
              className={filter === 'Semua' ? 'on chips-all-btn' : 'chips-all-btn'}
              onClick={() => setFilter('Semua')}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Grid Photocard atau Empty State */}
        {list.length === 0 ? (
          <div className="katalog-empty-state">
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
        ) : (
          <div className={gridLayoutClass}>
            {list.map((c, index) => (
              <CatalogCard key={`${filter}-${c.id}`} card={c} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
