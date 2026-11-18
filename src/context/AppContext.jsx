import { createContext, useContext, useState } from 'react'
import { CARDS } from '../data'

const SESSION_KEY = 'gc_session'
const SLOTS_STORAGE_KEY = 'closerz_card_slots'

// Inisialisasi slot dari localStorage atau default data CARDS
const getInitialSlots = () => {
  try {
    const saved = localStorage.getItem(SLOTS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {}
  const initial = {}
  CARDS.forEach((c) => {
    initial[c.id] = c.stock
  })
  return initial
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(SESSION_KEY))
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [slots, setSlots] = useState(getInitialSlots)

  // State untuk modal persyaratan login sebelum belanja
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loginModalReason, setLoginModalReason] = useState('')

  const login = (em) => {
    localStorage.setItem(SESSION_KEY, em)
    setUser(em)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setCart({})
  }

  const requireAuth = (reason = 'melanjutkan pembelian') => {
    if (!user) {
      setLoginModalReason(reason)
      setLoginModalOpen(true)
      return false
    }
    return true
  }

  // Dapatkan sisa slot photocard saat ini
  const getCardSlot = (cardId) => {
    if (slots[cardId] !== undefined) {
      return slots[cardId]
    }
    const found = CARDS.find((c) => c.id === cardId)
    return found ? found.stock : 0
  }

  // Kurangi slot saat checkout selesai
  const reduceSlots = (orderedItems) => {
    setSlots((prev) => {
      const next = { ...prev }
      orderedItems.forEach((item) => {
        const current = next[item.id] !== undefined ? next[item.id] : item.stock
        const qty = item.qty || 1
        next[item.id] = Math.max(0, current - qty)
      })
      try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const add = (card, qty = 1) => {
    // Pengguna belum login tidak dapat menambahkan photocard ke keranjang
    if (!user) {
      setLoginModalReason(`menambahkan photocard ${card.name} (${card.type}) ke keranjang`)
      setLoginModalOpen(true)
      return false
    }

    const availableSlot = getCardSlot(card.id)
    if (availableSlot <= 0) {
      setToast(`Maaf, slot untuk photocard ${card.name} sudah habis!`)
      setTimeout(() => setToast(null), 2500)
      return false
    }

    setCart((c) => ({
      ...c,
      [card.id]: Math.min(availableSlot, (c[card.id] || 0) + qty),
    }))
    setToast(`${card.name} (${qty} kartu) ditambahkan ke keranjang`)
    setTimeout(() => setToast(null), 2500)
    return true
  }

  const remove = (id) =>
    setCart((c) => {
      const next = { ...c }
      delete next[id]
      return next
    })

  const clear = () => setCart({})

  const items = CARDS.filter((c) => cart[c.id] > 0).map((c) => ({
    ...c,
    stock: getCardSlot(c.id),
  }))
  const count = items.reduce((n, c) => n + cart[c.id], 0)
  const total = items.reduce((n, c) => n + cart[c.id] * c.price, 0)

  return (
    <AppCtx.Provider
      value={{
        user,
        login,
        logout,
        requireAuth,
        cart,
        cartOpen,
        setCartOpen,
        toast,
        add,
        remove,
        clear,
        items,
        count,
        total,
        slots,
        getCardSlot,
        reduceSlots,
        loginModalOpen,
        setLoginModalOpen,
        loginModalReason,
        setLoginModalReason,
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
