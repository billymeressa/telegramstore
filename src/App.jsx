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
const Rewards = lazy(() => import('./pages/Rewards'));

// Categories to demote (push to bottom)
const GENERIC_CATEGORIES = ['Parts & Accessories', 'Tools', 'Tools & Equipment', 'Other', 'Computer Accessories', 'Cables', 'Adapters'];

// Smart Sort Algorithm
// Smart Sort Algorithm (Personalized)
const smartSort = (items) => {
  if (!items || items.length === 0) return [];

  // 1. Get User Preferences
  let interests = {};
  try {
    interests = JSON.parse(localStorage.getItem('user_interests') || '{}');
  } catch (e) {
    console.error(e);
  }

  // Get Top 3 Categories
  const topCategories = Object.entries(interests)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // 2. Bucket Items
  const personalized = [];
  const premium = [];
  const generic = [];

  items.forEach(p => {
    const cat = p.category || 'Other';
    if (GENERIC_CATEGORIES.includes(cat)) {
      generic.push(p);
    } else if (topCategories.includes(cat)) {
      personalized.push(p);
    } else {
      premium.push(p);
    }
  });

  // 3. Shuffle Helpers
  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // 4. Final Mix: Personalized First -> Other Premium -> Generic (Bottom)
  return [...shuffle(personalized), ...shuffle(premium), ...generic];
};

const ADMIN_ID = 748823605;

// IMPORTS for Store
import useStore from './store/useStore';

function App() {
  const tele = window.Telegram?.WebApp;

  // Local State for Products (still fetched here for now)
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Global State (Selectors)
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const fetchUserData = useStore(state => state.fetchUserData);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(products.length === 0);

  // Checkout / Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [sellerUsername, setSellerUsername] = useState('AddisStoreSupport');
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    const tele = window.Telegram?.WebApp;
    const initWebApp = () => {
      if (tele) {
        tele.ready();
        tele.expand();

        // Try to enter fullscreen mode (introduced in Bot API 8.0)
        if (tele.requestFullscreen) {
          try {
            tele.requestFullscreen();
          } catch (e) {
            console.error("requestFullscreen failed:", e);
          }
        }

        try {
          // Force Light Mode Colors
          tele.headerColor = '#ffffff';
          tele.backgroundColor = '#f4f4f5';

          // Sync Safe Areas
          const syncSafeAreas = () => {
            const safeTop = tele.safeAreaInset?.top || 0;
            const contentTop = tele.contentSafeAreaInset?.top || 0;
            const safeBottom = tele.safeAreaInset?.bottom || 0;
            const contentBottom = tele.contentSafeAreaInset?.bottom || 0;

            document.documentElement.style.setProperty('--tg-safe-area-top', `${safeTop}px`);
            document.documentElement.style.setProperty('--tg-content-safe-area-top', `${contentTop}px`);
            document.documentElement.style.setProperty('--tg-safe-area-bottom', `${safeBottom}px`);
            document.documentElement.style.setProperty('--tg-content-safe-area-bottom', `${contentBottom}px`);

            // Header height (area where native buttons sit)
            const headerHeight = contentTop - safeTop;
            document.documentElement.style.setProperty('--tg-header-buttons-height', `${headerHeight > 0 ? headerHeight : 44}px`);
          };

          syncSafeAreas();
          if (tele.onEvent) {
            tele.onEvent('safeAreaChanged', syncSafeAreas);
            tele.onEvent('contentSafeAreaChanged', syncSafeAreas);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    if (tele) {
      initWebApp();
      // Second pass after a short delay for reliability
      setTimeout(initWebApp, 500);
      setTimeout(initWebApp, 2000);
    }

    // Sync User Data from Backend (Zustand Global State)
    fetchUserData();

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
          // Keep user engaged, loop content
          newProducts = products.slice(0, 20);
          more = true;
        }

        if (pageNum === 1) {
          const sorted = smartSort(newProducts);
          setProducts(sorted);
          localStorage.setItem('cached_products', JSON.stringify(sorted));
        } else {
          const sorted = smartSort(newProducts);
          setProducts(prev => [...prev, ...sorted]);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tele?.initData || ''
        },
        body: JSON.stringify(orderData)
      });
      const data = await res.json();

      if (data.success) {
        // Send data to Bot and Close WebApp
        if (tele && tele.sendData) {
          tele.sendData(JSON.stringify(data.order)); // Send the created order object
        }

        // Only clear cart if we checked out the MAIN cart
        if (itemsToCheckout === cart) {
          clearCart();
        }
      } else {
        tele.showAlert('Failed to place order.');
      }
    } catch (e) {
      console.error(e);
      tele.showAlert('Error processing order.');
    }
  }, [cart, user, tele, clearCart]);

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
                hasMore={hasMore}
                loadMore={loadMore}
                isFetching={isFetching}
              />
            } />
            <Route path="/cart" element={
              <CartPage
                onCheckout={onCheckout}
                sellerUsername={sellerUsername}
              />
            } />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wishlist" element={<WishlistPage products={products} />} />
            <Route path="/product/:id" element={<ProductDetails onBuyNow={onBuyNow} products={products} isAdmin={isAdmin} sellerUsername={sellerUsername} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard products={products} onProductUpdate={setProducts} /> : <Navigate to="/" />} />
            <Route path="/analytics" element={isSuperAdmin ? <AnalyticsDashboard /> : <Navigate to="/" />} />
            <Route path="/rewards" element={<Rewards />} />
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
