# Mock E-Com Cart (Vibe Commerce)

Basic full-stack shopping cart demonstrating React + Express with REST APIs.

## Requirements Implemented
- Backend APIs: GET /api/products, POST /api/cart, DELETE /api/cart/:id, PUT /api/cart/:id, GET /api/cart, POST /api/checkout
- Frontend: Products grid, Add to Cart, Cart view with qty update and remove, Checkout form (name/email), receipt modal, responsive design

## Getting Started

### 1) Backend
```bash
cd server
npm install
npm run dev # or: npm start
# Server runs on http://localhost:4000
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173 (proxy to backend /api)
```

## Project Structure
```
server/
  package.json
  src/
    index.js        # Express app & routes
    products.js     # Mock products
client/
  package.json
  vite.config.js    # Dev proxy to backend
  index.html
  src/
    main.jsx
    App.jsx         # UI: Products, Cart, Checkout, Receipt modal
```

## Notes
- Cart is in-memory on the server (resets on restart). For persistence, add a JSON file or DB (Mongo/SQLite).
- No real payments. Checkout returns a mock receipt and clears the cart.
- Vite dev server proxies `/api` to the Express server.

## Bonus Ideas
- Persist cart by userId (cookie) to a JSON file or Mongo/SQLite.
- Integrate with Fake Store API to populate products.
- Robust error toasts and loading states.

