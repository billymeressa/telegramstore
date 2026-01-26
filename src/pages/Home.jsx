import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import HorizontalProductRow from '../components/HorizontalProductRow';
import CategoryColumnRow from '../components/CategoryColumnRow';
import { smartSearch } from '../utils/smartSearch';
import { Search, HelpCircle, X, ShoppingBag } from 'lucide-react';

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {
    const [showHelp, setShowHelp] = useState(false);

    const POPULAR_CATEGORIES = ["All", "Phones", "Shoes", "Watches", "Laptops", "Dresses", "Gaming", "Bags", "T-Shirts", "Jeans"];

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

    // Featured Subcategories for Home Page Visual Navigation
    const FEATURED_SUBCATEGORIES = [
        'Phones', 'Shoes', 'Watches', 'Laptops', 'Dresses', 'Gaming', 'Bags', 'Audio'
    ];

    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Dynamic Sub-categories based on actual products in the store
    const availableCategories = useMemo(() => {
        let relevantProducts = products;

        if (selectedDepartment !== "All") {
            relevantProducts = products.filter(p => p.department === selectedDepartment);
        }

        const cats = relevantProducts.map(p => p.category || "Other");
        // unique categories
        const uniqueCats = [...new Set(cats)].sort();

        // Ensure "Other" is at the end if it exists
        if (uniqueCats.includes("Other")) {
            return ["All", ...uniqueCats.filter(c => c !== "Other"), "Other"];
        }

        return ["All", ...uniqueCats];
    }, [selectedDepartment, products]);

    // Helper to get random products for demo rows
    const trendingProducts = useMemo(() => products.slice(0, 5), [products]);
    const newArrivals = useMemo(() => products.slice(5, 12), [products]);

    const filteredProducts = useMemo(() => {
        // First, filter by department and category
        let filtered = products.filter(p => {
            const matchesDepartment = selectedDepartment === "All" || p.department === selectedDepartment;

            let matchesCategory = selectedCategory === "All";
            if (!matchesCategory) {
                if (selectedCategory === "Other") {
                    // Match "Other" OR empty/null/undefined
                    matchesCategory = p.category === "Other" || !p.category;
                } else {
                    matchesCategory = p.category === selectedCategory;
                }
            }

            return matchesDepartment && matchesCategory;
        });

        // Then apply smart search if there's a query
        if (searchQuery && searchQuery.trim() !== '') {
            filtered = smartSearch(filtered, searchQuery);
        }

        return filtered;
    }, [products, selectedDepartment, selectedCategory, searchQuery]);

    const handleTabChange = (category) => {
        if (category === "All") {
            setSelectedDepartment("All");
            setSelectedCategory("All");
        } else {
            // Find which department this category belongs to (optional, but good for data consistency)
            let foundDept = "All";
            for (const [dept, subCats] of Object.entries(SUBCATEGORIES)) {
                if (subCats.includes(category)) {
                    foundDept = dept;
                    break;
                }
            }
            setSelectedDepartment(foundDept); // Or keep "All" if you want broader search, but finding dept is safer
            setSelectedCategory(category);
        }
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
    };

    // Handle clicking on a Visual Subcategory Icon
    const handleVisualCategorySelect = (subCat) => {
        // Find which department this subcategory belongs to
        let foundDept = "All";
        for (const [dept, subCats] of Object.entries(SUBCATEGORIES)) {
            if (subCats.includes(subCat)) {
                foundDept = dept;
                break;
            }
        }

        setSelectedDepartment(foundDept);
        setSelectedCategory(subCat);

        // Scroll to product grid
        const grid = document.querySelector('[data-product-grid]');
        if (grid) {
            setTimeout(() => {
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
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

    // Check for onboarding status
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            // Short delay to ensure animations are smooth
            setTimeout(() => setShowHelp(true), 500);
        }
    }, []);

    const handleCloseHelp = () => {
        setShowHelp(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
    };

    return (
        <div className="pb-4 pt-14 min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
            {/* Fixed Header (Search Only) */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--tg-theme-bg-color)] pt-2 pb-2 px-3 border-b border-[var(--tg-theme-section-separator-color)] flex gap-2 items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] pl-9 pr-4 py-2 rounded-xl border-none outline-none placeholder:text-[var(--tg-theme-hint-color)] text-base font-normal caret-[var(--tg-theme-button-color)]"
                    />
                    <Search className="absolute left-3 top-2.5 text-[var(--tg-theme-hint-color)]" size={18} />
                </div>
                <button
                    onClick={() => setShowHelp(true)}
                    className="p-2 text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]"
                >
                    <HelpCircle size={24} />
                </button>
            </div>

            {/* Main Scrollable Content */}
            <div className="space-y-2">
                {/* Category Tabs (formerly Departments) */}
                <div className="bg-[var(--tg-theme-bg-color)] py-2 sticky top-14 z-40 border-b border-[var(--tg-theme-section-separator-color)] shadow-sm">
                    <div className="flex gap-2 overflow-x-auto px-4 no-scrollbar">
                        {POPULAR_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleTabChange(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${(selectedCategory === cat || (cat === "All" && selectedCategory === "All" && selectedDepartment === "All"))
                                    ? 'bg-[var(--tg-theme-button-color)] text-white shadow-md'
                                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visual Category Columns (Only on "All" or if mapped) */}
                {/* Only show if we have products to categorize, and for top level exploration */}
                {selectedDepartment === 'All' && !searchQuery && (
                    <CategoryColumnRow
                        categories={FEATURED_SUBCATEGORIES}
                        onSelect={handleVisualCategorySelect}
                    />
                )}

                {/* Sub-Category Pills (If Department Selected or Smart Categories Available) */}
                {(selectedDepartment !== 'All' || availableCategories.length > 0) && (
                    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar bg-[var(--tg-theme-bg-color)] border-b border-[var(--tg-theme-section-separator-color)]">
                        {availableCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedCategory === cat
                                    ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)] text-white'
                                    : 'border-[var(--tg-theme-hint-color)] text-[var(--tg-theme-hint-color)]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}


                {/* Brand/Featured Rows (Only on "All" tab & no search) */}
                {selectedDepartment === 'All' && !searchQuery && (
                    <>
                        <HorizontalProductRow title="Trending Now" products={trendingProducts} />
                        <HorizontalProductRow title="New Arrivals" products={newArrivals} />
                    </>
                )}


                {/* Main Product Grid */}
                <div data-product-grid className="min-h-[50vh]"> {/* For scroll target */}
                    {filteredProducts.length > 0 ? (
                        <ProductList products={filteredProducts} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-[var(--tg-theme-hint-color)]">
                            <ShoppingBag size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try using different filters</p>
                            <button
                                onClick={() => {
                                    handleTabChange("All");
                                    setSearchQuery("");
                                }}
                                className="mt-4 text-[var(--tg-theme-link-color)]"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading Indicator for Infinite Scroll */}
                {isFetching && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tg-theme-button-color)]"></div>
                    </div>
                )}

                {!hasMore && filteredProducts.length > 0 && (
                    <div className="text-center py-8 text-[var(--tg-theme-hint-color)] text-sm">
                        You've reached the end!
                    </div>
                )}
            </div>

            {/* How to Buy Modal */}
            {
                showHelp && (
                    <div className="fixed inset-0 bg-black/60 z-[100] overflow-y-auto animate-in fade-in duration-200">
                        <div className="min-h-full flex items-center justify-center p-4">
                            <div className="bg-[var(--tg-theme-bg-color)] w-full max-w-sm rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
                                <button
                                    onClick={handleCloseHelp}
                                    className="absolute top-4 right-4 text-[var(--tg-theme-hint-color)]"
                                >
                                    <X size={24} />
                                </button>

                                <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)] mb-4 flex items-center gap-2">
                                    <HelpCircle className="text-[var(--tg-theme-button-color)]" size={24} />
                                    How to Buy
                                </h3>

                                <div className="space-y-8">
                                    <div className="flex flex-col gap-3">
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold">1</div>
                                            Add to Cart
                                        </h4>
                                        <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl overflow-hidden shadow-sm border border-[var(--tg-theme-section-separator-color)]">
                                            <img src="/guides/add_to_cart.png" alt="Add to Cart Guide" className="w-full h-auto object-cover" />
                                        </div>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)]">Browse items and tap "Add to Cart" for things you love.</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold">2</div>
                                            Checkout
                                        </h4>
                                        <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl overflow-hidden shadow-sm border border-[var(--tg-theme-section-separator-color)]">
                                            <img src="/guides/checkout.png" alt="Checkout Guide" className="w-full h-auto object-cover" />
                                        </div>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)]">Go to your cart and tap "Checkout" to place your order.</p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)] flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold">3</div>
                                            Contact Seller
                                        </h4>
                                        <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-xl overflow-hidden shadow-sm border border-[var(--tg-theme-section-separator-color)]">
                                            <img src="/guides/contact.png" alt="Contact Guide" className="w-full h-auto object-cover" />
                                        </div>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)]">
                                            Arranging payment & delivery is easy! Contact us directly to finish the sale.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCloseHelp}
                                    className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-bold py-3 rounded-xl mt-6 shadow active:opacity-80"
                                >
                                    Got it!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Home;
