import React, { createContext, useContext, useReducer, useState } from 'react';
import './App.css';

// Enhanced Product Catalog matching your exact downloaded filenames
const PRODUCTS = [
  { id: 1, name: 'iPhone 15 Pro Max (256GB)', price: 159900, image: '/images/15 pro max.jpg', category: 'Phones', badge: 'Flagship', rating: '4.9 ⭐' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 129999, image: '/images/Samsung Galaxy S24 Ultra.jpg', category: 'Phones', badge: 'Flagship', rating: '4.8 ⭐' },
  { id: 3, name: 'Google Pixel 8 Pro', price: 106999, image: '/images/Google Pixel 8 Pro.jpg', category: 'Phones', badge: 'Top Pick', rating: '4.7 ⭐' },
  
  { id: 4, name: 'NVIDIA RTX 4090 24GB OC', price: 195000, image: '/images/NVIDIA RTX 4090 24GB OC.jpg', category: 'GPUs', badge: 'Monster GPU', rating: '5.0 ⭐' },
  { id: 5, name: 'NVIDIA RTX 4080 Super 16GB', price: 105000, image: '/images/NVIDIA RTX 4080 Super 16GB.jpg', category: 'GPUs', badge: 'Popular GPU', rating: '4.8 ⭐' },
  { id: 6, name: 'AMD Radeon RX 7900 XTX 24GB', price: 98000, image: '/images/AMD Radeon RX 7900 XTX 24GB.jpg', category: 'GPUs', badge: 'Best Value', rating: '4.7 ⭐' },
  { id: 7, name: 'NVIDIA RTX 4070 Ti Super', price: 82000, image: '/images/NVIDIA RTX 4070 Ti Super.jpg', category: 'GPUs', badge: 'New', rating: '4.6 ⭐' },
  
  // Kept emojis for accessories since they weren't in the downloads folder
  { id: 8, name: 'Sony WH-1000XM5 Headphones', price: 29990, emoji: '🎧', category: 'Audio', badge: 'Best Seller', rating: '4.9 ⭐' },
  { id: 9, name: 'RGB Mechanical Keyboard', price: 3499, emoji: '⌨️', category: 'Accessories', badge: 'Gaming', rating: '4.5 ⭐' },
  { id: 10, name: 'Ergonomic Wireless Mouse', price: 1499, emoji: '🖱️', category: 'Accessories', badge: 'Sale', rating: '4.4 ⭐' },
];

const COUPONS = {
  'REACT10': 10,
  'SAVE20': 20
};

const initialState = { cart: [], discountPercent: 0, appliedCoupon: '' };

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const { id, delta } = action.payload;
      return {
        ...state,
        cart: state.cart.map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
      };
    }
    case 'APPLY_COUPON':
      return { ...state, discountPercent: action.payload.discount, appliedCoupon: action.payload.code };
    default:
      return state;
  }
}

const CartContext = createContext();

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

function MainShop() {
  const { state, dispatch } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false });

  const categories = ['All', 'Phones', 'GPUs', 'Audio', 'Accessories'];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCartCount = state.cart.reduce((a, c) => a + c.quantity, 0);
  const subtotal = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (subtotal * state.discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * 0.18;
  const grandTotal = taxableAmount + gstAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      dispatch({ type: 'APPLY_COUPON', payload: { code, discount: COUPONS[code] } });
      setCouponMessage({ text: `Success! ${COUPONS[code]}% discount applied.`, isError: false });
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try REACT10 or SAVE20', isError: true });
    }
  };

  return (
    <div className="shop-wrapper">
      <header className="navbar">
        <div className="nav-brand">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">TechStore <span className="logo-highlight">Pro</span></span>
        </div>
        <div className="nav-search">
          <input 
            type="text" 
            placeholder="Search phones, GPUs, accessories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="nav-actions">
          <div className="cart-badge-container">
            <span className="cart-icon">🛒</span>
            {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
          </div>
        </div>
      </header>

      <div className="category-bar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="shop-container">
        <div className="products-section">
          <h2>Products Catalog ({filteredProducts.length})</h2>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card fade-in">
                <span className="card-badge">{product.badge}</span>
                
                {/* Dynamic Image or Emoji rendering */}
                {product.image ? (
                  <div className="product-image-container">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-image bounce-on-hover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image' }} 
                    />
                  </div>
                ) : (
                  <div className="product-emoji bounce-on-hover">{product.emoji}</div>
                )}

                <div className="rating">{product.rating}</div>
                <h3>{product.name}</h3>
                <span className="category">{product.category}</span>
                <div className="price">₹{product.price.toLocaleString('en-IN')}</div>
                <button 
                  className="add-btn ripple"
                  onClick={() => dispatch({ type: 'ADD_TO_CART', payload: product })}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Cart ({totalCartCount})</h2>
          {state.cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">📦</div>
              <p>Your cart is empty.</p>
              <small>Explore phones & GPUs to add items!</small>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {state.cart.map(item => (
                  <div key={item.id} className="cart-item slide-in">
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <div className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, delta: -1 } })}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, delta: 1 } })}>+</button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input 
                  type="text" 
                  placeholder="Promo Code (REACT10)" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit">Apply</button>
              </form>
              {couponMessage.text && (
                <div className={`coupon-msg ${couponMessage.isError ? 'error' : 'success'}`}>
                  {couponMessage.text}
                </div>
              )}

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {state.discountPercent > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({state.discountPercent}%)</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>+₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <hr />
                <div className="summary-row grand-total">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <button className="checkout-btn">Proceed to Checkout 🚀</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() { return <CartProvider><MainShop /></CartProvider>; }
