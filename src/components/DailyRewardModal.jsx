import { useState, useEffect } from 'react';
import { X, Gift, Calendar, Check } from 'lucide-react';
import useStore from '../store/useStore';

const DailyRewardModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const user = useStore(state => state.user);
    const gameSettings = useStore(state => state.gameSettings);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        // Listen for the custom event dispatched from Home.jsx
        window.addEventListener('open-daily-reward', handleOpen);

        // Optional: Open automatically if not claimed today (logic would go here)

        return () => window.removeEventListener('open-daily-reward', handleOpen);
    }, []);

    const handleClaim = () => {
        setClaiming(true);
        // Simmsulate claim API call
        setTimeout(() => {
            setClaiming(false);
            setIsOpen(false);
            alert("Reward Claimed! (Simulation)"); // Replace with actual logic
        }, 1500);
    };

    if (!isOpen || !gameSettings?.dailyReward) return null;

    const streak = user?.checkInStreak || 1;
    const rewardAmount = 10 * streak;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#fb7701] to-red-500 p-6 text-white text-center relative">
                    <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-lg">
                        <Calendar size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Daily Login Reward</h2>
                    <p className="opacity-90 text-sm">Keep your streak alive!</p>
                </div>

                {/* Days Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-4 gap-2 mb-6">
                        {[1, 2, 3, 4].map(day => (
                            <div key={day} className={`flex flex-col items-center p-2 rounded-lg border ${day <= streak ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                                <span className="text-xs text-gray-400 mb-1">Day {day}</span>
                                {day <= streak ? (
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                        <Gift size={16} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mb-6">
                        <div className="text-sm text-gray-500 mb-1">Today's Reward</div>
                        <div className="text-3xl font-black text-[#fb7701]">{rewardAmount} ETB</div>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className="w-full bg-[#fb7701] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {claiming ? (
                            <>Claiming...</>
                        ) : (
                            <>
                                <Gift size={20} /> Claim Reward
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyRewardModal;
