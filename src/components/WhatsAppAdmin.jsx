export default function WhatsAppAdmin() {
  const phone = '628881815063'
  const text = encodeURIComponent('Halo Admin GO Closerz, saya ingin bertanya seputar pemesanan photocard K-Pop.')
  const waUrl = `https://wa.me/${phone}?text=${text}`

  return (
    <aside className="wa-float-container" aria-label="WhatsApp Admin Support">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn"
        aria-label="Hubungi Admin WhatsApp (0888-1815-063)"
      >
        <span className="wa-float-tooltip">Chat Admin (0888-1815-063)</span>
        <span className="wa-float-pulse" aria-hidden="true" />
        <svg
          className="wa-icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.944 2.796.944h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-2.128-.521-1.615-.668-2.673-2.316-2.753-2.424-.08-.108-.66-.878-.66-1.674 0-.796.417-1.189.566-1.349.149-.16.326-.2.434-.2.108 0 .216.001.311.006.1.006.234-.038.366.28.138.334.469 1.144.51 1.228.042.085.07.184.014.296-.056.113-.085.184-.17.283-.085.1-.179.223-.255.3-.085.085-.174.179-.075.35.099.171.442.729.948 1.18.652.581 1.202.761 1.373.846.17.085.27.071.37-.043.1-.114.426-.496.54-.666.113-.17.227-.142.383-.085.156.057.994.469 1.164.554.17.085.284.128.326.199.043.071.043.412-.101.817z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.981-1.306C8.423 21.536 10.15 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.674 0-3.238-.49-4.556-1.332l-.326-.208-3.037.797.81-2.959-.228-.363C3.784 14.809 3.25 13.439 3.25 12c0-4.825 3.925-8.75 8.75-8.75s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75z" />
        </svg>
      </a>
    </aside>
  )
}
