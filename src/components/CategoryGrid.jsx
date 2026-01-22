import React from 'react';
import { Shirt, PersonStanding, Baby, Smartphone, Home, Sparkles, Book, Trophy, LayoutGrid } from 'lucide-react';

const CategoryGrid = ({ categories, selectedCategory, onSelect }) => {
    // Map department names to icons
    const iconMap = {
        'All': LayoutGrid,
        'Men': Shirt,
        'Women': PersonStanding,
        'Kids': Baby,
        'Electronics': Smartphone,
        'Home': Home,
        'Beauty': Sparkles,
        'Books': Book,
        'Sports': Trophy
    };

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-2 px-3">
            <div className="flex gap-4 min-w-max">
                {categories.map((cat) => {
                    const Icon = iconMap[cat] || LayoutGrid; // Fallback icon
                    const isSelected = selectedCategory === cat;

                    return (
                        <button
                            key={cat}
                            onClick={() => onSelect(cat)}
                            className="flex flex-col items-center gap-1.5 group"
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected
                                ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] shadow-md scale-105'
                                : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-hint-color)] group-active:scale-95'
                                }`}>
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className={`text-xs font-medium transition-colors ${isSelected
                                ? 'text-[var(--tg-theme-button-color)]'
                                : 'text-[var(--tg-theme-hint-color)]'
                                }`}>
                                {cat}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryGrid;
