import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { products } from './products.js';

const app = express();
const port = process.env.PORT || 4000;

// In-memory cart keyed by itemId (unique line id)
let nextLineId = 1;
const cartItems = new Map();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function calculateCartTotals() {
  let subtotal = 0;
  const items = Array.from(cartItems.values()).map((line) => {
    const lineTotal = line.price * line.qty;
    subtotal += lineTotal;
    return { ...line, lineTotal };
  });
  return {
    items,
    subtotal,
    total: subtotal,
  };
}

// GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST /api/cart { productId, qty }
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body || {};
  if (!productId || typeof qty !== 'number' || qty <= 0) {
    return res.status(400).json({ error: 'Invalid payload. Expected { productId, qty > 0 }' });
  }
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const lineId = String(nextLineId++);
  const line = {
    id: lineId,
    productId: product.id,
    name: product.name,
    price: product.price,
    qty,
  };
  cartItems.set(lineId, line);
  const cart = calculateCartTotals();
  res.status(201).json(cart);
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  if (!cartItems.has(id)) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  cartItems.delete(id);
  const cart = calculateCartTotals();
  res.json(cart);
});

// Optional: Update quantity PUT /api/cart/:id { qty }
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { qty } = req.body || {};
  if (typeof qty !== 'number' || qty <= 0) {
    return res.status(400).json({ error: 'Invalid qty' });
  }
  const line = cartItems.get(id);
  if (!line) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  line.qty = qty;
  cartItems.set(id, line);
  const cart = calculateCartTotals();
  res.json(cart);
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  const cart = calculateCartTotals();
  res.json(cart);
});

// POST /api/checkout { cartItems }
app.post('/api/checkout', (req, res) => {
  const { cartItems: providedCartItems, name, email } = req.body || {};
  // Trust server-side cart if not provided
  const cart = providedCartItems && Array.isArray(providedCartItems)
    ? providedCartItems
    : Array.from(cartItems.values());
  const total = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
  const timestamp = new Date().toISOString();
  // Clear cart after checkout
  cartItems.clear();
  res.json({
    receipt: {
      name: name || null,
      email: email || null,
      total,
      timestamp,
      items: cart,
    },
  });
});

app.get('/', (req, res) => {
  res.send('Mock E-Com Cart API running');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


