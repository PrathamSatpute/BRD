import React, { useEffect, useMemo, useState } from 'react'

const api = {
  async getProducts() {
    const res = await fetch('/api/products')
    if (!res.ok) throw new Error('Failed to load products')
    return res.json()
  },
  async getCart() {
    const res = await fetch('/api/cart')
    if (!res.ok) throw new Error('Failed to load cart')
    return res.json()
  },
  async addToCart(productId, qty) {
    const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, qty }) })
    if (!res.ok) throw new Error('Failed to add to cart')
    return res.json()
  },
  async removeFromCart(id) {
    const res = await fetch(`/api/cart/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove from cart')
    return res.json()
  },
  async updateQty(id, qty) {
    const res = await fetch(`/api/cart/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ qty }) })
    if (!res.ok) throw new Error('Failed to update qty')
    return res.json()
  },
  async checkout(payload) {
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('Checkout failed')
    return res.json()
  }
}

function useApiState() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([api.getProducts(), api.getCart()])
      .then(([p, c]) => { if (mounted) { setProducts(p); setCart(c); } })
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  return { products, setProducts, cart, setCart, loading, error, setError }
}

function ProductsGrid({ products, onAdd }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {products.map((p) => (
        <div key={p.id} style={{ background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid #1f2937' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{p.name}</div>
          <div style={{ color: 'var(--muted)', marginBottom: 12 }}>${p.price.toFixed(2)}</div>
          <button onClick={() => onAdd(p.id)} style={{ background: 'var(--primary)', color: '#031018', border: 'none', padding: '10px 12px', borderRadius: 8, fontWeight: 600, width: '100%' }}>Add to Cart</button>
        </div>
      ))}
    </div>
  )
}

function CartView({ cart, onRemove, onUpdate }) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid #1f2937' }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Cart</div>
      {cart.items.length === 0 ? (
        <div style={{ color: 'var(--muted)' }}>Your cart is empty</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {cart.items.map((line) => (
            <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{line.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>${line.price.toFixed(2)} each</div>
              </div>
              <div>
                <input type="number" min={1} value={line.qty}
                  onChange={(e) => onUpdate(line.id, Number(e.target.value))}
                  style={{ width: 72, background: '#0e141b', color: 'var(--text)', border: '1px solid #243244', borderRadius: 8, padding: '6px 8px' }} />
              </div>
              <div style={{ textAlign: 'right' }}>${(line.price * line.qty).toFixed(2)}</div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => onRemove(line.id)} style={{ background: 'transparent', color: '#ff8a8a', border: '1px solid #3a1f25', padding: '8px 10px', borderRadius: 8 }}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #243244', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--muted)' }}>Total</div>
            <div style={{ fontWeight: 700 }}>${cart.total.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <div style={{ background: 'var(--card)', border: '1px solid #1f2937', borderRadius: 12, maxWidth: 520, width: '100%', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Receipt</div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid #243244', padding: '6px 10px', borderRadius: 8 }}>Close</button>
        </div>
        <div style={{ marginTop: 12, color: 'var(--muted)', fontSize: 14 }}>{new Date(receipt.timestamp).toLocaleString()}</div>
        <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {receipt.items.map((line) => (
            <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <div>{line.name} × {line.qty}</div>
              <div>${(line.price * line.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #243244', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <div>Total</div>
          <div style={{ fontWeight: 700 }}>${receipt.total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { products, cart, setCart, loading, error, setError } = useApiState()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [receipt, setReceipt] = useState(null)

  const canCheckout = useMemo(() => cart.items.length > 0 && name && /@/.test(email), [cart.items.length, name, email])

  async function handleAdd(productId) {
    try {
      const updated = await api.addToCart(productId, 1)
      setCart(updated)
    } catch (e) { setError(e.message) }
  }

  async function handleRemove(id) {
    try {
      const updated = await api.removeFromCart(id)
      setCart(updated)
    } catch (e) { setError(e.message) }
  }

  async function handleUpdate(id, qty) {
    try {
      const updated = await api.updateQty(id, qty)
      setCart(updated)
    } catch (e) { setError(e.message) }
  }

  async function handleCheckout(e) {
    e.preventDefault()
    try {
      const res = await api.checkout({ name, email })
      setReceipt(res.receipt)
      // reset form and cart UI state
      setName('')
      setEmail('')
      setCart({ items: [], subtotal: 0, total: 0 })
    } catch (e) { setError(e.message) }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Vibe Commerce</div>
        <div style={{ color: 'var(--muted)' }}>Mock E-Com Cart</div>
      </header>

      {error && (
        <div style={{ background: '#351a1e', border: '1px solid #5a2b33', color: '#ffb4c0', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 10, fontWeight: 700 }}>Products</div>
            <ProductsGrid products={products} onAdd={handleAdd} />
          </div>
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <CartView cart={cart} onRemove={handleRemove} onUpdate={handleUpdate} />
            <form onSubmit={handleCheckout} style={{ background: 'var(--card)', borderRadius: 12, padding: 16, border: '1px solid #1f2937' }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Checkout</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe"
                    style={{ width: '100%', background: '#0e141b', color: 'var(--text)', border: '1px solid #243244', borderRadius: 8, padding: '10px 12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginBottom: 6 }}>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@vibe.com"
                    style={{ width: '100%', background: '#0e141b', color: 'var(--text)', border: '1px solid #243244', borderRadius: 8, padding: '10px 12px' }} />
                </div>
                <button disabled={!canCheckout} type="submit" style={{ background: canCheckout ? 'var(--accent)' : '#1f2a35', color: canCheckout ? '#031018' : '#7c91a8', border: 'none', padding: '12px 14px', borderRadius: 8, fontWeight: 700 }}>Checkout</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 24, color: 'var(--muted)', fontSize: 13 }}>
        Built for Vibe Commerce screening — no real payments
      </footer>

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  )
}


