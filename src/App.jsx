import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";

// -----------------------------
// Single-file React SPA (App.jsx)
// - Reads products from /public/products.json (fetch)
// - Persists orders in localStorage (simulates orders.json)
// - No backend required
// - Tailwind CSS classes used for styling
// -----------------------------

const SAMPLE_PRODUCTS = [
  {
    id: "p1",
    name: "Aurora Headphones",
    price: 2499,
    image: "/headphones.svg",
    description: "Comfortable over-ear wireless headphones with noise cancellation.",
  },
  {
    id: "p2",
    name: "Nimbus Smartwatch",
    price: 3499,
    image: "/smartwatch.svg",
    description: "Health tracking, notifications and long battery life.",
  },
  {
    id: "p3",
    name: "Comet Portable Speaker",
    price: 1299,
    image: "/speaker.svg",
    description: "Rugged, waterproof bluetooth speaker with punchy bass.",
  },
];

// -----------------------------
// Cart context
// -----------------------------
const CartContext = createContext();
function useCart() {
  return useContext(CartContext);
}

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart_v2")) || {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("cart_v2", JSON.stringify(cart));
  }, [cart]);

  const add = (product, qty = 1) => {
    setCart((c) => {
      const next = { ...c };
      if (next[product.id]) {
        next[product.id] = { ...next[product.id], qty: next[product.id].qty + qty };
      } else {
        next[product.id] = { product, qty };
      }
      return next;
    });
  };
  const setQty = (productId, qty) => {
    setCart((c) => {
      const next = { ...c };
      if (!next[productId]) return next;
      next[productId].qty = Math.max(0, qty);
      if (next[productId].qty === 0) delete next[productId];
      return next;
    });
  };
  const clear = () => setCart({});
  const remove = (productId) => {
    setCart((c) => {
      const next = { ...c };
      delete next[productId];
      return next;
    });
  };

  return <CartContext.Provider value={{ cart, add, setQty, clear, remove }}>{children}</CartContext.Provider>;
}

const currency = (n) => `₹${n.toFixed(2)}`;
const calcTotal = (cart) => Object.values(cart).reduce((s, it) => s + it.product.price * it.qty, 0);

// -----------------------------
// Navbar (logo in circle at left, cart on right)
// -----------------------------
function Navbar() {
  const { cart } = useCart();
  console.log(cart);
  const items = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  return (
    <header className="w-full bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-4 justify-between items-center shadow-lg" style={{ backgroundColor: '#f1efdc' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 overflow-hidden flex items-center justify-center shadow-md">
            {/* Place your logo at public/logo.png */}
            <img src="/logo.svg" alt="Dagger Customs" className="w-10 h-10 object-contain" />
          </div>
          <Link to="/" className="text-xl font-semibold text-gray-100">Dagger Customs</Link>
        </div>

        <nav className="flex items-center gap-4">
          {/* <Link to="/admin" className="text-sm text-gray-200 hover:underline">Admin</Link> */}
          <Link to="/admin" className="text-sm text-gray-200 hover:underline">Admin</Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            </svg>
            <span className="text-sm text-gray-800">Cart</span>
            {items > 0 && <span className="ml-1 inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-indigo-600 text-white rounded-full shadow-sm">{items}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

// -----------------------------
// Product row card (image left, details right)
// -----------------------------
function ProductRow({ product }) {
  const { add } = useCart();


  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex gap-4 items-start">
      <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <img src="/headphones.svg" alt={product.name} className="w-24 h-24 object-contain" />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <div className="text-lg font-bold text-indigo-600">{currency(product.price)}</div>
        </div>

        <p className="mt-2 text-gray-600">{product.description}</p>

        <div className="mt-3">
          <button onClick={() => add(product)} className="bg-gradient-to-r from-indigo-600 to-teal-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Pages
// -----------------------------

function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch('/products.json')
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => {
        if (mounted && Array.isArray(data)) setProducts(data);
      })
      .catch(() => {
        // fallback to sample
        if (mounted) setProducts(SAMPLE_PRODUCTS);
      });
    return () => (mounted = false);
  }, []);

  return (
    <main style={{ backgroundColor: '#e3e0bc' }} className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <div className="space-y-4">
          {products.map((p) => (
            <ProductRow key={p.id || p.name} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}

function CartPage() {
  const { cart, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const entries = Object.values(cart);
  const total = calcTotal(cart);

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        {entries.length === 0 ? (
          <div className="p-6 bg-white rounded-xl shadow">Your cart is empty — <Link to="/">shop now</Link></div>
        ) : (
          <div className="space-y-4">
            {entries.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
                <img src="/headphones.svg" alt="" className="w-20 h-20 object-contain rounded-md" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{currency(product.price)}</div>
                      <div className="text-sm text-gray-500">{currency(product.price * qty)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setQty(product.id, qty - 1)} className="px-3 py-1 border rounded">-</button>
                    <div className="px-3 py-1 border rounded">{qty}</div>
                    <button onClick={() => setQty(product.id, qty + 1)} className="px-3 py-1 border rounded">+</button>
                    <button onClick={() => remove(product.id)} className="ml-auto text-sm text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div className="text-lg font-semibold">Total: {currency(total)}</div>
              <div className="flex gap-3">
                <button onClick={() => clear()} className="px-4 py-2 border rounded">Clear</button>
                <button onClick={() => navigate('/checkout')} className="px-4 py-2 bg-indigo-600 text-white rounded">Place Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function CheckoutPage() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', doorNo: '', street: '', area: '', district: '', pincode: '', landmark: '', mobile: '' });

  useEffect(() => {
    if (Object.keys(cart).length === 0) navigate('/');
  }, [cart, navigate]);

  const onChange = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const isValid = form.name && form.doorNo && form.street && form.area && form.district && form.pincode && form.mobile && form.mobile.length === 10 && /^[0-9]+$/.test(form.mobile) && form.pincode.length === 6 && /^[0-9]+$/.test(form.pincode);

  const handleProceed = () => {
    if (isValid) {
      navigate('/payment', { state: { address: form } });
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Name *" value={form.name} onChange={onChange('name')} className="p-3 border rounded" required />
          <input placeholder="+91 Mobile No *" value={form.mobile} onChange={onChange('mobile')} className="p-3 border rounded" maxLength="10" pattern="[0-9]{10}" required />
          <input placeholder="Door No *" value={form.doorNo} onChange={onChange('doorNo')} className="p-3 border rounded" required />
          <input placeholder="Street *" value={form.street} onChange={onChange('street')} className="p-3 border rounded" required />
          <input placeholder="Area *" value={form.area} onChange={onChange('area')} className="p-3 border rounded" required />
          <input placeholder="District *" value={form.district} onChange={onChange('district')} className="p-3 border rounded" required />
          <input placeholder="Pincode *" value={form.pincode} onChange={onChange('pincode')} className="p-3 border rounded" maxLength="6" pattern="[0-9]{6}" required />
          <input placeholder="Landmark" value={form.landmark} onChange={onChange('landmark')} className="p-3 border rounded" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Back</button>
          <button 
            onClick={handleProceed} 
            disabled={!isValid}
            className={`px-4 py-2 rounded ${
              isValid 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </main>
  );
}

function FakeQR({ type = 'PhonePe / GPay' }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-lg shadow-md" style={{ width: 260 }}>
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=merchant@paytm&pn=Dagger%20Customs&am=1&cu=INR" 
          alt="QR Code" 
          className="w-full h-full object-contain" 
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />
      </div>
      <div className="text-sm text-gray-600">Scan with {type}</div>
    </div>
  );
}

function PaymentPage() {
  const { cart, clear } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const total = calcTotal(cart);
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const doPay = async () => {
    setPaid(true);
    const orderId = `ord_${Date.now()}`;
    const paymentId = `pay_${Date.now()}`;
    
    const order = {
      id: orderId,
      items: Object.values(cart).map(it => ({ 
        id: it.product.id, 
        name: it.product.name, 
        desc: it.product.description, 
        price: it.product.price,
        qty: it.qty 
      })),
      total,
      address: (location.state && location.state.address) || {},
      paymentMethod,
      paymentId,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage
    const orders = JSON.parse(localStorage.getItem('orders_v2') || '[]');
    orders.push(order);
    localStorage.setItem('orders_v2', JSON.stringify(orders));

    // Save order to JSON file
    await saveOrderToFile(order);

    setTimeout(() => {
      clear();
      navigate('/success');
    }, 1800);
  };

  const saveOrderToFile = async (orderData) => {
    const blob = new Blob([JSON.stringify(orderData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${orderData.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50 flex items-start">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow w-full">
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2">Order total</div>
            <div className="text-3xl font-bold mb-6">{currency(total)}</div>
            <div className="mb-4">Payment Method</div>
            <div className="flex gap-3 mb-4">
              <button 
                onClick={() => setPaymentMethod('UPI')} 
                className={`px-4 py-2 border rounded ${paymentMethod === 'UPI' ? 'bg-indigo-600 text-white' : ''}`}
              >
                UPI
              </button>
              <button 
                onClick={() => setPaymentMethod('Card')} 
                className={`px-4 py-2 border rounded ${paymentMethod === 'Card' ? 'bg-indigo-600 text-white' : ''}`}
              >
                Card
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            {!paid ? (
              <div>
                <FakeQR />
                <div className="mt-4 text-sm text-gray-500">After completing payment, click below</div>
                <div className="mt-4">
                  <button onClick={doPay} className="px-4 py-2 bg-green-600 text-white rounded">I have paid</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-600" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-lg font-semibold text-green-700">Payment Successful</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SuccessPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate('/'), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <main className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-600" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">Order Placed</h3>
        <p className="mt-2 text-gray-600">Thanks! Redirecting to products...</p>
      </div>
    </main>
  );
}

function AdminPage() {
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders_v2') || '[]'));
  const [payments, setPayments] = useState(() => JSON.parse(localStorage.getItem('payments_v2') || '[]'));
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const onStorage = () => {
      setOrders(JSON.parse(localStorage.getItem('orders_v2') || '[]'));
      setPayments(JSON.parse(localStorage.getItem('payments_v2') || '[]'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const exportPayments = () => {
    const blob = new Blob([JSON.stringify(payments, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_payments_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button onClick={exportPayments} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Export Payments JSON
          </button>
        </div>
        
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('orders')} 
            className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
          >
            Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('payments')} 
            className={`px-4 py-2 rounded ${activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'bg-white border'}`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="p-6 bg-white rounded-xl shadow">No orders yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Order {o.id}</div>
                        <div className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</div>
                        {o.paymentId && <div className="text-xs text-blue-600">Payment ID: {o.paymentId}</div>}
                      </div>
                      <div className="font-bold">{currency(o.total)}</div>
                    </div>

                    <div className="mt-3">
                      <div className="font-medium">Customer Address</div>
                      <div className="text-sm text-gray-600">{o.address?.name} — {o.address?.doorNo} {o.address?.street} {o.address?.area} {o.address?.district} - {o.address?.pincode} | {o.address?.mobile}</div>
                    </div>

                    <div className="mt-3">
                      <div className="font-medium">Items</div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                        {o.items.map((it, idx) => (
                          <li key={idx}>{it.name} — {it.desc} (qty: {it.qty})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            {payments.length === 0 ? (
              <div className="p-6 bg-white rounded-xl shadow">No payments yet.</div>
            ) : (
              <div className="space-y-4">
                {payments.map(p => (
                  <div key={p.paymentId} className="bg-white p-4 rounded-xl shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">Payment {p.paymentId}</div>
                        <div className="text-sm text-gray-500">{new Date(p.timestamp).toLocaleString()}</div>
                        <div className="text-sm text-blue-600">Order: {p.orderId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{currency(p.amount)}</div>
                        <div className={`text-sm px-2 py-1 rounded ${p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {p.status}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Payment Method</div>
                        <div className="text-sm text-gray-600">{p.method}</div>
                      </div>
                      <div>
                        <div className="font-medium">Customer</div>
                        <div className="text-sm text-gray-600">{p.customerInfo?.name} | {p.customerInfo?.mobile}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen font-sans text-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

/*
  --------------------------
  How to use this single-file app
  --------------------------
  1) Place this file as src/App.jsx in a React project (Vite or CRA).
  2) Ensure react-router-dom is installed.
  3) Tailwind CSS classes are used in the markup. If you don't use Tailwind, you'll still get a functional app but styles will differ.

  4) Create a public/products.json file with your product data. Example:

  [
    {
      "id": "p1",
      "name": "Aurora Headphones",
      "price": 2499,
      "image": "https://...",
      "description": "Comfortable over-ear..."
    }
  ]

  5) You can add a logo at public/logo.png and an optional QR image at public/qr-placeholder.png.

  6) Orders are saved to localStorage under key "orders_v2" (this simulates orders.json). The Admin page reads from that key.

  7) Run with Vite: npm create vite@latest my-shop --template react
    then replace src/App.jsx with this file, npm install, npm run dev.

  ---- Notes ----
  - No backend used. Browser cannot write files to disk; localStorage is used to persist orders.
  - If fetch('/products.json') fails, the app falls back to SAMPLE_PRODUCTS declared in this file.
*/
