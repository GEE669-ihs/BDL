export default function CardArtwork({ card }) {
  return (
    <>
      {card.image && (
        <img
          src={card.image}
          alt={card.name}
          className="card-photo"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="card-overlay" aria-hidden="true" />
      <small className="card-no">GO CLOSERZ / {card.no || String(card.id).padStart(2, '0')}</small>
      <span className="card-star" aria-hidden="true">✦</span>
      <div className="card-text">
        <b>{card.name}</b>
        <small className="card-group">{card.group}</small>
      </div>
    </>
  )
}
