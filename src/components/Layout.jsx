import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, User, LayoutDashboard, Gift } from 'lucide-react';
import { useEffect, useCallback } from 'react';

const tele = window.Telegram?.WebApp;

const Layout = ({ cartCount, isAdmin, isSuperAdmin, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        if (!tele) return;

        const backButton = tele.BackButton;
        if (!backButton) return;

        if (location.pathname !== '/') {
            backButton.show();
            backButton.onClick(handleBack);
        } else {
            backButton.hide();
        }

        return () => {
            backButton.offClick(handleBack);
        };
    }, [location.pathname, handleBack]);

    return (
        <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] pb-[calc(70px+var(--tg-safe-area-bottom))] font-sans">
            <Outlet context={{ isAdmin, isSuperAdmin, user }} />

            {/* Bottom Navigation (Hidden on ProductDetails) */}
            {!location.pathname.startsWith('/product/') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-[var(--tg-theme-secondary-bg-color)] border-t border-[var(--tg-theme-section-separator-color)] pt-1 pb-[calc(16px+var(--tg-safe-area-bottom))] px-2 flex justify-around items-center z-[9999] transform-gpu translate-z-0">
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

                    <button
                        onClick={() => navigate('/rewards')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:opacity-70 transition-opacity ${location.pathname === '/rewards' ? 'text-[var(--tg-theme-button-color)]' : 'text-[var(--tg-theme-hint-color)]'}`}
                    >
                        {location.pathname === '/rewards' ? <Gift size={22} strokeWidth={2.5} /> : <Gift size={22} strokeWidth={1.5} />}
                        <span className="text-[9px] font-medium">Rewards</span>
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

                    <div className="absolute bottom-0 left-0 right-0 text-[9px] text-center text-[var(--tg-theme-hint-color)] opacity-60 pointer-events-none font-medium pb-[calc(2px+var(--tg-safe-area-bottom)/2)]">
                        Addis Store
                    </div>
                </nav>
            )}
        </div>
    );
};

export default Layout;
