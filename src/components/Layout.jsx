import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingCart, User, LayoutDashboard, Search } from 'lucide-react';
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

        if (location.pathname !== '/' && location.pathname !== '/categories') {
            backButton.show();
            backButton.onClick(handleBack);
        } else {
            backButton.hide();
        }

        return () => {
            backButton.offClick(handleBack);
        };
    }, [location.pathname, handleBack]);

    const NavItem = ({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
            <button
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center w-full py-1.5 gap-0.5 active:scale-95 transition-transform ${isActive ? 'text-[#fb7701]' : 'text-gray-500'}`}
            >
                <div className="relative">
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? "currentColor" : "none"} />
                    {path === '/cart' && cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-[#be0000] text-white text-[10px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
                            {cartCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] pb-[60px]">
            <Outlet context={{ isAdmin, isSuperAdmin, user }} />

            {/* Bottom Navigation Temu Style */}
            {!location.pathname.startsWith('/product/') && location.pathname !== '/rewards' && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[var(--tg-safe-area-bottom)] flex justify-between px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <NavItem path="/" icon={Store} label="Home" />
                    <NavItem path="/cart" icon={ShoppingCart} label="Cart" />
                    <NavItem path="/profile" icon={User} label="You" />
                    {isAdmin && <NavItem path="/admin" icon={LayoutDashboard} label="Admin" />}
                </nav>
            )}
        </div>
    );
};

export default Layout;
