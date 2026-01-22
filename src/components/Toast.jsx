import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, onClose, duration = 2000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
            <div className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <CheckCircle size={20} className="text-[var(--tg-theme-button-text-color)]" />
                <span className="font-medium text-sm">{message}</span>
            </div>
        </div>
    );
};

export default Toast;
