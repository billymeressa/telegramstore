import { useState, useEffect, useCallback } from 'react';
import API_URL from './config';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast'; // New Import

const tele = window.Telegram?.WebApp;
const ADMIN_ID = 748823605; // Make sure this matches your .env ADMIN_ID

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null); // Toast State

  useEffect(() => {
    let currentUser = tele?.initDataUnsafe?.user;

    if (tele) {
      tele.ready();
      tele.expand();
      try {
        tele.headerColor = '#054D3B'; // Deep Emerald
        tele.backgroundColor = '#FAFAFA'; // Light Gray/White
      } catch (e) {
        console.error(e);
      }
    }

    // Mock User for Dev Environment (if no Telegram user found AND not in Telegram context)
    // We check !tele.initData to ensure we are actually not in Telegram (browser dev)
    if (!currentUser && import.meta.env.DEV && !tele?.initData) {
      console.log("Dev Mode: Mocking Telegram User (Browser Only)");
      currentUser = {
        id: ADMIN_ID,
        first_name: "Test",
        last_name: "Admin",
        username: "testadmin",
        language_code: "en"
      };
    }

    setUser(currentUser);

    if (currentUser) {
      const userId = currentUser.id;
      console.log('--- DEBUG INFO ---');
      const adminIds = [
        ADMIN_ID,
        ...(import.meta.env.VITE_ADMIN_IDS || '').split(',')
      ]
        .map(id => (id || '').toString().trim())
        .filter(id => id && !isNaN(parseInt(id)))
        .map(id => parseInt(id));

      console.log('Required Admin IDs:', adminIds);
      const isUserAdmin = adminIds.includes(userId);

      console.log('Is Admin Match:', isUserAdmin);

      if (isUserAdmin) {
        console.log("Granting Admin Privileges");
        setIsAdmin(true);
      }
    }

    fetchProductData();
  }, []);

  const fetchProductData = () => {
    if (!API_URL) {
      const msg = 'CONFIGURATION ERROR: VITE_API_URL is missing. The app cannot connect to the server.';
      tele ? tele.showAlert(msg) : alert(msg);
      return;
    }

    fetch(`${API_URL}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setProducts(data))
      .catch(err => {
        console.error("Failed to fetch products", err);
        const msg = `Connection Failed: Could not load products. (${err.message}). Is the backend running?`;
        tele ? tele.showAlert(msg) : alert(msg);
      });
  };



  const onAdd = (product) => {
    const exist = cart.find((x) => x.id === product.id);
    if (exist) {
      setCart(
        cart.map((x) =>
          x.id === product.id
            ? { ...exist, quantity: exist.quantity + 1 }
            : x
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    if (tele?.HapticFeedback) {
      tele.HapticFeedback.impactOccurred('light');
    }

    setToast(`Added ${product.title} to cart`); // Trigger Toast
  };

  const onIncrease = (product) => {
    const exist = cart.find((x) => x.id === product.id);
    if (exist) {
      setCart(
        cart.map((x) =>
          x.id === product.id
            ? { ...exist, quantity: exist.quantity + 1 }
            : x
        )
      );
    }
    if (tele?.HapticFeedback) {
      tele.HapticFeedback.selectionChanged();
    }
  };

  const onDecrease = (product) => {
    const exist = cart.find((x) => x.id === product.id);
    if (exist.quantity === 1) {
      setCart(cart.filter((x) => !(x.id === product.id)));
    } else {
      setCart(
        cart.map((x) =>
          x.id === product.id
            ? { ...exist, quantity: exist.quantity - 1 }
            : x
        )
      );
    }
    if (tele?.HapticFeedback) {
      tele.HapticFeedback.selectionChanged();
    }
  };

  const onRemove = (product) => {
    setCart(cart.filter((x) => x.id !== product.id));
    if (tele?.HapticFeedback) {
      tele.HapticFeedback.impactOccurred('medium');
    }
  };

  const onCheckout = useCallback(async () => {
    if (!user && !tele) return;

    // Send order to backend
    const orderData = {
      items: cart,
      total_price: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      userId: user?.id,
      userInfo: user
    };

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();

      if (data.success) {
        // tele.showAlert('Order placed successfully!');
        // Send legacy data back to bot just in case (optional)
        // tele.sendData(JSON.stringify(orderData)); 

        setCart([]); // Clear cart
      } else {
        tele.showAlert('Failed to place order.');
      }
    } catch (e) {
      console.error(e);
      tele.showAlert('Error processing order.');
    }
  }, [cart]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout cartCount={cart.reduce((a, c) => a + c.quantity, 0)} isAdmin={isAdmin} user={user} />}>
          <Route path="/" element={<Home products={products} onAdd={onAdd} />} />
          <Route path="/cart" element={
            <CartPage
              cart={cart}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
              onCheckout={onCheckout}
            />
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetails onAdd={onAdd} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard products={products} onProductUpdate={setProducts} /> : <Navigate to="/" />} />
        </Route>
      </Routes>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </BrowserRouter>
  );
}

export default App;
