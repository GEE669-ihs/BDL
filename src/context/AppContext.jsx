import { createContext, useContext, useState } from 'react'
import { FIGMA_CATALOG_CARDS } from '../data/figmaCatalog'

const SESSION_KEY = 'closerz_user_session'
const SLOTS_STORAGE_KEY = 'closerz_card_slots'

const getInitialSlots = () => {
  try {
    const saved = localStorage.getItem(SLOTS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object') return parsed
    }
  } catch {}
  const initial = {}
  FIGMA_CATALOG_CARDS.forEach((c) => {
    initial[c.id] = c.slots
  })
  return initial
}

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? { email: raw, name: raw.split('@')[0] } : null
    }
    return null
  })

  // Cart disimpan sebagai array objek: [{ id, name, group, type, edition, price, qty, stock, ... }]
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [slots, setSlots] = useState(getInitialSlots)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const login = (userData) => {
    const u = typeof userData === 'string' ? { email: userData, name: userData.split('@')[0] } : userData
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    setCart([])
  }

  const getCardSlot = (cardId) => {
    if (slots[cardId] !== undefined) return slots[cardId]
    const found = FIGMA_CATALOG_CARDS.find((c) => c.id === cardId)
    return found ? found.slots : 0
  }

  // Tambah photocard ke keranjang
  const add = (card, qty = 1) => {
    const availableSlot = getCardSlot(card.id)
    if (availableSlot <= 0) {
      showToast(`Slot untuk ${card.name} sudah habis!`)
      return false
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === card.id)
      if (existingIndex > -1) {
        const next = [...prev]
        const currentQty = next[existingIndex].qty || 1
        const newQty = Math.min(availableSlot, currentQty + qty)
        next[existingIndex] = { ...next[existingIndex], qty: newQty }
        return next
      } else {
        return [
          ...prev,
          {
            ...card,
            type: card.type || card.edition || 'Fotokard PO',
            qty: Math.min(availableSlot, qty),
            stock: availableSlot,
          },
        ]
      }
    })

    showToast(`${card.name} (${qty} kartu) berhasil ditambahkan ke keranjang!`)
    return true
  }

  // Update kuantitas item dalam keranjang
  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      remove(id)
      return
    }
    const maxAvailable = getCardSlot(id)
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.min(maxAvailable, newQty) } : item
      )
    )
  }

  // Hapus item dari keranjang
  const remove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Kosongkan keranjang
  const clear = () => setCart([])

  // Kurangi kuantitas slot saat checkout selesai
  const reduceSlots = (orderedItems) => {
    setSlots((prev) => {
      const next = { ...prev }
      orderedItems.forEach((item) => {
        const current = next[item.id] !== undefined ? next[item.id] : item.slots
        const qty = item.qty || 1
        next[item.id] = Math.max(0, current - qty)
      })
      try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0)
  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0)
  const total = subtotal

  return (
    <AppCtx.Provider
      value={{
        user,
        login,
        logout,
        cart,
        items: cart, // alias kompatibilitas
        count,
        subtotal,
        total,
        toast,
        add,
        updateQty,
        remove,
        clear,
        slots,
        getCardSlot,
        reduceSlots,
      }}
    >
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
