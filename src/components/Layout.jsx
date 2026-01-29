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
        <div className="min-h-dvh bg-[var(--tg-theme-secondary-bg-color)] pb-[calc(50px+var(--tg-safe-area-bottom))] font-sans">
            <Outlet context={{ isAdmin, isSuperAdmin, user }} />

            {/* Bottom Navigation (Hidden on ProductDetails) */}
            {!location.pathname.startsWith('/product/') && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pt-1 pb-[var(--tg-safe-area-bottom)] px-2 flex justify-around items-center z-[9999] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
                    <button
                        onClick={() => navigate('/')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${location.pathname === '/' ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <Store size={24} strokeWidth={location.pathname === '/' ? 2.5 : 1.5} />
                        <span className="text-[10px] font-medium">Store</span>
                    </button>

                    <button
                        onClick={() => navigate('/cart')}
                        className={`relative flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${location.pathname === '/cart' ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <div className="relative">
                            <ShoppingBag size={24} strokeWidth={location.pathname === '/cart' ? 2.5 : 1.5} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1.5 bg-danger text-white text-[10px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Cart</span>
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <User size={24} strokeWidth={location.pathname === '/profile' ? 2.5 : 1.5} />
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>

                    <button
                        onClick={() => navigate('/rewards')}
                        className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${location.pathname === '/rewards' ? 'text-primary' : 'text-gray-400'}`}
                    >
                        <Gift size={24} strokeWidth={location.pathname === '/rewards' ? 2.5 : 1.5} />
                        <span className="text-[10px] font-medium">Rewards</span>
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${location.pathname === '/admin' ? 'text-primary' : 'text-gray-400'}`}
                        >
                            <LayoutDashboard size={24} strokeWidth={location.pathname === '/admin' ? 2.5 : 1.5} />
                            <span className="text-[10px] font-medium">Admin</span>
                        </button>
                    )}
                </nav>
            )}
        </div>
    );
};

export default Layout;
