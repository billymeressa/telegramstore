import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, Users, Percent, Target, AlertTriangle, Calculator, BarChart3, Info } from 'lucide-react';

const SalesSimulator = () => {
    // State for inputs
    const [traffic, setTraffic] = useState(1000);
    const [conversion, setConversion] = useState(2.5);
    const [aov, setAov] = useState(500);
    const [margin, setMargin] = useState(40); // %
    const [discount, setDiscount] = useState(15); // %
    const [volumeBoost, setVolumeBoost] = useState(20); // %
    const [adSpend, setAdSpend] = useState(0);

    // Derived values
    const results = useMemo(() => {
        // Current State
        const currentVolume = Math.round(traffic * (conversion / 100));
        const currentRevenue = currentVolume * aov;
        const unitCost = aov * (1 - (margin / 100));
        const currentTotalCost = currentVolume * unitCost;
        const currentProfit = currentRevenue - currentTotalCost;

        // Projected State
        // New Volume based on User's estimated boost
        // Note: Boost applies to total sales volume (conversions), not just traffic
        const newVolume = Math.round(currentVolume * (1 + (volumeBoost / 100)));

        // New Unit Revenue (Price after discount)
        const newPrice = aov * (1 - (discount / 100));

        const newRevenue = newVolume * newPrice;
        const newTotalCost = (newVolume * unitCost) + Number(adSpend);
        const newProfit = newRevenue - newTotalCost;

        // Comparisons
        const profitChange = newProfit - currentProfit;
        const revenueChange = newRevenue - currentRevenue;
        const roi = (profitChange > 0)
            ? ((profitChange / (Number(adSpend) || 1)) * 100)
            : 0; // Simplified ROI on ad spend

        // Break-even Analysis
        // Need to find Volume Boost X where New Profit = Current Profit
        // (Vol * (1+X) * (Price*(1-d) - Cost)) - AdSpend = CurrentProfit
        // Vol*(1+X) * UnitMarginNew = CurrentProfit + AdSpend
        // 1+X = (CurrentProfit + AdSpend) / (Vol * UnitMarginNew)
        // X = ((CurrentProfit + AdSpend) / (Vol * UnitMarginNew)) - 1
        const unitMarginNew = newPrice - unitCost;
        let breakEvenLift = 0;
        if (unitMarginNew > 0 && currentVolume > 0) {
            breakEvenLift = (((currentProfit + Number(adSpend)) / (currentVolume * unitMarginNew)) - 1) * 100;
        } else {
            breakEvenLift = 999; // Impossible
        }

        return {
            currentRevenue,
            currentProfit,
            newRevenue,
            newProfit,
            profitChange,
            revenueChange,
            breakEvenLift,
            unitMarginNew,
            currentVolume,
            newVolume
        };
    }, [traffic, conversion, aov, margin, discount, volumeBoost, adSpend]);

    const formatMoney = (val) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Profit Simulator</h2>
                        <p className="text-xs text-gray-500">Predict the impact of discounts & ads</p>
                    </div>
                </div>
                {results.profitChange > 0 ? (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <TrendingUp size={14} />
                        Potential Win
                    </div>
                ) : (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={14} />
                        Projected Loss
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Baseline Metrics</h3>

                            <InputGroup label="Monthly Traffic" icon={<Users size={14} />} value={traffic} onChange={setTraffic} min={100} step={100} />
                            <InputGroup label="Conversion Rate (%)" icon={<Percent size={14} />} value={conversion} onChange={setConversion} step={0.1} max={100} />
                            <InputGroup label="Avg Order Value (ETB)" icon={<DollarSign size={14} />} value={aov} onChange={setAov} step={50} />
                            <InputGroup label="Avg Product Margin (%)" icon={<Target size={14} />} value={margin} onChange={setMargin} max={100} />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Campaign Settings</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Discount</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min="0" max="90" step="5"
                                        value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                                        className="flex-1 accent-blue-600"
                                    />
                                    <span className="font-bold text-blue-700 w-12 text-right">{discount}%</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Expected Volume Lift</span>
                                    <span className="text-xs text-blue-500 font-normal">How much more will you sell?</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min="0" max="300" step="5"
                                        value={volumeBoost} onChange={(e) => setVolumeBoost(Number(e.target.value))}
                                        className="flex-1 accent-blue-600"
                                    />
                                    <span className="font-bold text-blue-700 w-12 text-right">+{volumeBoost}%</span>
                                </div>
                            </div>

                            <InputGroup label="Ad Spend (ETB)" icon={<DollarSign size={14} />} value={adSpend} onChange={setAdSpend} step={100} />
                        </div>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Top KPI Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <ResultCard
                                label="Projected Revenue"
                                current={results.currentRevenue}
                                projected={results.newRevenue}
                                icon={<BarChart3 size={18} />}
                                format={formatMoney}
                            />
                            <ResultCard
                                label="Projected Profit"
                                current={results.currentProfit}
                                projected={results.newProfit}
                                icon={<DollarSign size={18} />}
                                format={formatMoney}
                                highlight
                            />
                        </div>

                        {/* Break Even Badge */}
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
                            <Info size={16} className="text-gray-400" />
                            <span className="text-gray-600">To break even on this discount, you need a sales lift of:</span>
                            <span className={`font-bold ${results.breakEvenLift > volumeBoost ? 'text-red-600' : 'text-green-600'}`}>
                                {results.breakEvenLift > 900 ? 'Impossible' : `+${Math.ceil(results.breakEvenLift)}%`}
                            </span>
                            {results.breakEvenLift > volumeBoost && (
                                <span className="text-xs text-red-500 font-medium ml-auto">Increase Lift prediction!</span>
                            )}
                        </div>

                        {/* Visual Bars Comparison */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="font-bold text-gray-800 mb-6">Impact Analysis</h3>

                            {/* Revenue Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Revenue</span>
                                    <span className={results.revenueChange >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                        {results.revenueChange >= 0 ? '+' : ''}{formatMoney(results.revenueChange)}
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                    {/* Base */}
                                    <div className="bg-gray-300 h-full" style={{ width: '50%' }}></div>
                                    {/* Change */}
                                    <div
                                        className={`h-full transition-all duration-500 ${results.newRevenue >= results.currentRevenue ? 'bg-green-500' : 'bg-red-400'}`}
                                        style={{ width: `${Math.min(Math.abs((results.newRevenue - results.currentRevenue) / results.currentRevenue) * 50, 50)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Current: {formatMoney(results.currentRevenue)}</span>
                                    <span>New: {formatMoney(results.newRevenue)}</span>
                                </div>
                            </div>

                            {/* Profit Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Profit (The Real Goal)</span>
                                    <span className={results.profitChange >= 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                        {results.profitChange >= 0 ? '+' : ''}{formatMoney(results.profitChange)}
                                    </span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex relative">
                                    {/* We normalize the bar a bit differently here for vis */}
                                    <div className="bg-gray-800 h-full" style={{ width: '50%' }}></div>
                                    <div
                                        className={`h-full transition-all duration-500 ${results.newProfit >= results.currentProfit ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{
                                            // Scale width roughly based on change %
                                            width: `${Math.min(Math.abs((results.newProfit - results.currentProfit) / (results.currentProfit || 1)) * 25, 50)}%`,
                                            // transform: results.newProfit < results.currentProfit ? 'translateX(-100%)' : 'none' // Hard to do cleanly with simple flex, assume appending for now
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>Current: {formatMoney(results.currentProfit)}</span>
                                    <span>New: {formatMoney(results.newProfit)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InputGroup = ({ label, icon, value, onChange, min = 0, max, step = 1 }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            {icon}{label}
        </label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        />
    </div>
);

const ResultCard = ({ label, current, projected, icon, format, highlight }) => {
    const change = projected - current;
    const isPositive = change >= 0;

    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'bg-gray-900 text-white border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2 opacity-80">
                {icon}
                <span className="text-xs font-medium uppercase">{label}</span>
            </div>
            <div className="text-2xl font-black mb-1">
                {format(projected)}
            </div>
            <div className={`text-xs font-bold flex items-center gap-1 ${highlight
                    ? (isPositive ? 'text-green-400' : 'text-red-400')
                    : (isPositive ? 'text-green-600' : 'text-red-500')
                }`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {format(change)} ({((change / (current || 1)) * 100).toFixed(1)}%)
            </div>
        </div>
    );
};

export default SalesSimulator;
