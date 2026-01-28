import { useState, useMemo, useEffect, useRef } from 'react';
import ProductList from '../components/ProductList';




import { smartSearch } from '../utils/smartSearch';
import { Search, HelpCircle, X, ShoppingBag, Hand, Check, Zap } from 'lucide-react';


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



const TouchHint = ({ text, className = "" }) => (
    <div className={`absolute z-30 pointer-events-none flex flex-col items-center gap-2 ${className}`}>
        {/* Tooltip */}
        <div
            className="bg-black/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap ring-1 ring-white/10"
        >
            {text}
        </div>

        {/* Hand & Ripple */}
        <div className="relative">
            <div
                className="absolute inset-0 bg-[var(--tg-theme-button-color)] rounded-full opacity-50 animate-ping"
            />
            <div
                className="relative z-10 bg-white p-1.5 rounded-full shadow-lg border border-gray-100"
            >
                <Hand size={18} className="text-gray-900 rotate-[-15deg]" fill="currentColor" fillOpacity={0.1} />
            </div>
        </div>
    </div>
);

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {
    const [showHelp, setShowHelp] = useState(false);

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

    // Categories to demote (push to bottom)
    const GENERIC_CATEGORIES = ['Parts & Accessories', 'Tools', 'Tools & Equipment', 'Other', 'Computer Accessories', 'Cables', 'Adapters'];

    // Smart Sort Algorithm: Shuffles high-quality items, pushes generics to bottom
    const smartSort = (items) => {
        if (!items || items.length === 0) return [];

        // Separete premium and generic
        const premium = items.filter(p => !GENERIC_CATEGORIES.includes(p.category || 'Other'));
        const generic = items.filter(p => GENERIC_CATEGORIES.includes(p.category || 'Other'));

        // Fisher-Yates Shuffle for premium items (Freshness)
        // We use a seed based on hour to keep it stable for a short session, or just random for true freshness on reload
        const shuffledPremium = [...premium];
        for (let i = shuffledPremium.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPremium[i], shuffledPremium[j]] = [shuffledPremium[j], shuffledPremium[i]];
        }

        return [...shuffledPremium, ...generic];
    };





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
        } else if (selectedDepartment === 'All' && selectedCategory === 'All') {
            // Apply Smart Sort only on the main "All" view for discovery
            filtered = smartSort(filtered);
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
        setTimeout(() => setPracticeStep(0), 500);
    };

    const [practiceStep, setPracticeStep] = useState(0); // 0: Add, 1: Checkout, 2: Contact, 3: Done

    useEffect(() => {
        if (!showHelp) {
            setTimeout(() => setPracticeStep(0), 500);
        }
    }, [showHelp]);



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
        <div className="pb-4 pt-28 min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">

            {/* Scroll-Aware Fixed Header Group */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-[var(--tg-theme-bg-color)] shadow-sm"
            >
                {/* Search Bar */}
                <div className="pt-2 pb-2 px-3 border-b border-[var(--tg-theme-section-separator-color)] flex gap-2 items-center">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] pl-9 pr-4 py-1.5 rounded-lg border-none outline-none placeholder:text-[var(--tg-theme-hint-color)] text-sm font-normal caret-[var(--tg-theme-button-color)]"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tg-theme-hint-color)]" size={16} />
                    </div>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="p-2 text-[var(--tg-theme-hint-color)] hover:text-[var(--tg-theme-text-color)]"
                    >
                        <HelpCircle size={24} />
                    </button>
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

                                <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)] mb-2 flex items-center gap-2">
                                    <HelpCircle className="text-[var(--tg-theme-button-color)]" size={24} />
                                    How to Buy
                                </h3>

                                <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4 text-center">
                                    Try the interactive demo below! 👇
                                </p>

                                <div className="mx-auto w-[300px] h-[600px] bg-gray-900 rounded-[3.5rem] p-1.5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-[6px] border-gray-800 relative overflow-hidden ring-1 ring-white/20">
                                    {/* Dynamic Island */}
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-20 flex items-center justify-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-900/30"></div>
                                    </div>

                                    {/* Screen Content */}
                                    <div className="bg-white w-full h-full rounded-[3rem] overflow-hidden relative font-sans flex flex-col border-[3px] border-black">

                                        {/* Status Bar */}
                                        <div className="h-12 text-[12px] flex justify-between items-center px-6 pt-2 font-medium text-black z-10 select-none">
                                            <span>9:41</span>
                                            <div className="flex gap-1.5 items-center">
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <div className="w-1 h-1 bg-black rounded-sm"></div>
                                                    <div className="w-1 h-2 bg-black rounded-sm"></div>
                                                    <div className="w-1 h-3 bg-black rounded-sm"></div>
                                                </div>
                                                <div className="w-5 h-2.5 border-[1px] border-black/30 rounded-[3px] relative">
                                                    <div className="absolute inset-0.5 bg-black rounded-[1px]"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interactive Area */}
                                        <div className="flex-1 relative overflow-hidden">
                                            {/* SCREEN 1: PRODUCT LISTING */}
                                            {practiceStep === 0 && (
                                                <div
                                                    key="step0"
                                                    className="absolute inset-0 flex flex-col pt-2"
                                                >
                                                    {/* Fake App Header */}
                                                    <div className="px-4 pb-3 border-b border-gray-100 flex justify-between items-center">
                                                        <div className="font-bold text-lg text-black">Store</div>
                                                        <Search size={18} className="text-gray-400" />
                                                    </div>

                                                    {/* Fake Product */}
                                                    <div className="p-4">
                                                        <div className="bg-gray-100 rounded-2xl h-48 mb-3 flex items-center justify-center text-4xl shadow-inner relative">
                                                            👟
                                                            <div
                                                                className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md animate-bounce"
                                                            >
                                                                <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-lg leading-tight">Cool Kicks</h3>
                                                                <p className="text-gray-500 text-xs">Premium Comfort</p>
                                                            </div>
                                                            <span className="font-bold text-[var(--tg-theme-button-color)]">1,200 Br</span>
                                                        </div>
                                                    </div>

                                                    {/* Add Button */}
                                                    <div className="mt-auto px-4 pb-6 pt-2 relative">
                                                        <TouchHint text="Tap to Add" className="-top-12 left-1/2 -translate-x-1/2" />
                                                        <button
                                                            onClick={() => setPracticeStep(1)}
                                                            className="w-full bg-[var(--tg-theme-button-color)] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SCREEN 2: CART / CHECKOUT */}
                                            {practiceStep === 1 && (
                                                <div
                                                    key="step1"
                                                    className="absolute inset-0 flex flex-col bg-gray-50"
                                                >
                                                    <div className="px-4 py-3 bg-white shadow-sm flex items-center gap-3 z-10">
                                                        <div className="text-lg font-bold text-black">My Cart</div>
                                                    </div>

                                                    <div className="p-4 space-y-3">
                                                        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">👟</div>
                                                            <div className="flex-1">
                                                                <div className="font-bold text-gray-900 text-sm">Cool Kicks</div>
                                                                <div className="text-gray-500 text-xs">x1</div>
                                                            </div>
                                                            <div className="font-bold text-gray-900 text-sm">1,200</div>
                                                        </div>

                                                        <div className="p-3 border-t border-gray-200 mt-4 space-y-1">
                                                            <div className="flex justify-between text-sm text-gray-500">
                                                                <span>Subtotal</span>
                                                                <span>1,200 Br</span>
                                                            </div>
                                                            <div className="flex justify-between text-base font-bold text-gray-900">
                                                                <span>Total</span>
                                                                <span>1,200 Br</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto px-4 pb-6 relative">
                                                        <TouchHint text="Tap Checkout" className="-top-12 left-1/2 -translate-x-1/2" />
                                                        <button
                                                            onClick={() => setPracticeStep(2)}
                                                            className="w-full bg-[var(--tg-theme-button-color)] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-between px-6"
                                                        >
                                                            <span>Checkout</span>
                                                            <span>➔</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SCREEN 3: CONTACT / SUCCESS */}
                                            {practiceStep === 2 && (
                                                <div
                                                    key="step2"
                                                    className="absolute inset-0 flex flex-col bg-white items-center justify-center p-6 text-center"
                                                >
                                                    <div
                                                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4"
                                                    >
                                                        <Check size={40} strokeWidth={4} />
                                                    </div>

                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                                                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                                        Complete your purchase by contacting us directly.
                                                    </p>

                                                    <div className="w-full space-y-3 relative">
                                                        <TouchHint text="Tap Message" className="-top-12 left-1/2 -translate-x-1/2" />
                                                        <button
                                                            onClick={() => setPracticeStep(3)}
                                                            className="w-full bg-[#0088cc] text-white py-3 rounded-xl font-bold shadow-md active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.06-.14-.09-.21-.09-.09 0-1.51.96-4.27 2.82-.4.27-.76.4-1.08.39-.35-.01-1.03-.2-1.54-.35-.62-.18-1.12-.28-1.07-.59.02-.16.24-.32.65-.48 2.56-1.11 4.26-1.84 5.12-2.2 2.44-1.02 2.94-1.2 3.27-1.2.07 0 .23.01.33.09.09.07.12.17.13.24 0 .04.01.1 0 .16z" /></svg>
                                                            Message Seller
                                                        </button>
                                                        <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold active:scale-95">
                                                            Call Now
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* SCREEN 4: DONE */}
                                            {practiceStep === 3 && (
                                                <div
                                                    key="step3"
                                                    className="absolute inset-0 flex flex-col bg-gradient-to-br from-[var(--tg-theme-button-color)] to-blue-600 items-center justify-center p-6 text-center text-white"
                                                >
                                                    <div className="text-6xl mb-4 animate-pulse">🎉</div>
                                                    <h3 className="text-2xl font-bold mb-2">You're Ready!</h3>
                                                    <p className="text-white/90 text-sm mb-8 leading-relaxed">
                                                        That's exactly how easy it is to shop with us. No payments required in the bot.
                                                    </p>
                                                    <button
                                                        onClick={handleCloseHelp}
                                                        className="bg-white text-[var(--tg-theme-button-color)] px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
                                                    >
                                                        Start Shopping
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Home Indicator */}
                                        <div className="h-4 flex justify-center items-start pt-1">
                                            <div className="w-32 h-1 bg-black/20 rounded-full"></div>
                                        </div>
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
        </div>
    );
};

export default Home;
