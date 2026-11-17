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

/* ---------- Virtualized Review Slot (Hanya Render Saat Berada di Layar Viewport) ---------- */
const VirtualReviewItem = memo(function VirtualReviewItem({ r, onZoom, containerRef, initialVisible = false }) {
  const [isVisible, setIsVisible] = useState(initialVisible)
  const slotRef = useRef(null)
  const heightRef = useRef(260)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      return
    }

    const el = slotRef.current
    if (!el) return
    const rootEl = containerRef?.current || null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          // Rekam tinggi aktual sebelum di-unmount agar scrollbar tetap stabil bebas loncat
          if (el.offsetHeight > 50) {
            heightRef.current = el.offsetHeight
          }
          setIsVisible(false)
        }
      },
      {
        root: rootEl,
        rootMargin: '300px 0px 300px 0px', // Buffer 300px di atas dan bawah untuk render instan bebas jank
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])

  return (
    <div
      ref={slotRef}
      className="virtual-review-slot"
      style={{ minHeight: isVisible ? 'auto' : `${heightRef.current}px` }}
    >
      {isVisible ? (
        <ReviewCardItem r={r} onZoom={onZoom} />
      ) : (
        <div
          className="review-card-virtual-placeholder"
          style={{ height: `${heightRef.current}px` }}
          aria-hidden="true"
        />
      )}
    </div>
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

  // Sinkronisasi ulasan akun aktif saat status login berubah atau user keluar, dan reset form ulasan untuk akun baru
  useEffect(() => {
    setUserReview(getReviewForAccount(user))
    setSelectedStar(0)
    setHoveredStar(0)
    setName('')
    setFandom('')
    setReviewText('')
    setPhotoBase64(null)
    setPhotoFileName('')
    setFormErr('')
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  // Reviews Search & Zoom Lightbox
  const [reviewsSearch, setReviewsSearch] = useState('')
  const [lightboxPhoto, setLightboxPhoto] = useState(null)

  // Virtualized Stage State (0: Hero, 1: Rating Form, 2: 5 Reviewer Utama, 3+: 10 Ulasan Bergantian)
  const [activeStage, setActiveStage] = useState(0)
  const [animDirection, setAnimDirection] = useState('down')
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const stageLockRef = useRef(false)

  // Gabungkan ulasan user aktif (jika ada), ulasan komunitas, dan 50 dummy reviews (Memoized)
  const allReviewsList = useMemo(() => [
    ...(userReview ? [userReview] : []),
    ...communityReviews.filter((r) => !userReview || r.id !== userReview.id),
    ...DUMMY_REVIEWS,
  ], [userReview, communityReviews])

  // 5 Ulasan Pilihan Teman Closerz (Layar 3 / Stage 2)
  const fiveReviews = useMemo(() => {
    return allReviewsList.slice(0, 5)
  }, [allReviewsList])

  // Ulasan Lainnya yang Difilter Berdasarkan Search Bar (Layar 4+ / Stage 3+)
  const filteredOtherReviews = useMemo(() => {
    const others = allReviewsList.slice(5)
    if (!reviewsSearch.trim()) return others
    const q = reviewsSearch.toLowerCase().trim()
    return others.filter((r) => {
      return (
        r.name.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.fandom.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q)
      )
    })
  }, [allReviewsList, reviewsSearch])

  // Batching 10 Ulasan per Layar
  const BATCH_SIZE = 10
  const totalReviewBatches = Math.max(1, Math.ceil(filteredOtherReviews.length / BATCH_SIZE))
  const maxStage = 2 + totalReviewBatches // Stage 0: Hero, Stage 1: Form, Stage 2: 5 Reviewer, Stage 3..N: 10 ulasan per batch

  // Pastikan activeStage tidak melampaui maxStage bila pencarian diubah
  useEffect(() => {
    if (activeStage > maxStage) {
      setActiveStage(maxStage)
    }
  }, [maxStage, activeStage])

  // Reset ke Layar Paling Atas (Hero Stage 0) saat menu navbar ditekan
  useEffect(() => {
    const handleResetTop = () => {
      setActiveStage(0)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    window.addEventListener('closerz:scroll-to-top', handleResetTop)
    return () => window.removeEventListener('closerz:scroll-to-top', handleResetTop)
  }, [])

  const goToStage = (targetIndex) => {
    if (targetIndex < 0 || targetIndex > maxStage || targetIndex === activeStage) return
    if (stageLockRef.current) return
    stageLockRef.current = true
    setAnimDirection(targetIndex > activeStage ? 'down' : 'up')
    setActiveStage(targetIndex)
    window.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => {
      stageLockRef.current = false
    }, 500)
  }

  // Event Listeners: Wheel, Touch Swipe & Keyboard Arrow Nav
  useEffect(() => {
    const handleWheel = (e) => {
      if (lightboxPhoto) return
      if (stageLockRef.current) return
      if (e.target.closest('textarea, .cart-dropdown')) return

      if (e.deltaY > 35) {
        if (activeStage < maxStage) {
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
      if (lightboxPhoto) return
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchEnd = (e) => {
      if (lightboxPhoto) return
      if (stageLockRef.current) return
      if (e.target.closest('textarea, input, select, .cart-dropdown')) return

      const deltaY = touchStartY.current - e.changedTouches[0].clientY
      const deltaX = touchStartX.current - e.changedTouches[0].clientX

      // Jika user sedang swipe horizontal pada kartu ulasan di mobile/tablet, jangan ganti stage
      if (e.target.closest('.reviews-grid-5, .reviews-grid-10') && Math.abs(deltaX) > 20) {
        return
      }

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && activeStage < maxStage) {
          goToStage(activeStage + 1)
        } else if (deltaY < 0 && activeStage > 0) {
          goToStage(activeStage - 1)
        }
      }
    }

    const handleKeyDown = (e) => {
      if (lightboxPhoto) return
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeStage < maxStage) {
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
  }, [activeStage, maxStage, lightboxPhoto])

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

            {/* Teks abu-abu di tengah bawah halaman utama beranda */}
            <div className="beranda-bottom-hint">
              <span>scroll atau swipe untuk memberi review pengalaman belanja kamu</span>
            </div>
          </div>
        )}

        {/* ── LAYAR 2: SATU LAYAR PENUH FORM RATING, REVIEW & UPLOAD FOTO ── */}
        {activeStage === 1 && (
          <div className="beranda-stage-pane beranda-stage-pane--rating" key="stage-1">
            <section className="screen-rating-form-section" id="isi-rating-review" aria-label="Formulir Rating & Review Pelanggan">
              {!hasRated ? (
                <div className="rating-form-card">
                  <div className="rating-form-header">
                    <h2>Bagikan Pengalaman Belanjamu</h2>
                    <p>Penilaian dan ulasanmu sangat berarti untuk kolektor GO Closerz lainnya.</p>
                    {user && (
                      <div className="user-auth-badge">
                        <span className="user-auth-dot" aria-hidden="true" />
                        <span>Masuk sebagai <strong>{user}</strong></span>
                      </div>
                    )}
                  </div>

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
                          placeholder="Contoh: MY · aespa"
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
                        placeholder="Ceritakan kepuasanmu tentang kondisi photocard, packing, respon admin..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      />
                    </div>

                    {/* Upload Foto Pesanan Kartu */}
                    <div className="photo-upload-zone">
                      <label className="photo-upload-label" htmlFor="photo-file-input">
                        <div className="photo-upload-text">
                          <strong>{photoFileName || '+ Lampirkan Foto Photocard (Opsional)'}</strong>
                          <small>{photoFileName ? 'Klik untuk mengganti foto pesanan' : 'Bukti kartu yang sudah tiba di tanganmu (JPG/PNG/WebP, Max 5MB)'}</small>
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

                    {formErr && <p style={{ color: '#f87171', fontSize: '13px', textAlign: 'center', margin: '0 0 10px' }}>{formErr}</p>}

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
                        Kirim Ulasan
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                /* User Sudah Pernah Mengisi Rating & Review (Hasil 1-5 Bintang Dihilangkan Sesuai Request) */
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
                </div>
              )}

              {/* Teks abu-abu di bawah form ulasan review pembeli */}
              <div
                className="review-scroll-hint"
                onClick={() => setActiveStage(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveStage(2) }}
              >
                <span>scroll untuk melihat review dari teman closerz lainnya</span>
                <span className="review-scroll-hint-arrow" aria-hidden="true">↓</span>
              </div>
            </section>
          </div>
        )}

        {/* ── LAYAR 3: SATU LAYAR PENUH 5 ULASAN TERPILIH ── */}
        {activeStage === 2 && (
          <div className="beranda-stage-pane beranda-stage-pane--reviews" key="stage-2">
            <section className="screen-all-reviews-section" id="ulasan-pelanggan" aria-label="Ulasan Seluruh Pelanggan">
              {/* Teks Utama Ulasan Teman Closerz (Diperbesar & Diperjelas) */}
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

              {/* Teks Biasa Warna Abu di Bawah (Kapsul Dihapus Sesuai Permintaan) */}
              <div className="reviews-action-menu">
                <p className="reviews-scroll-hint">
                  Scroll atau swipe ke bawah untuk melihat ulasan lainnya ↓
                </p>
              </div>
            </section>
          </div>
        )}

        {/* ── LAYAR 4+: TAMPILAN ULASAN LAINNYA (10 ULASAN BERGANTIAN PER SCROLL) ── */}
        {activeStage >= 3 && (
          <div className="beranda-stage-pane beranda-stage-pane--more-reviews" key={`stage-${activeStage}`}>
            <section className="screen-all-reviews-section screen-more-reviews-section" aria-label="Ulasan Teman Closerz Lainnya">
              <div className="more-reviews-header">
                <div className="more-reviews-search-wrap">
                  <svg className="reviews-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari member atau band favorit..."
                    value={reviewsSearch}
                    onChange={(e) => {
                      setReviewsSearch(e.target.value)
                      setActiveStage(3)
                    }}
                    className="more-reviews-search-input"
                  />
                  {reviewsSearch && (
                    <button
                      type="button"
                      className="reviews-search-clear"
                      onClick={() => setReviewsSearch('')}
                      aria-label="Hapus kata kunci pencarian"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Grid 10 Ulasan Rapi (5 Kolom x 2 Baris) */}
              {filteredOtherReviews.length > 0 ? (
                <div className="reviews-grid-10" aria-label="Ulasan Teman Closerz">
                  {filteredOtherReviews
                    .slice((activeStage - 3) * BATCH_SIZE, (activeStage - 2) * BATCH_SIZE)
                    .map((r) => (
                      <ReviewCardItem key={r.id} r={r} onZoom={setLightboxPhoto} />
                    ))}
                </div>
              ) : (
                <div className="reviews-empty-state">
                  <p>Tidak ada ulasan yang cocok dengan pencarian "<strong>{reviewsSearch}</strong>".</p>
                  <button type="button" className="btn-reset-search" onClick={() => setReviewsSearch('')}>
                    Tampilkan Semua Ulasan
                  </button>
                </div>
              )}

              {/* Teks Biasa Navigasi di Bawah Layar Tanpa Menyebut Jumlah */}
              <div className="reviews-action-menu">
                {activeStage < maxStage ? (
                  <p className="reviews-scroll-hint">
                    Scroll atau swipe ke bawah untuk melihat ulasan berikutnya ↓
                  </p>
                ) : (
                  <p className="reviews-scroll-hint">
                    Kamu telah melihat seluruh ulasan kolektor · Scroll ke atas untuk kembali ↑
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

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

