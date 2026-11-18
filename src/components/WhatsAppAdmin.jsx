export default function WhatsAppAdmin() {
  const lineUrl = 'https://line.me/ti/p/DXxrMczHYq'

  return (
    <aside className="wa-float-container" aria-label="LINE Admin Support">
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn line-float-btn"
        aria-label="Hubungi Admin LINE GO Closerz"
      >
        <span className="wa-float-tooltip">Chat Admin LINE</span>
        <span className="wa-float-pulse line-float-pulse" aria-hidden="true" />
        <svg
          className="wa-icon line-icon-float"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Logo Resmi LINE Messenger */}
          <path d="M19.365 9.863c.349.001.63.284.63.633 0 .348-.281.631-.63.632h-2.148v1.393h2.148c.349.001.63.284.63.633 0 .348-.281.631-.63.632h-2.778a.633.633 0 0 1-.63-.632V8.471c0-.349.281-.632.63-.632h2.778c.349 0 .63.283.63.632 0 .349-.281.632-.63.632h-2.148v1.392h2.148v-.632zm-4.708 3.29h-.001c-.167 0-.327-.066-.446-.184l-2.029-2.883v2.435c0 .348-.281.632-.63.632-.349 0-.63-.284-.63-.632V8.471c0-.203.097-.393.262-.511a.635.635 0 0 1 .593-.056c.078.037.148.093.204.164l2.046 2.907V8.471c0-.349.281-.632.63-.632.35 0 .631.283.631.632v4.05c0 .349-.281.632-.63.632zm-6.273 0c-.349 0-.63-.284-.63-.632V8.471c0-.349.281-.632.63-.632.349 0 .63.283.63.632v4.05c0 .348-.281.632-.63.632zm-3.08 0H3.125a.633.633 0 0 1-.63-.632V8.471c0-.349.281-.632.63-.632.349 0 .63.283.63.632v3.418h1.519c.349.001.63.284.63.633 0 .348-.281.631-.63.632zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.084.922.258 1.057.592.121.303.079.779.039 1.085l-.171 1.026c-.053.308-.242 1.209 1.057.66 1.3-.551 7.009-4.128 9.563-7.067C23.064 14.512 24 12.518 24 10.314" />
        </svg>
      </a>
    </aside>
  )
}
