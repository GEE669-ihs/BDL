export default function Ticker() {
  const items = [
    'REALPICT GUARANTEE',
    '100% OFFICIAL ALBUM PHOTOCARD',
    'OPEN PO BATCH 04',
    'SAFE PACKING TOPLOADER & SLEEVE',
    'DP 50% SYSTEM',
  ]

  // Ulangi teks 4x per grup agar mencakup seluruh lebar layar (bahkan ultrawide/4K)
  // sehingga tidak ada celah kosong dan tidak ada teks yang muncul terlambat
  const repeated = [...items, ...items, ...items, ...items]

  const renderGroup = (prefix) => (
    <div className="ticker-group" key={prefix}>
      {repeated.map((text, idx) => (
        <span key={`${prefix}-${idx}`} className="ticker-item">
          <span className="ticker-dot" aria-hidden="true">✦</span>
          {text}
        </span>
      ))}
    </div>
  )

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {renderGroup('g1')}
        {renderGroup('g2')}
      </div>
    </div>
  )
}
