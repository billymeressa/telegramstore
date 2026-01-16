import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';

const tele = window.Telegram?.WebApp;

const Layout = ({ cartCount, isAdmin, user }) => {
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
        <div className="min-h-screen bg-tg-bg text-tg-text pb-20">
            <Outlet context={{ isAdmin, user }} />

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-2 flex justify-between items-center z-50">
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center gap-1 w-full py-2 ${location.pathname === '/' ? 'text-[#054D3B]' : 'text-[#9CA3AF]'}`}
                >
                    <Store size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    <span className={`text-[10px] ${location.pathname === '/' ? 'font-bold' : 'font-normal'}`}>Home</span>
                </button>

                <button
                    onClick={() => navigate('/cart')}
                    className={`relative flex flex-col items-center gap-1 w-full py-2 ${location.pathname === '/cart' ? 'text-[#054D3B]' : 'text-[#9CA3AF]'}`}
                >
                    <div className="relative">
                        <ShoppingBag size={22} strokeWidth={location.pathname === '/cart' ? 2.5 : 2} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-[#d51e24] text-white text-[11px] font-bold px-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] ${location.pathname === '/cart' ? 'font-bold' : 'font-normal'}`}>Cart</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center gap-1 w-full py-2 ${location.pathname === '/profile' ? 'text-[#054D3B]' : 'text-[#9CA3AF]'}`}
                >
                    <User size={22} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
                    <span className={`text-[10px] ${location.pathname === '/profile' ? 'font-bold' : 'font-normal'}`}>You</span>
                </button>

                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        className={`flex flex-col items-center gap-1 w-full py-2 ${location.pathname === '/admin' ? 'text-[#054D3B]' : 'text-[#9CA3AF]'}`}
                    >
                        <LayoutDashboard size={22} strokeWidth={location.pathname === '/admin' ? 2.5 : 2} />
                        <span className={`text-[10px] ${location.pathname === '/admin' ? 'font-bold' : 'font-normal'}`}>Admin</span>
                    </button>
                )}
            </nav>
        </div>
    );
};

export default Layout;
