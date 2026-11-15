import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { HERO_CARDS, PO_END } from '../data'
import { DUMMY_REVIEWS } from '../data/reviews'
import FlipCard from '../components/FlipCard'
import { useApp } from '../context/AppContext'

/* ---------- Angka countdown flip clock ---------- */
function Digit({ value }) {
  const [state, setState] = useState({ current: value, previous: value, flipping: false })

  useEffect(() => {
    if (value !== state.current) {
      setState({
        previous: state.current,
        current: value,
        flipping: true,
      })
    }
  }, [value, state.current])

  useEffect(() => {
    if (state.flipping) {
      const timer = setTimeout(() => {
        setState((s) => ({ ...s, flipping: false, previous: s.current }))
      }, 550)
      return () => clearTimeout(timer)
    }
  }, [state.flipping])

  const finishFlip = (e) => {
    if (e.target !== e.currentTarget) return
    setState((s) => ({ ...s, flipping: false, previous: s.current }))
  }

  const text = (v) => String(v).padStart(2, '0')

  return (
    <span className={'flip-digit' + (state.flipping ? ' is-flipping' : '')}>
      <span className="flip-half top static">
        <span>{text(state.current)}</span>
      </span>
      <span className="flip-half bottom static">
        <span>{text(state.flipping ? state.previous : state.current)}</span>
      </span>

      {state.flipping && (
        <>
          <span className="flip-half top outgoing">
            <span>{text(state.previous)}</span>
          </span>
          <span className="flip-half bottom incoming" onAnimationEnd={finishFlip}>
            <span>{text(state.current)}</span>
          </span>
        </>
      )}

      <span className="flip-seam" aria-hidden="true" />
      <span className="flip-hinge-left" aria-hidden="true" />
      <span className="flip-hinge-right" aria-hidden="true" />
    </span>
  )
}

function Countdown() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  let s = Math.max(0, Math.floor((PO_END - now) / 1000))
  const parts = [
    ['hari', Math.floor(s / 86400)],
    ['jam', Math.floor((s % 86400) / 3600)],
    ['menit', Math.floor((s % 3600) / 60)],
    ['detik', s % 60],
  ]
  return (
    <div className="countdown" role="timer" aria-label="Sisa waktu PO">
      {parts.map(([label, v]) => (
        <div className="unit" key={label}>
          <Digit value={v} />
          <small>{label}</small>
        </div>
      ))}
    </div>
  )
}

/* ---------- Local Storage Keys & Baseline Stats ---------- */
const USER_REVIEW_STORAGE_KEY = 'closerz_user_review'
const COMMUNITY_REVIEWS_KEY = 'closerz_community_reviews'
const STATS_STORAGE_KEY = 'closerz_rating_stats'

const DEFAULT_STATS = {
  totalCount: 1250,
  totalScore: 6125, // 6125 / 1250 = 4.90
  distribution: { 5: 1145, 4: 90, 3: 12, 2: 2, 1: 1 },
}

function getStoredStats() {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { }
  return DEFAULT_STATS
}

function getStoredCommunityReviews() {
  try {
    const raw = localStorage.getItem(COMMUNITY_REVIEWS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { }
  return []
}

function getReviewForAccount(userEmail) {
  if (!userEmail) return null
  try {
    const accountKey = `closerz_user_review_${userEmail.toLowerCase().trim()}`
    const raw = localStorage.getItem(accountKey)
    if (raw) return JSON.parse(raw)

    // Cek juga data legacy jika tersimpan sebelumnya
    const legacyRaw = localStorage.getItem(USER_REVIEW_STORAGE_KEY)
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw)
      if (parsed.userEmail === userEmail || !parsed.userEmail) {
        return parsed
      }
    }
  } catch (e) { }
  return null
}

/* ---------- Review Card Item (Memoized & Lazy-Loaded) ---------- */
const ReviewCardItem = memo(function ReviewCardItem({ r, onZoom }) {
  return (
    <article className="review-card-compact">
      <div className="review-card-top">
        <div className="reviewer-info">
          <div className="reviewer-avatar" style={{ background: r.avatarBg }} aria-hidden="true">
            {r.avatar}
          </div>
          <div>
            <strong className="reviewer-name">{r.name}</strong>
            <span className="reviewer-fandom">{r.fandom}</span>
          </div>
        </div>
        <div className="review-card-rating" aria-label={`Rating ${r.stars} bintang`}>
          {'★'.repeat(r.stars)}
        </div>
      </div>

      {/* Foto Photocard Pesanan Jika Ada */}
      {r.photo && (
        <img
          src={r.photo}
          alt={`Pesanan ${r.name}`}
          className="review-card-photo-thumb"
          loading="lazy"
          decoding="async"
          onClick={() => onZoom(r.photo)}
          title="Klik untuk perbesar foto"
        />
      )}

      <p className="review-card-text">"{r.text}"</p>

      <div className="review-card-footer">
        <span style={{ color: 'rgba(215, 187, 255, 0.9)', fontWeight: 600 }}>{r.item}</span>
        <span>{r.date}</span>
      </div>
    </article>
  )
})

/* ══════════════════════════════════════════════════════════════
   HALAMAN BERANDA UTAMA
══════════════════════════════════════════════════════════════ */
export default function Beranda() {
  const { user, requireAuth } = useApp()

  // State Rating & Review
  const [stats, setStats] = useState(getStoredStats)
  const [communityReviews, setCommunityReviews] = useState(getStoredCommunityReviews)
  const [userReview, setUserReview] = useState(() => getReviewForAccount(user))

  // Sinkronisasi ulasan akun aktif saat status login berubah atau user keluar
  useEffect(() => {
    setUserReview(getReviewForAccount(user))
  }, [user])

  // Form State
  const [selectedStar, setSelectedStar] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [name, setName] = useState('')
  const [fandom, setFandom] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [photoBase64, setPhotoBase64] = useState(null)
  const [photoFileName, setPhotoFileName] = useState('')
  const [formErr, setFormErr] = useState('')
  const fileInputRef = useRef(null)

  // Modal State & Pagination (Batch loading 12 per 12 untuk performa super mulus)
  const [showAllModal, setShowAllModal] = useState(false)
  const [modalFilter, setModalFilter] = useState('Semua')
  const [modalSearch, setModalSearch] = useState('')
  const [visibleModalCount, setVisibleModalCount] = useState(12)
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  // Virtualized Stage State (0: Beranda Utama, 1: Rating & Ulasan, 2: Cerita Teman Closerz)
  const [activeStage, setActiveStage] = useState(0)
  const [animDirection, setAnimDirection] = useState('down')
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const stageLockRef = useRef(false)

  const goToStage = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > 2 || targetIndex === activeStage) return
    if (stageLockRef.current) return
    stageLockRef.current = true
    setAnimDirection(targetIndex > activeStage ? 'down' : 'up')
    setActiveStage(targetIndex)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => {
      stageLockRef.current = false
    }, 550)
  }

  // Event Listeners: Wheel, Touch Swipe & Keyboard Arrow Nav
  useEffect(() => {
    const handleWheel = (e) => {
      if (showAllModal || lightboxPhoto) return
      if (stageLockRef.current) return
      if (e.target.closest('textarea, .reviews-modal-card, .cart-dropdown')) return

      if (e.deltaY > 35) {
        if (activeStage < 2) {
          e.preventDefault()
          goToStage(activeStage + 1)
        }
      } else if (e.deltaY < -35) {
        if (activeStage > 0) {
          e.preventDefault()
          goToStage(activeStage - 1)
        }
      }
    }

    const handleTouchStart = (e) => {
      if (showAllModal || lightboxPhoto) return
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e) => {
      if (showAllModal || lightboxPhoto) return
      if (stageLockRef.current) return
      if (e.target.closest('textarea, input, select, .reviews-modal-card, .cart-dropdown')) return

      const deltaY = touchStartY.current - e.changedTouches[0].clientY
      const deltaX = touchStartX.current - e.changedTouches[0].clientX

      // Jika user sedang swipe horizontal pada 5 kartu ulasan di mobile/tablet, jangan ganti stage
      if (e.target.closest('.reviews-grid-5') && Math.abs(deltaX) > 20) {
        return
      }

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && activeStage < 2) {
          goToStage(activeStage + 1)
        } else if (deltaY < 0 && activeStage > 0) {
          goToStage(activeStage - 1)
        }
      }
    }

    const handleKeyDown = (e) => {
      if (showAllModal || lightboxPhoto) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeStage < 2) {
          e.preventDefault()
          goToStage(activeStage + 1)
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeStage > 0) {
          e.preventDefault()
          goToStage(activeStage - 1)
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeStage, showAllModal, lightboxPhoto])

  // Reset pagination saat filter atau pencarian modal berganti
  useEffect(() => {
    setVisibleModalCount(12)
  }, [modalFilter, modalSearch, showAllModal])

  // Hanya bernilai true jika akun yang sedang login sudah pernah mengisi review
  const hasRated = Boolean(user && userReview)

  // Handler Upload Foto Kartu Pelanggan
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setFormErr('Ukuran file foto maksimal 5MB.')
      return
    }
    setFormErr('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoBase64(ev.target.result)
      setPhotoFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhotoBase64(null)
    setPhotoFileName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handler Submit Rating & Review
  const handleSubmitReview = (e) => {
    e.preventDefault()

    // Tamu yang tidak masuk/login TIDAK BISA mengirim ulasan
    if (!user) {
      requireAuth('mengirim ulasan dan rating pengalaman berbelanja')
      setFormErr('Kamu harus masuk ke akun terlebih dahulu sebelum dapat mengirim ulasan.')
      return
    }

    // 1 akun hanya bisa memberi rating bintang 1x
    if (hasRated) return

    if (selectedStar < 1 || selectedStar > 5) {
      setFormErr('Silakan pilih rating bintang terlebih dahulu.')
      return
    }
    if (!name.trim()) {
      setFormErr('Silakan isi nama atau panggilan kamu.')
      return
    }
    if (!reviewText.trim()) {
      setFormErr('Silakan tulis ulasan pengalaman berbelanja kamu.')
      return
    }

    setFormErr('')
    const newTotalCount = stats.totalCount + 1
    const newTotalScore = stats.totalScore + selectedStar
    const newDist = {
      ...stats.distribution,
      [selectedStar]: (stats.distribution[selectedStar] || 0) + 1,
    }

    const newStats = {
      totalCount: newTotalCount,
      totalScore: newTotalScore,
      distribution: newDist,
    }

    const newReview = {
      id: Date.now(),
      userEmail: user,
      name: name.trim(),
      username: '@' + name.trim().toLowerCase().replace(/\s+/g, '_'),
      fandom: fandom.trim() || 'K-Pop Collector',
      avatar: name.trim().charAt(0).toUpperCase(),
      avatarBg: 'linear-gradient(135deg, #10b981, #06b6d4)',
      stars: selectedStar,
      text: reviewText.trim(),
      photo: photoBase64,
      item: 'Pesanan Photocard Resmi Group Order',
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) + ' · Verified Order',
      timestamp: Date.now(),
    }

    try {
      // 1. Simpan ulasan per akun pengguna (1 akun = 1x kesempatan)
      localStorage.setItem(`closerz_user_review_${user.toLowerCase().trim()}`, JSON.stringify(newReview))
      localStorage.setItem(USER_REVIEW_STORAGE_KEY, JSON.stringify(newReview))
      // 2. Simpan update statistik agregat real time
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats))
      // 3. Simpan ke database komunitas agar ulasan tetap tampil ke seluruh pengunjung
      const currentCommunity = getStoredCommunityReviews()
      const updatedCommunity = [newReview, ...currentCommunity.filter((r) => r.userEmail !== user)]
      localStorage.setItem(COMMUNITY_REVIEWS_KEY, JSON.stringify(updatedCommunity))
      setCommunityReviews(updatedCommunity)
    } catch (err) { }

    setStats(newStats)
    setUserReview(newReview)
  }

  const average = (stats.totalScore / stats.totalCount).toFixed(1)
  const starHints = [
    '',
    'Kurang Memuaskan (1/5)',
    'Cukup (2/5)',
    'Bagus (3/5)',
    'Sangat Bagus (4/5)',
    'Luar Biasa Memuaskan! (5/5)',
  ]
  const currentHint = starHints[hoveredStar || selectedStar || 0]

  // Gabungkan ulasan user aktif (jika ada), ulasan komunitas, dan 50 dummy reviews (Memoized)
  const allReviewsList = useMemo(() => [
    ...(userReview ? [userReview] : []),
    ...communityReviews.filter((r) => !userReview || r.id !== userReview.id),
    ...DUMMY_REVIEWS,
  ], [userReview, communityReviews])

  // Filter untuk Modal 50 Ulasan Lengkap (Memoized)
  const filteredModalReviews = useMemo(() => {
    return allReviewsList.filter((r) => {
      let matchFilter = true
      if (modalFilter === '5 Bintang') matchFilter = r.stars === 5
      else if (modalFilter === 'Foto') matchFilter = Boolean(r.photo)
      else if (modalFilter !== 'Semua') matchFilter = r.fandom.toLowerCase().includes(modalFilter.toLowerCase()) || r.item.toLowerCase().includes(modalFilter.toLowerCase())

      let matchSearch = true
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase()
        matchSearch = r.name.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          r.fandom.toLowerCase().includes(q) ||
          r.item.toLowerCase().includes(q)
      }
      return matchFilter && matchSearch
    })
  }, [allReviewsList, modalFilter, modalSearch])

  // Batch item yang saat ini ditampilkan dalam modal
  const visibleModalReviews = useMemo(() => {
    return filteredModalReviews.slice(0, visibleModalCount)
  }, [filteredModalReviews, visibleModalCount])

  // 5 Ulasan Pilihan Teman Closerz (1 Baris Pas & Rapi dalam 1 Layar Penuh)
  const fiveReviews = useMemo(() => {
    return allReviewsList.slice(0, 5)
  }, [allReviewsList])

  return (
    <>
      {/* Staged Virtualized Viewport Container (Zero Offscreen DOM Overhead) */}
      <div className={`beranda-stage-viewport anim-${animDirection}`}>
        {/* ── LAYAR 1: HERO UTAMA ── */}
        {activeStage === 0 && (
          <div className="beranda-stage-pane beranda-stage-pane--hero" key="stage-0">
            <section className="hero" id="beranda">
              <div className="hero-text">
                <h1>
                  Koleksi Photocard<br />
                  <span>K-Pop Impianmu</span>
                </h1>

                <p className="hero-subtext">
                  Platform Group Order terpercaya untuk photocard resmi album, lucky draw, dan fansign Korea langsung ke Indonesia.
                </p>

                <p className="hero-countdown-label">PO batch 04 ditutup dalam:</p>
                <Countdown />
              </div>

              <div className="hero-cards" aria-label="Klik kartu untuk membaliknya">
                {HERO_CARDS.map((c, i) => (
                  <FlipCard
                    key={c.name}
                    card={c}
                    style={{
                      '--rot': `${c.rot}deg`,
                      '--x': `${c.x}px`,
                      '--y': `${c.y}px`,
                      '--stagger': `${160 + i * 220}ms`,
                      zIndex: c.zIndex ?? (i + 1),
                    }}
                  />
                ))}
                <p className="hint">Flip the Photocard</p>
              </div>
            </section>
          </div>
        )}

        {/* ── LAYAR 2: SATU LAYAR PENUH FORM RATING, REVIEW & UPLOAD FOTO ── */}
        {activeStage === 1 && (
          <div className="beranda-stage-pane beranda-stage-pane--rating" key="stage-1">
            <section className="screen-rating-form-section" id="isi-rating-review" aria-label="Formulir Rating & Review Pelanggan">
        {!hasRated ? (
          <div className="rating-form-card">
            <div className="rating-form-header">
              <div className="rating-badge-live">
                <span className="live-dot" aria-hidden="true" />
                <span>Real-Time Customer Rating</span>
              </div>
              <h2>Beri Rating &amp; Ulasan Pengalaman Belanja</h2>
              <p>Bagikan penilaian bintang, ulasan teks, dan upload foto pesanan kartu yang sudah kamu terima.</p>
            </div>

            {/* Banner Informasi Status Login Akun */}
            {!user ? (
              <div className="guest-auth-banner" role="alert">
                <div className="guest-auth-content">
                  <div className="guest-auth-title">Login Diperlukan untuk Mengirim Ulasan</div>
                  <p className="guest-auth-desc">
                    Halaman ulasan ini terbuka untuk dibaca semua pengunjung. Untuk mengirimkan rating bintang &amp; ulasan, silakan masuk ke akun GO Closerz terlebih dahulu (1 akun = 1x kesempatan rating).
                  </p>
                </div>
                <button
                  type="button"
                  className="guest-auth-login-btn"
                  onClick={() => requireAuth('mengirim ulasan dan rating pengalaman berbelanja')}
                >
                  Masuk Akun
                </button>
              </div>
            ) : (
              <div className="user-auth-badge">
                <span className="user-auth-dot" aria-hidden="true" />
                <span>Masuk sebagai <strong>{user}</strong> · Tersedia 1x kesempatan rating untuk akun ini</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} noValidate>
              {/* Star Rating Picker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  className="rating-stars-picker"
                  onMouseLeave={() => setHoveredStar(0)}
                  role="radiogroup"
                  aria-label="Pilih bintang 1 sampai 5"
                >
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isLit = (hoveredStar || selectedStar) >= val
                    return (
                      <button
                        key={val}
                        type="button"
                        role="radio"
                        aria-checked={selectedStar === val}
                        className={`star-btn ${isLit ? 'active' : ''} ${hoveredStar >= val ? 'hovered' : ''}`}
                        onClick={() => setSelectedStar(val)}
                        onMouseEnter={() => setHoveredStar(val)}
                        aria-label={`${val} Bintang`}
                      >
                        ★
                      </button>
                    )
                  })}
                </div>
                <div className="star-hint-text">{currentHint || 'Pilih rating bintang pengalaman belanjamu'}</div>
              </div>

              {/* Input Nama & Fandom / Bias */}
              <div className="review-input-row">
                <div className="review-field-group">
                  <label htmlFor="rev-name">Nama / Panggilan *</label>
                  <input
                    id="rev-name"
                    type="text"
                    className="review-input"
                    placeholder="Contoh: Nabila S."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="review-field-group">
                  <label htmlFor="rev-fandom">Fandom / Grup Bias (Opsional)</label>
                  <input
                    id="rev-fandom"
                    type="text"
                    className="review-input"
                    placeholder="Contoh: MY · aespa / Closerz · CYE"
                    value={fandom}
                    onChange={(e) => setFandom(e.target.value)}
                  />
                </div>
              </div>

              {/* Textarea Ulasan */}
              <div className="review-field-group">
                <label htmlFor="rev-text">Ulasan Pengalaman Kamu *</label>
                <textarea
                  id="rev-text"
                  className="review-textarea"
                  placeholder="Ceritakan kondisi kartu, kerapian toploader & sleeve, respon admin WhatsApp, atau kecepatan pengiriman..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>

              {/* Upload Foto Pesanan Kartu Yang Sudah Datang */}
              <div className="photo-upload-zone">
                <label className="photo-upload-label" htmlFor="photo-file-input">
                  <div className="photo-upload-text">
                    <strong>Upload Foto Pesanan Kartu (Opsional)</strong>
                    <small>Upload bukti photocard yang sudah tiba di tanganmu (JPG/PNG/WebP, Max 5MB)</small>
                  </div>
                </label>
                <input
                  id="photo-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />

                {photoBase64 && (
                  <div className="photo-preview-wrap">
                    <img
                      src={photoBase64}
                      alt="Preview Pesanan"
                      className="photo-preview-thumb"
                      loading="lazy"
                      decoding="async"
                      onClick={() => setLightboxPhoto(photoBase64)}
                      title="Klik untuk memperbesar"
                    />
                    <button type="button" className="btn-remove-photo" onClick={handleRemovePhoto}>
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {formErr && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', marginBottom: '14px' }}>{formErr}</p>}

              {!user ? (
                <button
                  type="button"
                  className="rating-submit-btn rating-submit-btn--guest"
                  onClick={() => {
                    requireAuth('mengirim ulasan dan rating pengalaman berbelanja')
                    setFormErr('Kamu harus masuk / login ke akun terlebih dahulu untuk mengirim ulasan.')
                  }}
                >
                  Masuk Akun untuk Kirim Ulasan
                </button>
              ) : (
                <button type="submit" className="rating-submit-btn">
                  Kirim Ulasan &amp; Rating (1x Kesempatan)
                </button>
              )}
            </form>
          </div>
        ) : (
          /* User Sudah Pernah Mengisi Rating & Review */
          <div className="user-submitted-preview-card">
            <div className="user-has-rated-banner" role="status">
              <span>Ulasan &amp; Rating Kamu Berhasil Tersimpan!</span>
            </div>

            <h3 style={{ color: '#fff', fontSize: '20px', margin: '4px 0 14px' }}>Terima kasih telah memberikan ulasan di GO Closerz!</h3>

            <div className="user-card-display">
              {userReview.photo && (
                <img
                  src={userReview.photo}
                  alt="Foto pesanan Anda"
                  className="user-card-display-photo"
                  loading="lazy"
                  decoding="async"
                  onClick={() => setLightboxPhoto(userReview.photo)}
                  title="Klik untuk zoom foto kartu"
                />
              )}
              <div className="user-card-display-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '15px' }}>{userReview.name}</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--sky)' }}>{userReview.fandom}</span>
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '15px' }}>{'★'.repeat(userReview.stars)}</div>
                </div>
                <p style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: '8px 0' }}>
                  "{userReview.text}"
                </p>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                  {userReview.item} · {userReview.date}
                </div>
              </div>
            </div>

            {/* Live Real-time Rating Aggregate Dashboard */}
            <div className="rating-dashboard" aria-label="Ringkasan Rating Real-Time">
              <div className="rating-summary-left">
                <span className="rating-big-num">
                  {average} <small>/ 5.0</small>
                </span>
                <div className="rating-stars-solid" aria-hidden="true">
                  {'★'.repeat(Math.round(Number(average)))}
                </div>
                <span className="rating-total-count">
                  Berdasarkan <strong>{stats.totalCount.toLocaleString('id-ID')}</strong> ulasan pembeli
                </span>
              </div>

              <div className="rating-bars-right" aria-label="Distribusi bintang">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = stats.distribution[s] || 0
                  const pct = Math.round((count / stats.totalCount) * 100)
                  return (
                    <div className="rating-bar-row" key={s}>
                      <span className="bar-label">{s} Bintang</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="bar-percent">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )}

        {/* ── LAYAR 3: SATU LAYAR PENUH 5 ULASAN & TOMBOL ULASAN LEBIH LENGKAP ── */}
        {activeStage === 2 && (
          <div className="beranda-stage-pane beranda-stage-pane--reviews" key="stage-2">
            <section className="screen-all-reviews-section" id="ulasan-pelanggan" aria-label="Ulasan Seluruh Pelanggan">
              {/* Teks Utama Ulasan Teman Closerz */}
              <div className="reviews-section-header">
                <h2>Cerita Pengalaman Teman Closerz</h2>
                <p>Ulasan nyata kepuasan kolektor photocard Group Order di GO Closerz dari seluruh Indonesia.</p>
              </div>

              {/* Grid 5 Ulasan: 1 Baris Rapi Pas Layar */}
              <div className="reviews-grid-5" aria-label="5 Ulasan Pembeli Terpilih">
                {fiveReviews.map((r) => (
                  <ReviewCardItem key={r.id} r={r} onZoom={setLightboxPhoto} />
                ))}
              </div>

              {/* Tombol Melihat Ulasan Lebih Lengkap */}
              <div className="reviews-action-menu">
                <button
                  type="button"
                  className="btn-open-all-reviews"
                  onClick={() => setShowAllModal(true)}
                  aria-label="Lihat ulasan lebih lengkap"
                >
                  <span>Lihat Ulasan Lebih Lengkap ({allReviewsList.length}+ Ulasan) →</span>
                </button>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL POPUP: MELIHAT SEMUA 50 ULASAN LENGKAP
      ══════════════════════════════════════════════════════════════ */}
      {showAllModal && (
        <div className="reviews-modal-backdrop" onClick={() => setShowAllModal(false)} role="dialog" aria-modal="true">
          <div className="reviews-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="reviews-modal-header">
              <div>
                <h3>Ulasan Lengkap Pembeli GO Closerz</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                  Menampilkan {filteredModalReviews.length} dari {allReviewsList.length} ulasan kolektor K-Pop terverifikasi
                </p>
              </div>
              <button
                type="button"
                className="reviews-modal-close"
                onClick={() => setShowAllModal(false)}
                aria-label="Tutup jendela ulasan"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Filter & Search Bar dalam Modal */}
            <div className="reviews-modal-controls">
              {['Semua', '5 Bintang', 'Foto', 'aespa', 'CYE', 'ILLIT', 'TREASURE', 'BABYMONSTER'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`reviews-filter-btn ${modalFilter === tab ? 'active' : ''}`}
                  onClick={() => setModalFilter(tab)}
                >
                  {tab === 'Foto' ? 'Dengan Foto' : tab === '5 Bintang' ? '5 Bintang' : tab}
                </button>
              ))}

              <input
                type="text"
                placeholder="Cari member favorit (misal: Karina, Wonhee, Haruto...)"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="reviews-search-input"
              />
            </div>

            {/* Body Grid Seluruh Ulasan */}
            <div className="reviews-modal-body">
              {visibleModalReviews.map((r) => (
                <ReviewCardItem key={r.id} r={r} onZoom={setLightboxPhoto} />
              ))}

              {visibleModalCount < filteredModalReviews.length && (
                <div className="reviews-modal-load-more">
                  <button
                    type="button"
                    className="btn-load-more-reviews"
                    onClick={() => setVisibleModalCount((prev) => Math.min(prev + 12, filteredModalReviews.length))}
                  >
                    Tampilkan Lebih Banyak ({visibleModalReviews.length} dari {filteredModalReviews.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LIGHTBOX ZOOM FOTO KARTU
      ══════════════════════════════════════════════════════════════ */}
      {lightboxPhoto && (
        <div className="lightbox-backdrop" onClick={() => setLightboxPhoto(null)} role="dialog" aria-modal="true">
          <img src={lightboxPhoto} alt="Zoom Foto Photocard" className="lightbox-img" />
        </div>
      )}
    </>
  )
}

