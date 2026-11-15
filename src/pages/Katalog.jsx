import { useRef, useState } from 'react'
import { CARDS, GROUPS } from '../data'
import { useApp } from '../context/AppContext'
import CardArtwork from '../components/CardArtwork'

const money = (n) => 'Rp' + n.toLocaleString('id-ID')
const GROUP_TONES = { CYE: 'aurora' }

function CatalogCard({ card }) {
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
}

export default function Katalog() {
  const [filter, setFilter] = useState('CYE')
  const list = CARDS

  return (
    <div className="stage">
      <section className="block" id="katalog">
        <h2>Katalog Photocard CYE</h2>
        <p className="sub">
          Koleksi photocard 7 member resmi Close Your Eyes (CYE). Arahkan kursor ke kartu untuk melihat efek motion 3D &amp; pantulan hologram.
        </p>

        {/* Tombol Kategori / Filter Navbar Katalog */}
        <div className="chips">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              className={g === filter ? 'on' : ''}
              onClick={() => setFilter(g)}
            >
              ✦ {g}
            </button>
          ))}
        </div>

        {/* Grid 7 Photocard: 4 kartu baris atas, 3 kartu baris bawah */}
        <div className="grid">
          {list.map((c) => (
            <CatalogCard key={c.id} card={c} />
          ))}
        </div>
      </section>
    </div>
  )
}
