import { STEPS } from '../data'

export default function CaraOrder() {
  return (
    <div className="stage">
      <section className="block" id="cara-order">
        <div className="block-header block-header--center">
          <h2>Panduan Order Group Order Photocard</h2>
          <p className="sub">Empat langkah mudah dari memilih member favorit sampai photocard tiba di tanganmu.</p>
        </div>

        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <div
              className="step"
              key={t}
              style={{ '--stagger': `${120 + i * 140}ms` }}
            >
              <div className="step-badge-wrap">
                <span className="step-label">Langkah {i + 1}</span>
              </div>
              <h4>{t}</h4>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
