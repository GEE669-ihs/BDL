import { useState } from 'react'
import './FigmaCardFan.css'

// 4-pointed sparkle SVG icon matching Figma
function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}

const FAN_CARDS_DATA = [
  {
    key: 'yuna',
    posClass: 'card-left',
    num: '07',
    hasSparkle: true,
    name: 'YUNA',
    group: 'LUNAR GIRLS',
    serial: 'LG-07-LUCKY',
    dataNodeId: '1:73',
  },
  {
    key: 'kair',
    posClass: 'card-center',
    num: '01',
    hasSparkle: true,
    name: 'KAI-R',
    group: 'NOVA7',
    serial: 'NV-01-ALBUM',
    dataNodeId: '1:85',
  },
  {
    key: 'mira',
    posClass: 'card-right',
    num: '09',
    hasSparkle: true,
    name: 'MIRA',
    group: 'STELLA-9',
    serial: 'ST-09-FANSIGN',
    dataNodeId: '1:79',
  },
]

export default function FigmaCardFan({ className = '', style = {} }) {
  const [flipped, setFlipped] = useState({})

  const toggleFlip = (key) => {
    setFlipped((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className={`figma-fan-wrapper ${className}`} style={style} data-name="Card fan">
      {/* 1. Halftone Dot Matrix Texture from Figma (Node 1:49 asset) */}
      <div className="figma-fan-dot-bg" aria-hidden="true" />

      {/* 2. Interactive 3D Card Stack */}
      <div className="figma-fan-stage">
        {FAN_CARDS_DATA.map((card) => {
          const isCardFlipped = !!flipped[card.key]

          return (
            <div
              key={card.key}
              className={`figma-flipcard-item ${card.posClass} ${
                isCardFlipped ? 'is-flipped' : ''
              }`}
              onClick={() => toggleFlip(card.key)}
              title="Klik untuk flip photocard"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleFlip(card.key)
                }
              }}
              data-node-id={card.dataNodeId}
              data-name={`Photocard ${card.name}`}
            >
              <div className="figma-flipcard-inner">
                {/* ── FRONT FACE (Exact Figma Visual) ── */}
                <div className="figma-card-face figma-card-front">
                  {/* Fluid Aurora Caustics Shader Layer from Figma */}
                  <div className="figma-card-aurora" aria-hidden="true" />
                  <div className="figma-card-hologram" aria-hidden="true" />
                  
                  {/* Top: Number & 4-pointed Star */}
                  <div className="figma-card-header">
                    <span className="figma-card-num">{card.num}</span>
                    {card.hasSparkle && (
                      <span className="figma-card-sparkle">
                        <SparkleIcon />
                      </span>
                    )}
                  </div>

                  {/* Bottom: Name & Group */}
                  <div className="figma-card-footer">
                    <div className="figma-card-name">{card.name}</div>
                    <div className="figma-card-group">{card.group}</div>
                  </div>
                </div>

                {/* ── BACK FACE (Official Seal & Hologram) ── */}
                <div className="figma-card-face figma-card-back">
                  <div className="figma-card-back-seal">★</div>
                  <div>
                    <div className="figma-card-back-title">G★Closerz</div>
                    <div className="figma-card-back-sub">Official Photocard</div>
                  </div>
                  <div className="figma-card-back-code">{card.serial}</div>
                  <div className="figma-card-back-hint">Klik untuk membalik</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
