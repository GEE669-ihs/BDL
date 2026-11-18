import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './FigmaAdmin.css'

export default function FigmaAdmin() {
  const navigate = useNavigate()
  const {
    groups,
    catalogCards,
    getCardSlot,
    increaseSlot,
    setCardSlotDirect,
    toggleCardStatus,
    addGroup,
    deleteGroup,
    addCard,
    deleteCard,
    resetToDefault,
  } = useApp()

  // State Form Tambah Grup
  const [groupName, setGroupName] = useState('')
  const [groupFullName, setGroupFullName] = useState('')

  // State Form Tambah Photocard
  const [selectedGroup, setSelectedGroup] = useState('CYE')
  const [memberName, setMemberName] = useState('')
  const [edition, setEdition] = useState('')
  const [cardStatus, setCardStatus] = useState('Ready Stock') // 'Ready Stock' | 'Pre-Order'
  const [slots, setSlots] = useState('10')
  const [price, setPrice] = useState('18000')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  // Quick edit slot state
  const [editingSlotId, setEditingSlotId] = useState(null)
  const [tempSlotVal, setTempSlotVal] = useState('')

  // PIN Protection State (Khusus Teman - 6 Digit)
  const ADMIN_PIN = '240404'
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('closerz_admin_unlocked') === 'true'
  })
  const [adminPinInput, setAdminPinInput] = useState('')
  const [adminPinError, setAdminPinError] = useState('')

  const handleUnlockAdmin = (e) => {
    e.preventDefault()
    if (adminPinInput.trim() === ADMIN_PIN) {
      sessionStorage.setItem('closerz_admin_unlocked', 'true')
      setIsUnlocked(true)
      setAdminPinError('')
    } else {
      setAdminPinError('PIN salah! Akses ke panel admin ditolak.')
    }
  }

  // Kembali ke website dan kunci kembali sesi admin
  const handleReturnToWebsite = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    sessionStorage.removeItem('closerz_admin_unlocked')
    setIsUnlocked(false)
    setAdminPinInput('')
    navigate('/landing')
  }

  // Saat komponen admin unmount (pindah rute), selalu bersihkan izin unlock
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('closerz_admin_unlocked')
    }
  }, [])

  const fileInputRef = useRef(null)

  // Handle upload file foto lokal
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
        setImageUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit Tambah Grup Baru
  const handleAddGroupSubmit = (e) => {
    e.preventDefault()
    if (!groupName.trim()) {
      alert('Nama grup tidak boleh kosong!')
      return
    }
    const success = addGroup({
      name: groupName.trim(),
      fullName: groupFullName.trim() || groupName.trim(),
    })
    if (success) {
      setGroupName('')
      setGroupFullName('')
    }
  }

  // Submit Tambah Photocard Baru dengan panel status Ready Stock / Pre-Order
  const handleAddCardSubmit = (e) => {
    e.preventDefault()
    if (!memberName.trim()) {
      alert('Nama member tidak boleh kosong!')
      return
    }
    if (!selectedGroup) {
      alert('Pilih grup terlebih dahulu!')
      return
    }

    const parsedSlots = parseInt(slots, 10) || 10
    const parsedPrice = parseInt(price, 10) || 18000

    const success = addCard({
      name: memberName.trim(),
      group: selectedGroup,
      edition: edition.trim() || 'Photocard Album Ver. A',
      status: cardStatus,
      slots: parsedSlots,
      stock: parsedSlots,
      price: parsedPrice,
      image: imageUrl || imagePreview || null,
    })

    if (success) {
      setMemberName('')
      setEdition('')
      setSlots('10')
      setPrice('18000')
      setImageUrl('')
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStartEditSlot = (card) => {
    setEditingSlotId(card.id)
    setTempSlotVal(String(getCardSlot(card.id)))
  }

  const handleSaveEditSlot = (cardId) => {
    setCardSlotDirect(cardId, tempSlotVal)
    setEditingSlotId(null)
  }

  if (!isUnlocked) {
    return (
      <div className="figma-admin-page">
        <header className="figma-admin-header">
          <div className="figma-admin-header-inner">
            <div className="figma-admin-brand">
              <Link to="/landing" className="figma-admin-logo" onClick={handleReturnToWebsite}>
                <span className="logo-g">G</span>
                <span className="logo-star">★</span>
                <span className="logo-closerz">Closerz</span>
              </Link>
              <span className="figma-admin-badge">Admin Dashboard</span>
            </div>
            <div className="figma-admin-nav-actions">
              <button
                type="button"
                className="figma-admin-btn-back"
                onClick={handleReturnToWebsite}
              >
                ← Kembali ke Website
              </button>
            </div>
          </div>
        </header>

        <main className="figma-admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
          <div className="figma-admin-card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: '40px 32px' }}>
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(125, 200, 255, 0.15)',
              border: '1.5px solid #7dc8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#7dc8ff',
              boxShadow: '0 0 16px rgba(125, 200, 255, 0.35)',
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <circle cx="12" cy="15" r="1" fill="currentColor" />
              </svg>
            </div>

            <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 20, color: '#ffffff', marginBottom: 8 }}>
              Panel Admin Terkunci
            </h2>
            <p style={{ color: '#c7dde9', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Halaman ini hanya dapat diakses oleh admin/pengelola. Silakan masukkan 6 digit PIN rahasia untuk melanjutkan:
            </p>

            <form onSubmit={handleUnlockAdmin}>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setAdminPinError('')
                }}
                autoFocus
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 12,
                  border: '1.5px solid rgba(125, 200, 255, 0.4)',
                  background: 'rgba(10, 8, 24, 0.7)',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontSize: 22,
                  letterSpacing: '0.3em',
                  fontFamily: 'Unbounded, monospace',
                  marginBottom: adminPinError ? 8 : 18,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {adminPinError && (
                <div style={{ color: '#ff8ca3', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  {adminPinError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="figma-admin-btn-cancel"
                  onClick={() => navigate('/landing')}
                  style={{ flex: 1, height: 44, borderRadius: 12 }}
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="figma-admin-btn-primary"
                  style={{ flex: 1.2, height: 44, borderRadius: 12 }}
                >
                  Buka Admin
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="figma-admin-page">
      {/* ── TOP HEADER (Tema Halaman Utama Figma) ── */}
      <header className="figma-admin-header">
        <div className="figma-admin-header-inner">
          <div className="figma-admin-brand">
            <Link to="/landing" className="figma-admin-logo" onClick={handleReturnToWebsite}>
              <span className="logo-g">G</span>
              <span className="logo-star">★</span>
              <span className="logo-closerz">Closerz</span>
            </Link>
            <span className="figma-admin-badge">Admin Dashboard</span>
          </div>

          <div className="figma-admin-nav-actions">
            <button
              type="button"
              className="figma-admin-btn-back"
              onClick={handleReturnToWebsite}
            >
              ← Kembali ke Website
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="figma-admin-container">
        {/* Banner Ringkasan */}
        <section className="figma-admin-summary">
          <div>
            <h1 className="figma-admin-title">Kelola Grup, Photocard & Slot</h1>
            <p className="figma-admin-subtitle">
              Admin dapat menambah grup, mengatur status kartu (Ready Stock / Pre-Order), serta menambah atau mengubah sisa slot kartu awal maupun kartu baru.
            </p>
          </div>
          <div className="figma-admin-stats">
            <div className="stat-card">
              <div className="stat-val">{groups.length}</div>
              <div className="stat-label">Total Grup</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{catalogCards.length}</div>
              <div className="stat-label">Total Photocard</div>
            </div>
          </div>
        </section>

        <div className="figma-admin-grid">
          {/* ── KOLOM KIRI: FORM INPUT ── */}
          <div className="figma-admin-forms-col">
            {/* 1. Form Tambah Grup Baru */}
            <div className="figma-admin-panel">
              <h2 className="panel-title">1. Tambah Grup Baru</h2>
              <p className="panel-desc">
                Tambahkan grup baru (misal: RIIZE, TXT, SEVENTEEN). Tab tombol filter akan otomatis bertambah di katalog depan.
              </p>

              <form onSubmit={handleAddGroupSubmit} className="figma-admin-form">
                <div className="form-group">
                  <label htmlFor="groupName">Kode / Nama Singkat Grup *</label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Contoh: RIIZE"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groupFullName">Nama Lengkap Grup (Opsional)</label>
                  <input
                    id="groupFullName"
                    type="text"
                    placeholder="Contoh: RIIZE SM Entertainment"
                    value={groupFullName}
                    onChange={(e) => setGroupFullName(e.target.value)}
                  />
                </div>

                <button type="submit" className="figma-admin-submit-btn">
                  + Tambah Grup
                </button>
              </form>

              {/* Daftar Grup Saat Ini */}
              <div className="current-groups-list">
                <div className="current-groups-title">Daftar Grup Aktif ({groups.length}):</div>
                <div className="group-chips">
                  {groups.map((g) => (
                    <div key={g.name} className="group-chip-item">
                      <span className="chip-name">{g.name}</span>
                      {g.name !== 'CYE' ? (
                        <button
                          type="button"
                          className="chip-del-btn"
                          onClick={() => {
                            if (window.confirm(`Hapus grup ${g.name} beserta semua kartunya?`)) {
                              deleteGroup(g.name)
                            }
                          }}
                          title={`Hapus grup ${g.name}`}
                        >
                          ✕
                        </button>
                      ) : (
                        <span className="chip-badge-default">Default CYE</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Form Tambah Photocard Baru dengan Panel Penentuan Status */}
            <div className="figma-admin-panel">
              <h2 className="panel-title">2. Tambah Photocard Baru</h2>
              <p className="panel-desc">
                Pilih grup dan tentukan status kartu: <strong>Ready Stock</strong> (dengan sisa slot) atau <strong>Pre-Order</strong>.
              </p>

              <form onSubmit={handleAddCardSubmit} className="figma-admin-form">
                {/* Panel Penentuan Status: Ready Stock vs Pre-Order */}
                <div className="form-group">
                  <label>Status Pembelian Kartu *</label>
                  <div className="status-selector-row">
                    <label
                      className={`status-option ${cardStatus === 'Ready Stock' ? 'is-selected is-ready' : ''}`}
                    >
                      <input
                        type="radio"
                        name="cardStatus"
                        value="Ready Stock"
                        checked={cardStatus === 'Ready Stock'}
                        onChange={(e) => setCardStatus(e.target.value)}
                      />
                      <span>● Ready Stock</span>
                    </label>

                    <label
                      className={`status-option ${cardStatus === 'Pre-Order' ? 'is-selected is-po' : ''}`}
                    >
                      <input
                        type="radio"
                        name="cardStatus"
                        value="Pre-Order"
                        checked={cardStatus === 'Pre-Order'}
                        onChange={(e) => setCardStatus(e.target.value)}
                      />
                      <span>★ Pre-Order</span>
                    </label>
                  </div>
                  <div className="status-helper-text">
                    {cardStatus === 'Ready Stock'
                      ? 'Di katalog akan tampil teks "Sisa X slot".'
                      : 'Di katalog hanya akan tampil "Pre-Order" tanpa teks "sisa slot".'}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cardGroup">Pilih Grup *</label>
                  <select
                    id="cardGroup"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    required
                  >
                    {groups.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name} {g.fullName && g.fullName !== g.name ? `(${g.fullName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="memberName">Nama Member *</label>
                  <input
                    id="memberName"
                    type="text"
                    placeholder="Contoh: SUNGMIN"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardEdition">Nama Edisi / Versi Album</label>
                  <input
                    id="cardEdition"
                    type="text"
                    placeholder="Contoh: Photocard Album Ver. A (ETERNAL...)"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="cardSlots">
                      {cardStatus === 'Ready Stock' ? 'Sisa Slot Kartu' : 'Kuota Slot PO'}
                    </label>
                    <input
                      id="cardSlots"
                      type="number"
                      min="1"
                      value={slots}
                      onChange={(e) => setSlots(e.target.value)}
                      required
                    />
                  </div>
                  {/* Label Harga saja, bukan Harga PO */}
                  <div className="form-group">
                    <label htmlFor="cardPrice">Harga (Rp) *</label>
                    <input
                      id="cardPrice"
                      type="number"
                      step="1000"
                      min="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Foto Member Photocard</label>
                  <div className="photo-input-options">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="photo-file-input"
                    />
                    <input
                      type="url"
                      placeholder="Atau tempel link URL foto (https://...)"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setImagePreview(e.target.value)
                      }}
                      className="photo-url-input"
                    />
                  </div>
                  {imagePreview && (
                    <div className="photo-preview-box">
                      <img src={imagePreview} alt="Preview" />
                      <span>Preview Foto Siap Simpan</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="figma-admin-submit-btn">
                  + Simpan Photocard
                </button>
              </form>
            </div>
          </div>

          {/* ── KOLOM KANAN: DAFTAR KARTU & PENAMBAHAN SLOT KARTU AWAL ── */}
          <div className="figma-admin-list-col">
            <div className="figma-admin-panel">
              <div className="panel-header-actions">
                <div>
                  <h2 className="panel-title">3. Daftar & Manajemen Slot Photocard ({catalogCards.length})</h2>
                  <p className="panel-desc">
                    Admin dapat menambah slot langsung pada kartu yang sudah tampil dari awal, mengganti status (Ready Stock / Pre-Order), atau menghapus kartu.
                  </p>
                </div>
                <button
                  type="button"
                  className="figma-admin-reset-btn"
                  onClick={() => {
                    if (window.confirm('Reset semua grup dan photocard kembali ke 7 member default Close Your Eyes (CYE)?')) {
                      resetToDefault()
                    }
                  }}
                  title="Kembalikan data ke awal default CYE"
                >
                  Reset ke Default CYE
                </button>
              </div>

              {/* Grid Daftar Kartu */}
              <div className="admin-cards-list">
                {catalogCards.map((card) => {
                  const currentSlots = getCardSlot(card.id)
                  const isReady = card.status === 'Ready Stock'

                  return (
                    <div key={card.id} className="admin-card-row">
                      {/* Thumbnail Foto */}
                      <div className="admin-card-thumb">
                        {card.image ? (
                          <img src={card.image} alt={card.name} />
                        ) : (
                          <div className="admin-card-placeholder">
                            {card.name.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Info Detail */}
                      <div className="admin-card-info">
                        <div className="admin-card-title">
                          <span className="name">{card.name}</span>
                          <span className="group-badge">{card.group}</span>
                          {/* Status Badge dengan tombol toggle */}
                          <button
                            type="button"
                            className={`admin-status-badge ${isReady ? 'is-ready' : 'is-po'}`}
                            onClick={() => toggleCardStatus(card.id)}
                            title="Klik untuk mengubah status antara Ready Stock / Pre-Order"
                          >
                            {card.status || 'Ready Stock'} ⟲
                          </button>
                        </div>
                        <div className="admin-card-edition">{card.edition}</div>

                        {/* Rincian Harga & Slot */}
                        <div className="admin-card-meta">
                          {/* Label Harga Saja */}
                          <span className="price-tag">
                            <strong>Harga:</strong> Rp{(card.price || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="dot">•</span>
                          {/* Sisa Slot */}
                          <span className="slot-tag">
                            <strong>Slot:</strong> {currentSlots} slot
                          </span>
                        </div>

                        {/* Kontrol Penambahan Slot Kartu Awal */}
                        <div className="admin-slot-controls-row">
                          <span className="slot-ctrl-label">Tambah Slot:</span>
                          <button
                            type="button"
                            className="btn-slot-quick"
                            onClick={() => increaseSlot(card.id, 1)}
                            title="Tambah 1 slot"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            className="btn-slot-quick"
                            onClick={() => increaseSlot(card.id, 5)}
                            title="Tambah 5 slot"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            className="btn-slot-quick"
                            onClick={() => increaseSlot(card.id, 10)}
                            title="Tambah 10 slot"
                          >
                            +10
                          </button>

                          {/* Edit Slot Langsung */}
                          {editingSlotId === card.id ? (
                            <div className="slot-inline-edit">
                              <input
                                type="number"
                                min="0"
                                value={tempSlotVal}
                                onChange={(e) => setTempSlotVal(e.target.value)}
                                className="slot-inline-input"
                              />
                              <button
                                type="button"
                                className="btn-slot-save"
                                onClick={() => handleSaveEditSlot(card.id)}
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                className="btn-slot-cancel"
                                onClick={() => setEditingSlotId(null)}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-slot-set"
                              onClick={() => handleStartEditSlot(card)}
                              title="Ubah nilai slot secara spesifik"
                            >
                              Ubah Slot
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hapus Kartu */}
                      <div className="admin-card-actions">
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => {
                            if (window.confirm(`Hapus photocard ${card.name} (${card.group})?`)) {
                              deleteCard(card.id)
                            }
                          }}
                          title="Hapus Photocard"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
