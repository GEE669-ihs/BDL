import { useState } from 'react'
import { FAQ } from '../data'

export default function FaqPage() {
  const [open, setOpen] = useState(0) // Default buka item pertama agar user langsung tahu accordion aktif

  return (
    <div className="stage">
      <section className="block" id="faq">
        <div className="block-header block-header--center">
          <h2>Frequently Asked Questions</h2>
          <p className="sub">Pertanyaan seputar keaslian photocard, estimasi pengiriman, dan mekanisme pembayaran Group Order.</p>
        </div>

        <div className="faq" role="region" aria-label="Daftar Pertanyaan">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i
            return (
              <div
                className={`qa ${isOpen ? 'open' : ''}`}
                key={q}
                style={{ '--stagger': `${120 + i * 100}ms` }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{q}</span>
                  <span className="qa-indicator" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="qa-answer">
                    <p>{a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
