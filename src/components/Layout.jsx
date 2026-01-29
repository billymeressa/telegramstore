import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';

const tele = window.Telegram?.WebApp;

const Layout = ({ cartCount, isAdmin, isSuperAdmin, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (tele && tele.BackButton) {
            try {
                if (location.pathname !== '/') {
                    tele.BackButton.show();
                    tele.BackButton.onClick(() => navigate(-1));
                } else {
                    tele.BackButton.hide();
                }
            } catch (e) {
                console.error("BackButton error:", e);
            }
        }
        return () => {
            if (tele && tele.BackButton) {
                try {
                    tele.BackButton.offClick(() => navigate(-1));
                } catch (e) {
                    console.error("BackButton cleanup error:", e);
                }
            }
        };
    }, [location, navigate]);

    return (
        <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] pb-[calc(70px+var(--tg-safe-area-bottom))] font-sans">
            <Outlet context={{ isAdmin, isSuperAdmin, user }} />

            {/* Bottom Navigation (Hidden on ProductDetails) */}
            {!location.pathname.startsWith('/product/') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-secondary-bg-color)] border-t border-[var(--tg-theme-section-separator-color)] pb-tg-safe pt-1 px-2 flex justify-around items-center z-50">
                    <button
                        onClick={() => navigate('/')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:opacity-70 transition-opacity ${location.pathname === '/' ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
                    >
                        {location.pathname === '/' ? <Store size={22} strokeWidth={2.5} /> : <Store size={22} strokeWidth={1.5} />}
                        <span className="text-[9px] font-medium">Store</span>
                    </button>

                    <button
                        onClick={() => navigate('/cart')}
                        className={`relative flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:opacity-70 transition-opacity ${location.pathname === '/cart' ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
                    >
                        <div className="relative">
                            {location.pathname === '/cart' ? <ShoppingBag size={22} strokeWidth={2.5} /> : <ShoppingBag size={22} strokeWidth={1.5} />}
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] font-medium">Cart</span>
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:opacity-70 transition-opacity ${location.pathname === '/profile' ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
                    >
                        {location.pathname === '/profile' ? <User size={22} strokeWidth={2.5} /> : <User size={22} strokeWidth={1.5} />}
                        <span className="text-[9px] font-medium">Profile</span>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:opacity-70 transition-opacity ${location.pathname === '/admin' ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
                        >
                            {location.pathname === '/admin' ? <LayoutDashboard size={22} strokeWidth={2.5} /> : <LayoutDashboard size={22} strokeWidth={1.5} />}
                            <span className="text-[9px] font-medium">Admin</span>
                        </button>
                    )}
                </nav>
            )}
        </div>
    );
};

export default Layout;
