import { useState, useMemo, useEffect, useRef } from 'react';
import ProductList from '../components/ProductList';




import { smartSearch } from '../utils/smartSearch';
import { throttle } from '../utils/throttle';
import { Search, X, ShoppingBag, Wallet } from 'lucide-react';
import useStore from '../store/useStore';
import BannerCarousel from '../components/BannerCarousel';


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
        const handleScroll = throttle(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                if (hasMore && !isFetching && loadMore) {
                    loadMore();
                }
            }
        }, 200); // Check every 200ms

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

    // Access wallet balance from store
    const walletBalance = useStore(state => state.walletBalance);

    // ... (inside component)


    // Access banners from store settings
    // Assuming 'settings.home_banners' is where we store it
    const settings = useStore(state => state.settings);
    const banners = settings?.home_banners || [];

    return (
        <div className="pb-4 min-h-dvh bg-gray-50">

            {/* Fixed Header */}
            <div className="sticky top-[var(--tg-content-safe-area-top)] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="px-4 py-3 pb-0">
                    {/* Top Bar: Brand & Wallet */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                                Addis Store
                            </h1>
                        </div>

                        {/* Wallet Badge */}
                        <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                            <Wallet size={14} className="text-primary" />
                            <span className="text-sm font-bold text-primary">{walletBalance || 0}</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 text-black placeholder-gray-400 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all border-none outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Categories Tabs */}
                <div
                    ref={tabsRef}
                    onScroll={handleTabsScroll}
                    className="flex overflow-x-auto no-scrollbar pb-0 px-2 gap-2 scroll-smooth"
                >
                    {loopedCategories.map((cat, index) => (
                        <button
                            key={`${cat}-${index}`}
                            onClick={() => handleTabChange(cat)}
                            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${selectedCategory === cat
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-black'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Scrollable Content */}
            <div className="space-y-3 pt-2">
                {/* Dynamic Banner Carousel */}
                <div className="px-2 mt-2">
                    <BannerCarousel banners={banners} />
                </div>

                {/* Pin Bot Tip Banner */}


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
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <ShoppingBag size={48} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try using different filters</p>
                            <button
                                onClick={() => {
                                    handleTabChange("All");
                                    setSearchQuery("");
                                }}
                                className="mt-4 text-primary"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading Indicator for Infinite Scroll */}
                {isFetching && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {!hasMore && filteredProducts.length > 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        You've reached the end!
                    </div>
                )}
            </div>

            {/* How to Buy Modal - REMOVED */}
        </div>
    );
};

export default Home;
