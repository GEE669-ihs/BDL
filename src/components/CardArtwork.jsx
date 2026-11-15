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
      <div className="card-text">
        <b>{card.name}</b>
        <small className="card-group">{card.group}</small>
      </div>
    </>
  )
}
