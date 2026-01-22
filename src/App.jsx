import { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import API_URL from './config';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import Profile from './pages/Profile';
import WishlistPage from './pages/WishlistPage';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './components/AdminDashboard';
import Toast from './components/Toast'; // New Import

// Removed top-level tele
const ADMIN_ID = 748823605; // Make sure this matches your .env ADMIN_ID

function App() {
  const tele = window.Telegram?.WebApp; // Moved inside component
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null); // Toast State
  const [loading, setLoading] = useState(true); // Loading State

  useEffect(() => {
    const tele = window.Telegram?.WebApp;
    if (tele) {
      tele.ready();
      tele.expand();
      try {
        tele.headerColor = tele.themeParams.bg_color || '#ffffff';
        tele.backgroundColor = tele.themeParams.secondary_bg_color || '#f4f4f5';
      } catch (e) {
        console.error(e);
      }
    }

    const checkAdminStatus = async () => {
      const tele = window.Telegram?.WebApp;
      if (!tele?.initData) return;

      try {
        const res = await fetch(`${API_URL}/api/check-admin`, {
          headers: {
            'Authorization': tele.initData
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isAdmin) {
            setIsAdmin(true);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("Admin check failed", e);
        setIsAdmin(false);
      }
    };

    const validateUser = (webAppUser) => {
      if (!webAppUser) return false;

      setUser(webAppUser);

      // Check with backend if this user is an admin
      checkAdminStatus();

      return true;
    };

    // 1. Try getting user immediately
    let currentUser = tele?.initDataUnsafe?.user;
    let intervalId; // Declare intervalId here

    if (validateUser(currentUser)) {
      // Found immediately
    } else {
      // 2. Retry polling for up to 2 seconds (fix for race conditions)
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        const t = window.Telegram?.WebApp;
        const u = t?.initDataUnsafe?.user;
        if (validateUser(u) || attempts > 20) {
          clearInterval(intervalId);
        }
      }, 100);

      // Cleanup interval on unmount
      // This return statement will be the cleanup for the useEffect
      // and will clear the interval if it was set.
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }

    // Mock User for Dev Environment (Browser Only)
    // This runs if tele is undefined (i.e., not in Telegram context)
    if (!tele && import.meta.env.DEV) {
      console.log("Dev Mode: Mocking Telegram User (Browser Only)");
      setUser({
        id: ADMIN_ID,
        first_name: "Test",
        last_name: "Admin",
        username: "testadmin",
        language_code: "en",
        photo_url: "https://via.placeholder.com/150"
      });
      setIsAdmin(true);
    }

    fetchProductData(1);
  }, []);

  const fetchProductData = (pageNum = 1) => {
    if (!API_URL) return;

    setIsFetching(true);

    // If page 1, we might want to show global loading, or just fetching state
    if (pageNum === 1) setLoading(true);

    fetch(`${API_URL}/api/products?page=${pageNum}&limit=20`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Backend now returns { products: [], ... }
        // Determine if it's the old format (array) or new format (object)
        let newProducts = [];
        let more = false;

        if (Array.isArray(data)) {
          // Fallback for old API
          newProducts = data;
        } else {
          newProducts = data.products || [];
          more = data.hasMore;
        }

        if (pageNum === 1) {
          setProducts(newProducts);
        } else {
          setProducts(prev => [...prev, ...newProducts]);
        }

        setHasMore(more);
        setPage(pageNum);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        const msg = `Connection Failed: Could not load products. (${err.message}). Is the backend running?`;
        tele ? tele.showAlert(msg) : alert(msg);
      })
      .finally(() => {
        setLoading(false);
        setIsFetching(false);
      });
  };

  const loadMore = () => {
    if (!isFetching && hasMore) {
      fetchProductData(page + 1);
    }
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

  const toggleWishlist = useCallback((productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const newWishlist = exists
        ? prev.filter(id => id !== productId)
        : [...prev, productId];

      localStorage.setItem('wishlist', JSON.stringify(newWishlist));

      setToast(exists ? "Removed from wishlist" : "Added to wishlist");

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }

      return newWishlist;
    });
  }, []);

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
      {loading && <LoadingScreen />}
      <Routes>
        <Route element={<Layout cartCount={cart.reduce((a, c) => a + c.quantity, 0)} isAdmin={isAdmin} user={user} />}>
          <Route path="/" element={
            <Home
              products={products}
              onAdd={onAdd}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              hasMore={hasMore}
              loadMore={loadMore}
              isFetching={isFetching}
            />
          } />
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
          <Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetails onAdd={onAdd} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard products={products} onProductUpdate={setProducts} /> : <Navigate to="/" />} />
        </Route>
      </Routes>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </BrowserRouter>
  );
}

export default App;
