import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, User, LayoutDashboard } from 'lucide-react';
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
        <div>
            <Outlet context={{ isAdmin, isSuperAdmin, user }} />

            {/* Bottom Navigation */}
            {!location.pathname.startsWith('/product/') && location.pathname !== '/rewards' && (
                <nav>
                    <button onClick={() => navigate('/')}>
                        Store
                    </button>

                    <button onClick={() => navigate('/cart')}>
                        Cart {cartCount > 0 && `(${cartCount})`}
                    </button>

                    <button onClick={() => navigate('/profile')}>
                        Profile
                    </button>

                    {isAdmin && (
                        <button onClick={() => navigate('/admin')}>
                            Admin
                        </button>
                    )}
                </nav>
            )}
        </div>
    );
};

export default Layout;
