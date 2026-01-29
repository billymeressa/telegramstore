import { useState, useMemo, useEffect, useRef } from 'react';
import ProductList from '../components/ProductList';




import { smartSearch } from '../utils/smartSearch';
import { Search, X, ShoppingBag } from 'lucide-react';


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





const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {

    // Dynamic Popular Categories based on product count
    const popularCategories = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            if (p.category) {
                counts[p.category] = (counts[p.category] || 0) + 1;
            }
        });

        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        // Filter out "All" if it appears in counts to avoid duplicate, though usually unique.
        // Always 'All' first.
        return ["All", ...sorted.filter(c => c !== "All")];
    }, [products]);

    // Infinite Scroll Logic for Tabs
    const tabsRef = useRef(null);
    // Create 3 sets for seamless looping
    const loopedCategories = useMemo(() => {
        if (popularCategories.length === 0) return [];
        return [...popularCategories, ...popularCategories, ...popularCategories];
    }, [popularCategories]);

    // Handle Tab Scroll Loop
    const handleTabsScroll = (e) => {
        const container = e.target;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;

        const singleSetWidth = scrollWidth / 3;

        // If we scroll too far left (into first set), jump to middle set
        if (scrollLeft < singleSetWidth * 0.5) {
            container.scrollLeft += singleSetWidth;
        }
        // If we scroll too far right (into third set), jump to middle set
        else if (scrollLeft + clientWidth > singleSetWidth * 2.5) {
            container.scrollLeft -= singleSetWidth;
        }
    };

    // Initialize Scroll Position to Middle Set
    useEffect(() => {
        if (tabsRef.current && popularCategories.length > 0) {
            const container = tabsRef.current;
            const singleSetWidth = container.scrollWidth / 3;
            container.scrollLeft = singleSetWidth; // Jump to start of middle set
        }
    }, [popularCategories]);

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





    // ... existing infinite scroll effect remains ...

    // Pin Tip Logic
    const [showPinTip, setShowPinTip] = useState(false);

    useEffect(() => {
        const hasSeenPinTip = localStorage.getItem('hasSeenPinTip');
        if (!hasSeenPinTip) {
            // Show after a slight delay to not overwhelm immediately
            setTimeout(() => setShowPinTip(true), 2000);
        }
    }, []);

    const handleClosePinTip = () => {
        setShowPinTip(false);
        localStorage.setItem('hasSeenPinTip', 'true');
    };

    return (
        <div className="pb-4 pt-[calc(var(--tg-content-safe-area-top)+44px)] min-h-dvh bg-[var(--tg-theme-secondary-bg-color)]">

            {/* Scroll-Aware Fixed Header Group */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-[var(--tg-theme-bg-color)]/80 backdrop-blur-md shadow-sm pt-[var(--tg-safe-area-top)]"
            >
                {/* Search Bar Row - Vertically centered with native buttons */}
                <div className="px-[110px] flex gap-2 items-center h-[var(--tg-header-buttons-height)] min-h-[44px] w-full box-border">
                    <div className="relative flex-1 flex items-center">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--tg-theme-secondary-bg-color)]/60 text-[var(--tg-theme-text-color)] pl-9 pr-4 h-9 rounded-lg border-none outline-none placeholder:text-[var(--tg-theme-hint-color)] text-sm font-normal caret-[var(--tg-theme-button-color)] leading-normal transition-all focus:bg-[var(--tg-theme-secondary-bg-color)]"
                        />
                        <Search className="absolute left-3 text-[var(--tg-theme-hint-color)] pointer-events-none" size={16} />
                    </div>

                </div>

                {/* Category Tabs */}
                <div className="py-1.5 border-b border-[var(--tg-theme-section-separator-color)]">
                    <div
                        ref={tabsRef}
                        onScroll={handleTabsScroll}
                        className="flex gap-2 overflow-x-auto px-4 no-scrollbar items-center"
                    >
                        {loopedCategories.map((cat, index) => (
                            <button
                                key={`${cat}-${index}`}
                                onClick={() => handleTabChange(cat)}
                                className={`px-3.5 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${(selectedCategory === cat || (cat === "All" && selectedCategory === "All" && selectedDepartment === "All"))
                                    ? 'bg-[var(--tg-theme-button-color)] text-white shadow-md'
                                    : 'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="space-y-2">


                {/* Pin Bot Tip Banner */}
                {showPinTip && (
                    <div className="mx-4 mb-2 p-3 bg-blue-50 border border-blue-100 rounded-xl relative flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2 duration-300">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 shrink-0">
                            <span className="text-lg">📌</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-blue-900 leading-tight mb-0.5">Don't lose us!</h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Pin this bot to the top of your chat list for quick access later.
                            </p>
                            <p className="text-[10px] text-blue-500 mt-1 font-medium">
                                (Long press chat &gt; Pin)
                            </p>
                        </div>
                        <button
                            onClick={handleClosePinTip}
                            className="text-blue-400 hover:text-blue-600 p-1 -mt-1 -mr-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
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

            {/* How to Buy Modal - REMOVED */}
        </div>
    );
};

export default Home;
