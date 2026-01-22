import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import CategoryGrid from '../components/CategoryGrid';
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
        <div className="pb-4 pt-14">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-[var(--tg-theme-bg-color)] pt-2 pb-2 px-3 border-b border-[var(--tg-theme-section-separator-color)]">
                <div className="flex flex-col gap-2">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] pl-9 pr-4 py-1.5 rounded-xl border-none outline-none placeholder:text-[var(--tg-theme-hint-color)] text-base font-normal caret-[var(--tg-theme-button-color)]"
                        />
                        <Search className="absolute left-2.5 top-2 text-[var(--tg-theme-hint-color)]" size={18} />
                    </div>


                    {/* Department Nav */}
                    <CategoryGrid
                        categories={departments}
                        selectedCategory={selectedDepartment}
                        onSelect={handleDepartmentChange}
                    />

                    {/* Sub-Category Nav */}
                    {selectedDepartment !== "All" && availableSubCategories.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar items-center animate-fadeIn pb-1">
                            {availableSubCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedSubCategory(cat)}
                                    className={`whitespace-nowrap text-xs px-2.5 py-0.5 rounded-full border transition-colors ${selectedSubCategory === cat
                                        ? 'border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)] font-medium'
                                        : 'border-[var(--tg-theme-section-separator-color)] text-[var(--tg-theme-hint-color)]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>







            <div className="mt-2 text-center pb-8">
                <ProductList products={filteredProducts} onAdd={onAdd} wishlist={wishlist} onToggleWishlist={toggleWishlist} />

                {isFetching && (
                    <div className="py-4 text-[var(--tg-theme-button-color)] font-medium text-xs">
                        Loading more products...
                    </div>
                )}

                {!hasMore && products.length > 0 && (
                    <div className="py-8 text-gray-400 text-sm">
                        You've reached the end of the list
                    </div>
                )}
            </div>
        </div >
    );
};

export default Home;
