import { useState, useEffect } from 'react';
import { Calendar, Check, Gift, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import API_URL from '../config';

const DailyCheckIn = () => {
    const [streak, setStreak] = useState(0);
    const [checkedInToday, setCheckedInToday] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(true); // Start open or minimized?

    useEffect(() => {
        // Fetch initial state
        const fetchStatus = async () => {
            const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (!user) return;

            // ideally we'd have a GET endpoint, but we can infer from local storage or just try a dry-run?
            // For now let's just use local storage for UI state to avoid extra API calls if possible,
            // BUT backend is source of truth.
            // Let's assume we won't know until we try to check in OR we add a GET endpoint.
            // Actually, we added /api/users which returns all users, not efficient.
            // Let's just track "lastCheckInDate" in localStorage for UI optimistically?
            // No, let's just show the UI as "Ready to Check In" if we don't know, and handle "Already done" gracefully.

            const lastCheckIn = localStorage.getItem('lastCheckInDate'); // YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];
            if (lastCheckIn === today) {
                setCheckedInToday(true);
            }

            const savedStreak = localStorage.getItem('checkInStreak');
            if (savedStreak) setStreak(parseInt(savedStreak));

            setLoading(false);
        };
        fetchStatus();
    }, []);

    const handleCheckIn = async () => {
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!user) {
            alert("Open in Telegram to check in!");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/daily-checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();

            if (!data.success) {
                if (data.message.includes('Already')) {
                    setCheckedInToday(true);
                    setStreak(data.streak);
                    // localStorage sync
                    const today = new Date().toISOString().split('T')[0];
                    localStorage.setItem('lastCheckInDate', today);
                    localStorage.setItem('checkInStreak', data.streak.toString());
                    alert("You already checked in today! Come back tomorrow.");
                } else {
                    alert(data.message);
                }
                return;
            }

            // Success
            setStreak(data.streak);
            setCheckedInToday(true);
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('lastCheckInDate', today);
            localStorage.setItem('checkInStreak', data.streak.toString());

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

        } catch (e) {
            console.error(e);
            alert("Check-in failed. Try again.");
        }
    };

    if (loading) return null;

    // Render 7 Days
    const days = [1, 2, 3, 4, 5, 6, 7];

    return (
        <div className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4 shadow-sm border border-[var(--tg-theme-section-separator-color)]">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[var(--tg-theme-text-color)]">Daily Check-in</h3>
                        <p className="text-xs text-[var(--tg-theme-hint-color)]">
                            Streak: <span className="text-orange-500 font-bold">{streak} Days</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleCheckIn}
                    disabled={checkedInToday}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${checkedInToday
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-[var(--tg-theme-button-color)] text-white shadow-lg shadow-blue-500/30 active:scale-95'
                        }`}
                >
                    {checkedInToday ? 'Checked In' : 'Claim'}
                </button>
            </div>

            <div className="flex justify-between gap-1">
                {days.map((day) => {
                    const isCompleted = streak >= day;
                    const isToday = streak + 1 === day && !checkedInToday; // Simplified visualization
                    // Actually, if streak is 3. Days 1,2,3 are done. Day 4 is next.
                    // If checkedInTotal is true, then 1,2,3 are done (streak=3).

                    // Let's assume streak includes today if checked in.
                    const active = day <= streak;

                    return (
                        <div key={day} className={`flex-1 flex flex-col items-center gap-1 p-1 rounded-lg ${active ? 'bg-yellow-50' : ''}`}>
                            <div className="text-[10px] font-medium text-gray-400">Day {day}</div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${active
                                    ? 'bg-yellow-400 border-yellow-400 text-white'
                                    : 'bg-transparent border-gray-200 text-gray-300'
                                }`}>
                                {active ? <Check size={14} /> : <span className="text-[10px]">+{day * 10}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyCheckIn;
