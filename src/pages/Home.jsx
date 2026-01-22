import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import HeroSlider from '../components/HeroSlider';
import { Search } from 'lucide-react';

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {




    // Extract departments and categories
    const departments = useMemo(() => {
        const depts = products.map(p => p.department).filter(Boolean);
        return ["All", ...new Set(depts)];
    }, [products]);
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Get unique categories based on selected department
    const availableSubCategories = useMemo(() => {
        if (selectedDepartment === "All") return [];
        const cats = products
            .filter(p => p.department === selectedDepartment)
            .map(p => p.category);
        return ["All", ...new Set(cats)];
    }, [products, selectedDepartment]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesDepartment = selectedDepartment === "All" || p.department === selectedDepartment;
            const matchesCategory = selectedSubCategory === "All" || p.category === selectedSubCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesDepartment && matchesCategory && matchesSearch;
        });
    }, [products, selectedDepartment, selectedSubCategory, searchQuery]);

    // Reset subcategory when department changes
    const handleDepartmentChange = (dept) => {
        setSelectedDepartment(dept);
        setSelectedSubCategory("All");
    };

    // Infinite Scroll Listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                if (hasMore && !isFetching && loadMore) {
                    loadMore();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isFetching, loadMore]);

    return (
        <div className="pb-4 pt-14 min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
            {/* Fixed Header (Search Only) */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--tg-theme-bg-color)] pt-2 pb-2 px-3 border-b border-[var(--tg-theme-section-separator-color)]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] pl-9 pr-4 py-2 rounded-xl border-none outline-none placeholder:text-[var(--tg-theme-hint-color)] text-base font-normal caret-[var(--tg-theme-button-color)]"
                    />
                    <Search className="absolute left-3 top-2.5 text-[var(--tg-theme-hint-color)]" size={18} />
                </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex flex-col gap-4">
                {/* Hero Section */}
                <HeroSlider onNavigate={handleDepartmentChange} />

                {/* Sticky Navigation */}
                <div className="sticky top-[56px] z-40 bg-[var(--tg-theme-bg-color)]/95 backdrop-blur-md py-2 border-b border-[var(--tg-theme-section-separator-color)] shadow-sm">
                    {/* Department Pills */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center px-4">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => handleDepartmentChange(dept)}
                                className={`whitespace-nowrap text-sm px-4 py-1.5 rounded-full transition-all font-medium ${selectedDepartment === dept
                                    ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] shadow-md transform scale-105'
                                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-section-separator-color)]'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {/* Sub-Category Pills */}
                    {selectedDepartment !== "All" && availableSubCategories.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar items-center px-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                            {availableSubCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedSubCategory(cat)}
                                    className={`whitespace-nowrap text-xs px-3 py-1 rounded-full border transition-all ${selectedSubCategory === cat
                                        ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/10 text-[var(--tg-theme-button-color)] font-semibold'
                                        : 'border-[var(--tg-theme-section-separator-color)] text-[var(--tg-theme-hint-color)] hover:border-[var(--tg-theme-hint-color)]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Section */}
                <div className="px-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                            {searchQuery ? 'Search Results' : 'Featured Products'}
                            {!searchQuery && <span className="text-xs font-normal text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-section-separator-color)] px-2 py-0.5 rounded-full">{filteredProducts.length} items</span>}
                        </h3>
                    </div>

                    <ProductList products={filteredProducts} onAdd={onAdd} wishlist={wishlist} onToggleWishlist={toggleWishlist} />

                    {isFetching && (
                        <div className="py-8 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tg-theme-button-color)]"></div>
                        </div>
                    )}

                    {!hasMore && products.length > 0 && (
                        <div className="py-8 text-center text-[var(--tg-theme-hint-color)] text-sm">
                            You've seen all the products! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
