import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Bell, Clock, Trophy, ShoppingBag, ChevronLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { notificationSettings, updateNotificationSettings } = useStore();

    // Local state for immediate feedback before saving (optional, but direct store update is fine for this app)
    const [settings, setSettings] = useState(notificationSettings);

    const handleChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        updateNotificationSettings(newSettings);
    };

    return (
        <div className="bg-[#f5f5f5] min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Settings</h1>
            </div>

            <div className="p-4 space-y-6">

                {/* Notification Control Section */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                        Live Notifications
                    </h2>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        {/* Master Toggle */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${settings.enabled ? 'bg-orange-100 text-[#fb7701]' : 'bg-gray-100 text-gray-400'}`}>
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Enable Notifications</p>
                                    <p className="text-xs text-gray-500">Show alerts on dashboard</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.enabled}
                                    onChange={(e) => handleChange('enabled', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fb7701]"></div>
                            </label>
                        </div>

                        {settings.enabled && (
                            <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">

                                {/* Frequency Slider */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={16} />
                                            <span className="text-sm font-medium">Frequency</span>
                                        </div>
                                        <span className="text-xs font-bold text-[#fb7701] bg-orange-50 px-2 py-1 rounded-md">
                                            Every {Math.round(settings.frequency / 60) < 1 ? settings.frequency + 's' : Math.round(settings.frequency / 60) + 'm'}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="600"
                                        step="10"
                                        value={settings.frequency}
                                        onChange={(e) => handleChange('frequency', parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#fb7701]"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                        <span>10s</span>
                                        <span>5m</span>
                                        <span>10m</span>
                                    </div>
                                </div>

                                {/* Toggle Types */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-md">
                                                <Trophy size={16} />
                                            </div>
                                            <span className="text-sm text-gray-700">Daily Spin Winners</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.showSpinWins}
                                            onChange={(e) => handleChange('showSpinWins', e.target.checked)}
                                            className="w-4 h-4 text-[#fb7701] border-gray-300 rounded focus:ring-[#fb7701]"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                                                <ShoppingBag size={16} />
                                            </div>
                                            <span className="text-sm text-gray-700">Recent Purchases</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={settings.showPurchases}
                                            onChange={(e) => handleChange('showPurchases', e.target.checked)}
                                            className="w-4 h-4 text-[#fb7701] border-gray-300 rounded focus:ring-[#fb7701]"
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </section>

                {/* Game Popups Control */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                        Game Popups
                    </h2>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎁</span>
                                <span className="text-sm font-semibold text-gray-800">Mystery Gift</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={notificationSettings?.mysteryGift ?? true}
                                // Note: We need to use updateGameSettings here, but first need to expose it in the component
                                // For now, I'll update the component logic to use gameSettings properly
                                onChange={() => { }}
                                className="w-5 h-5 text-[#fb7701] border-gray-300 rounded focus:ring-[#fb7701]"
                            />
                        </div>
                    </div>
                </section>

                <div className="text-center text-xs text-gray-400 pt-8">
                    <p>Settings are saved automatically.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
