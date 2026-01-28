import { useState, useEffect } from 'react';
import API_URL from '../config';
import { BarChart3, Users, Eye, ShoppingCart, TrendingUp } from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        purple: 'text-purple-500',
        orange: 'text-orange-500'
    };

    return (
        <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)]">
            <div className={`${colorClasses[color]} mb-2`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-1">
                {value.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--tg-theme-hint-color)]">
                {label}
            </p>
        </div>
    );
};

const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const width = 100; // percentage
    const height = 200;
    const padding = 20;

    // Find max value for scaling
    const maxValue = Math.max(
        ...data.map(d => Math.max(d.app_open || 0, d.view_product || 0, d.add_to_cart || 0))
    );

    const scaleY = (value) => {
        return height - padding - ((value / (maxValue || 1)) * (height - 2 * padding));
    };

    const scaleX = (index) => {
        return padding + (index / (data.length - 1 || 1)) * (300 - 2 * padding);
    };

    const createPath = (key, color) => {
        const points = data.map((d, i) => `${scaleX(i)},${scaleY(d[key] || 0)}`).join(' L ');
        return points ? `M ${points}` : '';
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 320 200" className="w-full" style={{ minWidth: '300px' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <line
                        key={i}
                        x1={padding}
                        y1={height - padding - ratio * (height - 2 * padding)}
                        x2={300 - padding}
                        y2={height - padding - ratio * (height - 2 * padding)}
                        stroke="var(--tg-theme-hint-color)"
                        strokeOpacity="0.1"
                        strokeWidth="1"
                    />
                ))}

                {/* Lines */}
                <path
                    d={createPath('app_open')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                />
                <path
                    d={createPath('view_product')}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                />
                <path
                    d={createPath('add_to_cart')}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                />

                {/* Data points */}
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={scaleX(i)} cy={scaleY(d.app_open || 0)} r="3" fill="#10b981" />
                        <circle cx={scaleX(i)} cy={scaleY(d.view_product || 0)} r="3" fill="#8b5cf6" />
                        <circle cx={scaleX(i)} cy={scaleY(d.add_to_cart || 0)} r="3" fill="#f97316" />
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[var(--tg-theme-text-color)]">App Opens</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-[var(--tg-theme-text-color)]">Product Views</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-[var(--tg-theme-text-color)]">Add to Carts</span>
                </div>
            </div>

            {/* Date labels */}
            <div className="flex justify-between mt-2 text-xs text-[var(--tg-theme-hint-color)] px-5">
                {data.map((d, i) => {
                    if (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) {
                        const date = new Date(d.date);
                        return <span key={i}>{date.getMonth() + 1}/{date.getDate()}</span>;
                    }
                    return null;
                }).filter(Boolean)}
            </div>
        </div>
    );
};

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalEvents: 0,
        uniqueUsers: 0,
        appOpens: 0,
        productViews: 0,
        addToCarts: 0,
        topProducts: [],
        timeSeriesData: [],
        sessionMetrics: {
            totalSessions: 0,
            avgSessionDuration: 0,
            sessionsPerUser: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    fetch(`${API_URL}/api/analytics/stats`),
                    fetch(`${API_URL}/api/users`, {
                        headers: {
                            'Authorization': window.Telegram?.WebApp?.initData || ''
                        }
                    })
                ]);

                const statsData = await statsRes.json();
                setStats(statsData);

                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tg-theme-button-color)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)] p-4 pb-20 pt-tg-safe">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-6 flex items-center gap-2">
                    <BarChart3 size={28} className="text-[var(--tg-theme-button-color)]" />
                    Analytics Dashboard
                </h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard
                        icon={<Users size={20} />}
                        label="Unique Users"
                        value={stats.uniqueUsers}
                        color="blue"
                    />
                    <StatCard
                        icon={<span className="text-xl font-bold">ETB</span>}
                        label="Total Revenue"
                        value={stats.totalRevenue && typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toLocaleString() : '0'}
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        label="App Opens"
                        value={stats.appOpens}
                        color="green"
                    />
                    <StatCard
                        icon={<Eye size={20} />}
                        label="Product Views"
                        value={stats.productViews}
                        color="purple"
                    />
                    <StatCard
                        icon={<ShoppingCart size={20} />}
                        label="Add to Carts"
                        value={stats.addToCarts}
                        color="orange"
                    />
                    <StatCard
                        icon={<TrendingUp size={20} />}
                        label="Conversion Rate"
                        value={`${stats.uniqueUsers > 0 ? ((stats.totalOrders || 0) / stats.uniqueUsers * 100).toFixed(1) : 0}%`}
                        color="green"
                    />
                </div>

                {/* Session Metrics */}
                <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)] mb-6">
                    <h2 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-3">
                        Session Insights
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--tg-theme-button-color)]">
                                {stats.sessionMetrics.totalSessions}
                            </p>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">Total Sessions</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--tg-theme-button-color)]">
                                {Math.floor(stats.sessionMetrics.avgSessionDuration / 60)}m {stats.sessionMetrics.avgSessionDuration % 60}s
                            </p>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">Avg Session</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-[var(--tg-theme-button-color)]">
                                {stats.sessionMetrics.sessionsPerUser}
                            </p>
                            <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">Sessions/User</p>
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                {stats.timeSeriesData.length > 0 && (
                    <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)] mb-6">
                        <h2 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-4">
                            Activity Over Time (Last 7 Days)
                        </h2>
                        <SimpleLineChart data={stats.timeSeriesData} />
                    </div>
                )}

                {/* Top Products */}
                <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)]">
                    <h2 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-3">
                        Top Viewed Products
                    </h2>
                    {stats.topProducts.length > 0 ? (
                        <div className="space-y-2">
                            {stats.topProducts.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-[var(--tg-theme-text-color)] text-sm">
                                            {item.productTitle || `Product #${item.productId}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[var(--tg-theme-hint-color)]">Views</p>
                                        <p className="text-lg font-bold text-[var(--tg-theme-button-color)]">
                                            {item.count}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--tg-theme-hint-color)] text-sm text-center py-4">
                            No data yet
                        </p>
                    )}
                </div>
                {/* User Sources */}
                <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)] mb-6">
                    <h2 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-3">
                        Acquisition Sources
                    </h2>
                    {stats.userSources && stats.userSources.length > 0 ? (
                        <div className="space-y-3">
                            {stats.userSources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-[var(--tg-theme-text-color)] capitalize">
                                            {source.source.replace(/_/g, ' ')}
                                        </span>
                                        <div className="w-32 h-1.5 bg-[var(--tg-theme-secondary-bg-color)] rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--tg-theme-button-color)] rounded-full"
                                                style={{ width: `${(source.count / stats.uniqueUsers) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--tg-theme-text-color)]">
                                        {source.count} <span className="text-xs font-normal text-[var(--tg-theme-hint-color)]">users</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg">
                            <p className="text-sm text-[var(--tg-theme-hint-color)]">No referral data yet.</p>
                            <p className="text-xs text-[var(--tg-theme-link-color)] mt-1">Try using links like: t.me/bot?startapp=promo</p>
                        </div>
                    )}
                </div>

                {/* Recent Users List */}
                <div className="bg-[var(--tg-theme-bg-color)] rounded-xl p-4 border border-[var(--tg-theme-section-separator-color)] mb-6">
                    <h2 className="text-lg font-bold text-[var(--tg-theme-text-color)] mb-4 flex items-center justify-between">
                        <span>Recent Users</span>
                        <span className="text-sm font-normal text-[var(--tg-theme-hint-color)]">{users.length} users</span>
                    </h2>

                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-[var(--tg-theme-hint-color)] uppercase bg-[var(--tg-theme-secondary-bg-color)]">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">User</th>
                                        <th className="px-3 py-2">Joined</th>
                                        <th className="px-3 py-2 rounded-r-lg">Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr key={user.userId || idx} className="border-b border-[var(--tg-theme-section-separator-color)] last:border-0 hover:bg-[var(--tg-theme-secondary-bg-color)] transition-colors">
                                            <td className="px-3 py-3 font-medium text-[var(--tg-theme-text-color)]">
                                                <div className="flex flex-col">
                                                    <span>{user.firstName}</span>
                                                    {user.username && <span className="text-xs text-[var(--tg-theme-link-color)]">@{user.username}</span>}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-[var(--tg-theme-hint-color)]">
                                                {new Date(user.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-3 text-[var(--tg-theme-hint-color)]">
                                                {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-[var(--tg-theme-hint-color)] py-4">No users found.</p>
                    )}
                </div>

                {/* Top Products */}
                {/* ... existing code ... */}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
