import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract title from path (e.g. "/settings" -> "Settings")
    const title = location.pathname.split('/')[1]?.charAt(0).toUpperCase() + location.pathname.split('/')[1]?.slice(1) || 'Page';

    return (
        <div className="min-h-screen bg-[#f5f5f5] pb-10 font-sans pt-[var(--tg-content-safe-area-top)] flex flex-col">


            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Construction size={40} className="text-[#fb7701]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs">
                    We're working hard to bring you the <b>{title}</b> feature. Stay tuned for updates!
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold shadow-sm active:bg-gray-50"
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
};

export default PlaceholderPage;
