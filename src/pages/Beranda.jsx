import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_CARDS, PO_END } from '../data'
import CardArtwork from '../components/CardArtwork'

/* ---------- Flip Card dengan Motion Kursor 3D (RAF Throttled 60-120fps, Anti-Glitch Hitbox) ---------- */
function FlipCard({ card, style }) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef(null)
  const tiltRef = useRef(null)
  const rafId = useRef(null)
  const rectRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const isHovered = useRef(false)

  const handleMouseEnter = () => {
    isHovered.current = true
    if (cardRef.current) rectRef.current = cardRef.current.getBoundingClientRect()
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    mousePos.current = { x: e.clientX, y: e.clientY }

    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        if (!isHovered.current || !cardRef.current) {
          rafId.current = null
          return
        }

        if (!rectRef.current) {
          rectRef.current = cardRef.current.getBoundingClientRect()
        }

        const r = rectRef.current
        if (!r.width || !r.height) {
          rafId.current = null
          return
        }

        // Clamp antara 0.0 sampai 1.0 agar saat kursor digeser sangat cepat, nilai tidak melompat liar
        const rawPx = (mousePos.current.x - r.left) / r.width
        const rawPy = (mousePos.current.y - r.top) / r.height
        const px = Math.max(0, Math.min(1, rawPx))
        const py = Math.max(0, Math.min(1, rawPy))

        const target = tiltRef.current || cardRef.current
        if (target) {
          const el = target.style
          const ryFactor = flipped ? -16 : 16
          const rx = (0.5 - py) * 16
          const ry = (px - 0.5) * ryFactor

          el.setProperty('--rx', `${rx.toFixed(2)}deg`)
          el.setProperty('--ry', `${ry.toFixed(2)}deg`)
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
    const target = tiltRef.current || cardRef.current
    if (target) {
      const el = target.style
      el.setProperty('--rx', '0deg')
      el.setProperty('--ry', '0deg')
      el.setProperty('--mx', '50%')
      el.setProperty('--my', '50%')
    }
  }

  return (
    <button
      ref={cardRef}
      className={'flip tone-' + card.tone + (flipped ? ' is-flipped' : '')}
      style={style}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label={`Balik kartu ${card.name}`}
    >
      <span ref={tiltRef} className="flip-tilt">
        <span className="flip-inner">
          <span className={`face front collector-card tone-${card.tone}`}>
            <span className="shine" aria-hidden="true" />
            <CardArtwork card={card} />
          </span>
          <span className={`face back collector-card tone-${card.tone}`}>
            <span className="shine" aria-hidden="true" />
            <span className="back-design" aria-hidden="true" />
          </span>
        </span>
      </span>
    </button>
  )
}

/* ---------- Angka countdown flip clock ---------- */
function Digit({ value }) {
  const [state, setState] = useState({ current: value, previous: value, flipping: false })

  useEffect(() => {
    if (value !== state.current) {
      setState({
        previous: state.current,
        current: value,
        flipping: true,
      })
    }
  }, [value, state.current])

  useEffect(() => {
    if (state.flipping) {
      const timer = setTimeout(() => {
        setState((s) => ({ ...s, flipping: false, previous: s.current }))
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [state.flipping])

  const finishFlip = (e) => {
    if (e.target !== e.currentTarget) return
    setState((s) => ({ ...s, flipping: false, previous: s.current }))
  }

  const text = (v) => String(v).padStart(2, '0')

  return (
    <span className={'flip-digit' + (state.flipping ? ' is-flipping' : '')}>
      {/* Kartu statis di latar belakang */}
      <span className="flip-half top static">
        <span>{text(state.current)}</span>
      </span>
      <span className="flip-half bottom static">
        <span>{text(state.flipping ? state.previous : state.current)}</span>
      </span>

      {/* Kartu dinamis beranimasi 3D flip */}
      {state.flipping && (
        <>
          <span className="flip-half top outgoing">
            <span>{text(state.previous)}</span>
          </span>
          <span className="flip-half bottom incoming" onAnimationEnd={finishFlip}>
            <span>{text(state.current)}</span>
          </span>
        </>
      )}

      {/* Detail garis belah tengah & engsel mekanik flip clock */}
      <span className="flip-seam" aria-hidden="true" />
      <span className="flip-hinge-left" aria-hidden="true" />
      <span className="flip-hinge-right" aria-hidden="true" />
    </span>
  )
}

function Countdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  let s = Math.max(0, Math.floor((PO_END - now) / 1000))
  const parts = [
    ['hari', Math.floor(s / 86400)],
    ['jam', Math.floor((s % 86400) / 3600)],
    ['menit', Math.floor((s % 3600) / 60)],
    ['detik', s % 60],
  ]
  return (
    <div className="countdown" role="timer" aria-label="Sisa waktu PO">
      {parts.map(([label, v]) => (
        <div className="unit" key={label}>
          <Digit value={v} />
          <small>{label}</small>
        </div>
      ))}
    </div>
  )
}

/* ---------- Halaman Beranda ---------- */
export default function Beranda() {
  const navigate = useNavigate()
  return (
    <>
      <section className="hero" id="beranda">
        <div className="hero-text">
          <div className="hero-badge">BATCH 04 · CLOSE YOUR EYES</div>
          <h1>
            GO Closerz<br />
            <span>Photocard CYE</span>
          </h1>
          <p className="hero-countdown-label">PO batch 04 ditutup dalam:</p>
          <Countdown />

          <div className="cta">
            <button className="btn primary" onClick={() => navigate('/katalog')}>
              Pilih Photocard Sekarang
            </button>
            <button className="btn ghost" onClick={() => navigate('/cara-order')}>
              Panduan Order
            </button>
          </div>
        </div>
        <div className="hero-cards" aria-label="Klik kartu untuk membaliknya">
          {HERO_CARDS.map((c) => (
            <FlipCard
              key={c.name}
              card={c}
              style={{
                '--rot': `${c.rot}deg`,
                '--x': `${c.x}px`,
                '--y': `${c.y}px`,
                zIndex: c.rot === 0 ? 2 : 1,
              }}
            />
          ))}
          <p className="hint">Flip the Photocard</p>
        </div>
      </section>

      {/* Trust & Service Highlights */}
      <section className="hero-perks-wrap" aria-label="Jaminan Layanan GO Closerz">
        <div className="hero-perks">
          <div className="perk-item">
            <span className="perk-icon" aria-hidden="true">✦</span>
            <div className="perk-content">
              <strong>100% Official Goods</strong>
              <small>Photocard asli album resmi Close Your Eyes (CYE).</small>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <div className="perk-content">
              <strong>Safe Packing Innersleeve</strong>
              <small>Gratis toploader, sleeve pelindung, &amp; bubblewrap tebal.</small>
            </div>
          </div>
          <div className="perk-item">
            <span className="perk-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </span>
            <div className="perk-content">
              <strong>Sistem DP 50% Praktis</strong>
              <small>Cukup bayar setengah di muka, sisa saat barang tiba.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
