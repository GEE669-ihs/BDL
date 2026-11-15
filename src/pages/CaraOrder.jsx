import { useNavigate } from 'react-router-dom'
import { STEPS } from '../data'

export default function CaraOrder() {
  const navigate = useNavigate()

  return (
    <div className="stage">
      <section className="block" id="cara-order">
        <div className="block-header">
          <h2>Cara Order Group Order CYE</h2>
          <p className="sub">Empat langkah mudah dari memilih member favorit sampai photocard tiba di tanganmu.</p>
        </div>

        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <div className="step" key={t}>
              <div className="step-badge-wrap">
                <span className="n">0{i + 1}</span>
                <span className="step-label">Langkah {i + 1}</span>
              </div>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>

        <div className="page-cta-wrap">
          <button className="btn primary" onClick={() => navigate('/katalog')}>
            Jelajahi Katalog Photocard CYE →
          </button>
        </div>
      </section>
    </div>
  )
}
