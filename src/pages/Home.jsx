import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import HorizontalProductRow from '../components/HorizontalProductRow';
import CategoryColumnRow from '../components/CategoryColumnRow';
import { smartSearch } from '../utils/smartSearch';
import { Search } from 'lucide-react';

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {

    const DEPARTMENTS = ["All", "Electronics", "Men", "Women", "Kids", "Home", "Beauty", "Sports", "Books", "Vehicles"];

    // Sub-category mapping (simplified version of what's in AdminDashboard)
    // In a real app, this might come from the backend or a shared constant file
    const SUBCATEGORIES = {
        'Men': ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Shoes', 'Suits', 'Accessories', 'Activewear', 'Other'],
        'Women': ['Dresses', 'Tops', 'Skirts', 'Pants', 'Jeans', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'Other'],
        'Kids': ['Boys Clothing', 'Girls Clothing', 'Baby', 'Shoes', 'Toys', 'School', 'Other'],
        'Electronics': ['Phones', 'Laptops', 'Audio', 'Storage', 'Computer Accessories', 'Gaming', 'Networking', 'Smart Home', 'Other'],
        'Home': ['Decor', 'Kitchen', 'Bedding', 'Furniture', 'Lighting', 'Tools', 'Other'],
        'Beauty': ['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Personal Care', 'Other'],
        'Sports': ['Gym Equipment', 'Team Sports', 'Outdoor', 'Running', 'Nutrition', 'Other'],
        'Books': ['Fiction', 'Non-Fiction', 'Educational', 'Self-Help', 'Children', 'Other'],
        'Vehicles': ['Cars', 'Motorcycles', 'Bicycles', 'Parts & Accessories', 'Tires & Wheels', 'Car Electronics', 'Tools & Equipment', 'Other']
    };

    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Dynamic Sub-categories based on actual products in the store
    const availableCategories = useMemo(() => {
        let relevantProducts = products;

        if (selectedDepartment !== "All") {
            relevantProducts = products.filter(p => p.department === selectedDepartment);
        }

        const cats = relevantProducts.map(p => p.category).filter(Boolean);
        // unique categories
        const uniqueCats = [...new Set(cats)].sort();

        return ["All", ...uniqueCats];
    }, [selectedDepartment, products]);

    // Helper to get random products for demo rows
    const trendingProducts = useMemo(() => products.slice(0, 5), [products]);
    const newArrivals = useMemo(() => products.slice(5, 12), [products]);

    const filteredProducts = useMemo(() => {
        // First, filter by department and category
        let filtered = products.filter(p => {
            const matchesDepartment = selectedDepartment === "All" || p.department === selectedDepartment;
            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            return matchesDepartment && matchesCategory;
        });

        // Then apply smart search if there's a query
        if (searchQuery && searchQuery.trim() !== '') {
            filtered = smartSearch(filtered, searchQuery);
        }

        return filtered;
    }, [products, selectedDepartment, selectedCategory, searchQuery]);

    const handleDepartmentChange = (dept) => {
        setSelectedDepartment(dept);
        setSelectedCategory("All"); // Reset sub-category when department changes
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
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
                {/* Horizontal Scroll Rows (Only show on Home / No Search) */}
                {!searchQuery && selectedDepartment === "All" && selectedCategory === "All" && (
                    <div className="flex flex-col gap-2 mb-2">
                        {/* Show dynamic sub-categories visually */}
                        <CategoryColumnRow categories={availableCategories} onSelect={handleCategoryChange} />

                        <HorizontalProductRow title="New Arrivals" products={newArrivals} />
                    </div>
                )}

                {/* Sticky Navigation for Filters */}
                <div className="sticky top-[56px] z-40 bg-[var(--tg-theme-bg-color)] border-b border-[var(--tg-theme-section-separator-color)] shadow-sm">
                    {/* Level 1: Departments */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center px-4 py-2">
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`whitespace-nowrap text-sm px-3 py-1 rounded-md transition-all font-bold ${selectedCategory === cat
                                    ? 'text-[var(--tg-theme-button-color)] bg-[var(--tg-theme-secondary-bg-color)]'
                                    : 'text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Section */}
                <div className="px-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-lg font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                            {searchQuery ? 'Search Results' : (selectedCategory !== 'All' ? selectedCategory : 'Featured Products')}
                            {!searchQuery && <span className="text-xs font-normal text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-section-separator-color)] px-2 py-0.5 rounded-full">{filteredProducts.length} items</span>}
                        </h3>

                        {/* Clear Filter Button if a sub-category is selected */}
                        {selectedCategory !== 'All' && (
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center"
                            >
                                Clear Filter ✕
                            </button>
                        )}
                    </div>

                    <div data-product-grid>
                        <ProductList products={filteredProducts} />
                    </div>

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
