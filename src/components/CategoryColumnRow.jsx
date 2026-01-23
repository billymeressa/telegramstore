import React from 'react';
import { Shirt, ShoppingBag, Baby, Smartphone, Home, Sparkles, Dumbbell, Book, Package, Laptop, Headphones, HardDrive, Keyboard, Gamepad2, Wifi, Zap, Mouse, Plug } from 'lucide-react';

const CATEGORY_ICONS = {
    'Men': Shirt,
    'Women': ShoppingBag,
    'Kids': Baby,
    'Electronics': Smartphone,
    'Home': Home,
    'Beauty': Sparkles,
    'Sports': Dumbbell,
    'Books': Book,
    'Other': Package,
    // Subcategories
    'Phones': Smartphone,
    'Laptops': Laptop,
    'Audio': Headphones,
    'Storage': HardDrive,
    'Hard Drives': HardDrive,
    'Computer Accessories': Keyboard,
    'Keyboards': Keyboard,
    'Mice': Mouse,
    'Gaming': Gamepad2,
    'Networking': Wifi,
    'Smart Home': Zap,
    'Cables & Adapters': Plug,
};

const COLORS = [
    'from-blue-500 to-blue-600',
    'from-pink-500 to-rose-500',
    'from-orange-400 to-amber-500',
    'from-purple-500 to-indigo-600',
    'from-emerald-400 to-teal-500',
    'from-red-400 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-slate-500 to-gray-600'
];

const CategoryColumnRow = ({ categories, onSelect }) => {
    return (
        <div className="py-4">
            <h3 className="px-4 mb-3 text-lg font-bold text-[var(--tg-theme-text-color)]">Shop by Category</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 snap-x">
                {categories.map((cat, index) => {
                    if (cat === 'All') return null; // Skip 'All' for visual columns

                    const Icon = CATEGORY_ICONS[cat] || Package;
                    const gradient = COLORS[index % COLORS.length];

                    return (
                        <div
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer snap-start active:opacity-80 transition-opacity"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shadow-gray-200/50`}>
                                <Icon size={28} strokeWidth={2} />
                            </div>
                            <span className="text-xs font-semibold text-[var(--tg-theme-text-color)] text-center line-clamp-1">
                                {cat}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryColumnRow;
