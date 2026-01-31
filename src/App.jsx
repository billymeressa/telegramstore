import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import LoadingScreen from './components/LoadingScreen';
import API_URL from './config';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Toast from './components/Toast';
import ContactModal from './components/ContactModal'; // New Import
import { trackEvent, startSession, endSession } from './utils/track';
import { initGA, logPageView, logPurchase } from './utils/analytics'; // New Analytics Import
import ScrollToTop from './components/ScrollToTop';

// Lazy Load Pages for Code Splitting
const CartPage = lazy(() => import('./pages/CartPage'));
const Profile = lazy(() => import('./pages/Profile'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const Rewards = lazy(() => import('./pages/Rewards'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'));

// Smart Sort Algorithm (Personalized)
import { smartSort } from './utils/smartSort';

const ADMIN_ID = 748823605;

// Celebration Modal
import OrderSuccessModal from './components/OrderSuccessModal';

import { Trophy } from 'lucide-react';
import SocialProofToast from './components/SocialProofToast';
import MysteryGift from './components/MysteryGift';
import SlotMachine from './components/SlotMachine';
import InviteFriendModal from './components/InviteFriendModal';
import useStore from './store/useStore';

function App() {
  const tele = window.Telegram?.WebApp;
  const [showSlots, setShowSlots] = useState(false);

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
  const fetchSettings = useStore(state => state.fetchSettings);

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

  // Celebration State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderSavings, setLastOrderSavings] = useState(0);

  // Initialize GA and Track Page Views
  useEffect(() => {
    initGA();
  }, []);

  const location = window.location;
  useEffect(() => {
    logPageView();
  }, [location]);

  useEffect(() => {
    const tele = window.Telegram?.WebApp;
    const initWebApp = () => {
      if (tele) {
        tele.ready();
        tele.expand();

        // Try to enter fullscreen mode (introduced in Bot API 8.0)
        // if (tele.requestFullscreen) {
        //   try {
        //     tele.requestFullscreen();
        //   } catch (e) {
        //     console.error("requestFullscreen failed:", e);
        //   }
        // }

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
    // Sync User Data from Backend (Zustand Global State)
    fetchUserData();
    fetchSettings();

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
        // Send data to Bot (Optional now, we handle UI first)
        // if (tele && tele.sendData) {
        //   tele.sendData(JSON.stringify(data.order)); 
        // }

        // Track Purchase in GA4
        logPurchase(data.order.id, totalPrice, itemsToCheckout);

        // Trigger Celebration
        setLastOrderSavings(0); // You can calculate actual savings here if tracked
        setShowSuccessModal(true);

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
      <ScrollToTop />
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
                products={products}
                hasMore={hasMore}
                loadMore={loadMore}
                isFetching={isFetching}
              />
            } />
            <Route path="/profile" element={
              <Profile
                products={products}
                hasMore={hasMore}
                loadMore={loadMore}
                isFetching={isFetching}
              />
            } />
            <Route path="/wishlist" element={<WishlistPage products={products} />} />
            <Route path="/product/:id" element={<ProductDetails onBuyNow={onBuyNow} products={products} isAdmin={isAdmin} sellerUsername={sellerUsername} hasMore={hasMore} loadMore={loadMore} isFetching={isFetching} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard products={products} onProductUpdate={setProducts} /> : <Navigate to="/" />} />
            <Route path="/analytics" element={isSuperAdmin ? <AnalyticsDashboard /> : <Navigate to="/" />} />
            <Route path="/rewards" element={<Rewards />} />

            {/* Functional Polish Routes */}
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/addresses" element={<PlaceholderPage />} />
            <Route path="/support" element={<PlaceholderPage />} />
            <Route path="/settings" element={<PlaceholderPage />} />
            <Route path="/coupons" element={<PlaceholderPage />} />
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
      <SocialProofToast products={products} />
      <MysteryGift />
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        savings={lastOrderSavings}
      />
      {/* <FullScreenPromo /> */}

      <InviteFriendModal
        isOpen={useStore(state => state.showInviteModal)}
        onClose={() => useStore.getState().setShowInviteModal(false)}
      />

      {showSlots && <SlotMachine onClose={() => setShowSlots(false)} />}
    </BrowserRouter>
  );
}

export default App;
