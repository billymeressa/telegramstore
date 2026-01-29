import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const FlashSaleTimer = ({ className = "" }) => {
    // Initialize with a random duration between 45 min and 3 hours to seem real
    const [timeLeft, setTimeLeft] = useState(() => {
        return 2700 + Math.floor(Math.random() * 8100);
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (timeLeft === 0) return null;

    return (
        <div className={`flex items-center gap-1.5 text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100 ${className}`}>
            <Timer size={12} className="text-red-600" />
            <span className="tracking-wide text-[10px] uppercase font-extrabold">Flash Sale: <span className="tabular-nums font-mono text-xs">{formatTime(timeLeft)}</span></span>
        </div>
    );
};

export default FlashSaleTimer;
