import { createContext, useContext, useState } from 'react'
import { CARDS } from '../data'

const SESSION_KEY = 'gc_session'
const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem(SESSION_KEY))
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)

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
  }

  const requireAuth = (reason = 'melanjutkan pembelian') => {
    if (!user) {
      setLoginModalReason(reason)
      setLoginModalOpen(true)
      return false
    }
    return true
  }

  const add = (card, qty = 1) => {
    // Pengguna belum login tidak dapat menambahkan photocard ke keranjang
    if (!user) {
      setLoginModalReason(`menambahkan photocard ${card.name} (${card.type}) ke keranjang`)
      setLoginModalOpen(true)
      return false
    }

    setCart((c) => ({
      ...c,
      [card.id]: Math.min(card.stock, (c[card.id] || 0) + qty),
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

  const items = CARDS.filter((c) => cart[c.id] > 0)
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
