import { useState, useRef } from 'react'
import CardArtwork from './CardArtwork'

/* ---------- Flip Card dengan Motion Kursor 3D (Desktop) & Anti-Glitch Safe-Z Stacking (Mobile) ---------- */
export default function FlipCard({ card, style }) {
  const [flipped, setFlipped] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const cardRef = useRef(null)
  const tiltRef = useRef(null)
  const rafId = useRef(null)
  const rectRef = useRef(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const isHovered = useRef(false)

  const handleMouseEnter = () => {
    // Hanya aktifkan 3D cursor tilt pada perangkat mouse desktop
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }
    isHovered.current = true
    if (cardRef.current) rectRef.current = cardRef.current.getBoundingClientRect()
  }

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }
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

        // Clamp antara 0.0 sampai 1.0 agar tidak melompat liar
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

  const handleClick = () => {
    // Jaga zIndex tetap di atas selama kartu sedang berputar (800ms) agar tidak tertembus atau tertimpa kartu lain
    setIsFlipping(true)
    setFlipped((f) => !f)
    setTimeout(() => {
      setIsFlipping(false)
    }, 850)
  }

  // Hitung z-index dinamis: saat di-flip atau sedang berputar, naikkan layer ke depan (25)
  const baseZIndex = style?.zIndex ?? 1
  const activeZIndex = (flipped || isFlipping) ? 25 : baseZIndex

  return (
    <button
      ref={cardRef}
      className={'flip tone-' + card.tone + (flipped ? ' is-flipped' : '') + (isFlipping ? ' is-animating' : '')}
      style={{
        ...style,
        zIndex: activeZIndex,
      }}
      onClick={handleClick}
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
