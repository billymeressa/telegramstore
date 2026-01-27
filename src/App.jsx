import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import API_URL from './config';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Toast from './components/Toast';
import ContactModal from './components/ContactModal'; // New Import
import { trackEvent, startSession, endSession } from './utils/track';

// Lazy Load Pages for Code Splitting
const CartPage = lazy(() => import('./pages/CartPage'));
const Profile = lazy(() => import('./pages/Profile'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));

const ADMIN_ID = 748823605;

function App() {
  const tele = window.Telegram?.WebApp;
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(products.length === 0);

  // Checkout / Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [sellerUsername, setSellerUsername] = useState('AddisStoreSupport');
  const [orderMessage, setOrderMessage] = useState('');

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
          if (data.isAdmin) setIsAdmin(true);
          if (data.isSuperAdmin) setIsSuperAdmin(true);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } catch (e) {
        console.error("Admin check failed", e);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    };

    const validateUser = (webAppUser) => {
      if (!webAppUser) return false;
      setUser(webAppUser);
      checkAdminStatus();
      return true;
    };

    if (tele) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#f4f4f5');
      document.documentElement.style.setProperty('--tg-theme-text-color', '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', '#999999');
      document.documentElement.style.setProperty('--tg-theme-link-color', '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-color', '#3390ec');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-section-separator-color', '#e3e3e4');
      document.body.style.backgroundColor = '#ffffff';
    }

    let currentUser = tele?.initDataUnsafe?.user;
    let intervalId;

    if (validateUser(currentUser)) {
    } else {
      let attempts = 0;
      intervalId = setInterval(() => {
        attempts++;
        const t = window.Telegram?.WebApp;
        const u = t?.initDataUnsafe?.user;
        if (validateUser(u) || attempts > 20) {
          clearInterval(intervalId);
        }
      }, 100);

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }

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
      setIsSuperAdmin(true);
    }

    fetchProductData(1);

    const startParam = tele?.initDataUnsafe?.start_param;
    const metadata = startParam ? { source: startParam } : {};

    trackEvent('app_open', metadata);
    startSession(metadata);

    // Fetch Seller Info for Contact Modal
    fetch(`${API_URL}/api/seller-info`)
      .then(res => res.json())
      .then(data => {
        if (data.username) setSellerUsername(data.username);
      })
      .catch(console.error);

    return () => {
      endSession();
    };
  }, []);

  const fetchProductData = (pageNum = 1) => {
    if (!API_URL) return;

    setIsFetching(true);
    if (pageNum === 1 && products.length === 0) setLoading(true);

    fetch(`${API_URL}/api/products?page=${pageNum}&limit=20`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        let newProducts = [];
        let more = false;

        if (Array.isArray(data)) {
          newProducts = data;
        } else {
          newProducts = data.products || [];
          more = data.hasMore;
        }

        // Infinite Scroll: Loop back if we run out of data
        if ((newProducts.length === 0 || !more) && pageNum > 1 && products.length > 0) {
          newProducts = products.slice(0, 20); // Re-append first 20 items
          more = true; // Keep loading forever
        }

        if (pageNum === 1) {
          setProducts(newProducts);
          localStorage.setItem('cached_products', JSON.stringify(newProducts));
        } else {
          setProducts(prev => {
            const updated = [...prev, ...newProducts];
            return updated;
          });
        }

        setHasMore(more);
        setPage(pageNum);
      })
      .catch(err => {
        console.error("Failed to fetch products", err);
        if (products.length === 0) {
          const msg = `Connection Failed: Could not load products. (${err.message}). Is the backend running?`;
          tele ? tele.showAlert(msg) : alert(msg);
        }
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

    setToast(`Added ${product.title} to cart`);
    trackEvent('add_to_cart', { productId: product.id, productTitle: product.title, price: product.price });
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

  const onCheckout = useCallback(async (itemsToCheckout = cart) => {
    if (!user && !tele) return;

    const orderData = {
      items: itemsToCheckout,
      total_price: itemsToCheckout.reduce((sum, item) => sum + item.price * item.quantity, 0),
      userId: user?.id,
      userInfo: user
    };

    // Generate Telegram Message for the Modal
    const totalPrice = orderData.total_price;
    let msg = `Hi! I just placed an order.\n\n`;
    itemsToCheckout.forEach(item => {
      const itemPrice = item.selectedVariation ? item.selectedVariation.price : item.price;
      const variationText = item.selectedVariation ? ` - ${item.selectedVariation.name}` : '';
      msg += `- ${item.title}${variationText} (x${item.quantity}) - ${Math.floor(itemPrice * item.quantity)} Birr\n`;
    });
    msg += `\nTotal: ${Math.floor(totalPrice)} Birr`;
    setOrderMessage(encodeURIComponent(msg));

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();

      if (data.success) {
        // Show Contact Modal instead of just alert
        setShowContactModal(true);

        // Only clear cart if we checked out the MAIN cart
        if (itemsToCheckout === cart) {
          setCart([]);
        }
      } else {
        tele.showAlert('Failed to place order.');
      }
    } catch (e) {
      console.error(e);
      tele.showAlert('Error processing order.');
    }
  }, [cart, user, tele]);

  const onBuyNow = useCallback((product) => {
    onCheckout([{ ...product, quantity: 1 }]);
  }, [onCheckout]);

  return (
    <BrowserRouter>
      {loading && <LoadingScreen />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout cartCount={cart.reduce((a, c) => a + c.quantity, 0)} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} user={user} />}>
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
            <Route path="/product/:id" element={<ProductDetails onAdd={onAdd} onBuyNow={onBuyNow} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} isAdmin={isAdmin} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard products={products} onProductUpdate={setProducts} /> : <Navigate to="/" />} />
            <Route path="/analytics" element={isSuperAdmin ? <AnalyticsDashboard /> : <Navigate to="/" />} />
          </Route>
        </Routes>
      </Suspense>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        sellerUsername={sellerUsername}
        orderMessage={orderMessage}
      />
    </BrowserRouter>
  );
}

export default App;
