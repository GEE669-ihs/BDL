import { useEffect, useRef, useState } from 'react'

export default function Ticker() {
  const items = [
    {
      badge: 'PO BATCH 04',
      badgeTone: 'gold',
      text: 'Slot Terbatas · Estimasi Tiba 3-4 Minggu Setelah PO Tutup',
    },
    {
      badge: '100% OFFICIAL',
      badgeTone: 'cyan',
      text: 'Photocard Asli Album, Fansign, Lucky Draw, & Special POB Korea',
    },
    {
      badge: 'MULTI-FANDOM',
      badgeTone: 'purple',
      text: 'CYE · aespa · BABYMONSTER · ILLIT · TREASURE · H2H · &TEAM · THE BOYZ',
    },
    {
      badge: 'PACKING AMAN',
      badgeTone: 'green',
      text: 'Gratis Toploader + Inner Sleeve + Yellow Board + Bubble Wrap Tebal',
    },
    {
      badge: 'SISTEM DP 50%',
      badgeTone: 'cyan',
      text: 'Cukup Bayar Setengah di Awal, Pelunasan Saat Photocard Tiba di Indo',
    },
    {
      badge: 'GARANSI KLAIM',
      badgeTone: 'gold',
      text: 'Jaminan Amanah & Bantuan Retur dengan Video Unboxing 2×24 Jam',
    },
  ]

  // Ulangi 3x per grup agar mencakup seluruh lebar layar ultrawide/4K tanpa celah
  const repeated = [...items, ...items, ...items]

  const trackRef = useRef(null)
  const groupRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const offsetRef = useRef(0)
  const velocityRef = useRef(0)
  const isHoveredRef = useRef(false)
  const isDraggingRef = useRef(false)
  const lastXRef = useRef(null)
  const lastTimeRef = useRef(null)
  const rafRef = useRef(null)

  // Kecepatan otomatis (pixel per detik) - tenang dan halus (~140s per putaran)
  const AUTO_SPEED = 26

  useEffect(() => {
    lastTimeRef.current = performance.now()

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = time

      const groupWidth = groupRef.current ? groupRef.current.offsetWidth : 2400

      if (isHoveredRef.current) {
        // Saat kursor mengarah ke running text: gliding responsif mengikuti arah kursor user
        if (Math.abs(velocityRef.current) > 0.05) {
          offsetRef.current += velocityRef.current
          velocityRef.current *= 0.92 // Redaman gesekan halus
        }
      } else {
        // Saat kursor sudah tidak berada di running text: berjalan normal seperti biasa
        offsetRef.current += AUTO_SPEED * dt
      }

      // Loop wrap tanpa celah (seamless infinite loop ke kiri dan ke kanan)
      if (groupWidth > 0) {
        while (offsetRef.current >= groupWidth) {
          offsetRef.current -= groupWidth
        }
        while (offsetRef.current < 0) {
          offsetRef.current += groupWidth
        }
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-offsetRef.current.toFixed(2)}px, 0, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Handler interaktif arah kursor user (kiri & kanan)
  const handlePointerEnter = (e) => {
    isHoveredRef.current = true
    lastXRef.current = e.clientX
    velocityRef.current = 0
  }

  const handlePointerMove = (e) => {
    if (!isHoveredRef.current) return
    if (lastXRef.current !== null) {
      const deltaX = e.clientX - lastXRef.current
      if (Math.abs(deltaX) > 0) {
        // Kursor digerakkan ke kanan (deltaX > 0) -> teks bergerak ke kanan (offset berkurang)
        // Kursor digerakkan ke kiri (deltaX < 0) -> teks bergerak ke kiri (offset bertambah)
        offsetRef.current -= deltaX * 1.3
        velocityRef.current = Math.max(-28, Math.min(28, -deltaX * 0.9))
      }
    }
    lastXRef.current = e.clientX
  }

  const handlePointerLeave = () => {
    isHoveredRef.current = false
    isDraggingRef.current = false
    setIsDragging(false)
    lastXRef.current = null
    velocityRef.current = 0
  }

  const handlePointerDown = (e) => {
    isDraggingRef.current = true
    setIsDragging(true)
    lastXRef.current = e.clientX
    velocityRef.current = 0
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const renderGroup = (prefix, refProp = null) => (
    <div className="ticker-group" key={prefix} ref={refProp}>
      {repeated.map((item, idx) => (
        <span key={`${prefix}-${idx}`} className="ticker-item">
          <span className="ticker-dot" aria-hidden="true">✦</span>
          <span className={`ticker-badge ticker-badge--${item.badgeTone}`}>
            {item.badge} :
          </span>
          <span className="ticker-text">{item.text}</span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      className={`ticker ${isDragging ? 'is-dragging' : ''}`}
      aria-hidden="true"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
    >
      <div className="ticker-track" ref={trackRef}>
        {renderGroup('g1', groupRef)}
        {renderGroup('g2')}
        {renderGroup('g3')}
      </div>
    </div>
  )
}
