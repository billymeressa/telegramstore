import { useState, useMemo, useEffect, useRef } from 'react';
import ProductList from '../components/ProductList';
import HorizontalProductRow from '../components/HorizontalProductRow';
import CategoryColumnRow from '../components/CategoryColumnRow';
import { smartSearch } from '../utils/smartSearch';
import { Search, HelpCircle, X, ShoppingBag, Hand, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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
        setTimeout(() => setPracticeStep(0), 500);
    };

    const [practiceStep, setPracticeStep] = useState(0); // 0: Add, 1: Checkout, 2: Contact, 3: Done

    useEffect(() => {
        if (!showHelp) {
            setTimeout(() => setPracticeStep(0), 500);
        }
    }, [showHelp]);

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
                    <div
                        ref={tabsRef}
                        onScroll={handleTabsScroll}
                        className="flex gap-2 overflow-x-auto px-4 no-scrollbar items-center"
                    >
                        {loopedCategories.map((cat, index) => (
                            <button
                                key={`${cat}-${index}`}
                                onClick={() => handleTabChange(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${(selectedCategory === cat || (cat === "All" && selectedCategory === "All" && selectedDepartment === "All"))
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

                                <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)] mb-2 flex items-center gap-2">
                                    <HelpCircle className="text-[var(--tg-theme-button-color)]" size={24} />
                                    How to Buy
                                </h3>

                                <p className="text-sm text-[var(--tg-theme-hint-color)] mb-6">
                                    Shopping is easy! Just follow these 3 simple steps:
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                                        <div>
                                            <h4 className="font-bold text-[var(--tg-theme-text-color)] mb-1">Add to Cart</h4>
                                            <p className="text-sm text-[var(--tg-theme-hint-color)]">Browse items and tap "Add to Cart"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                                        <div>
                                            <h4 className="font-bold text-[var(--tg-theme-text-color)] mb-1">Checkout</h4>
                                            <p className="text-sm text-[var(--tg-theme-hint-color)]">Review your cart and place your order</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                                        <div>
                                            <h4 className="font-bold text-[var(--tg-theme-text-color)] mb-1">Contact Seller</h4>
                                            <p className="text-sm text-[var(--tg-theme-hint-color)]">Arrange payment & delivery via message</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[var(--tg-theme-button-color)]/10 to-transparent p-5 rounded-xl border-2 border-[var(--tg-theme-button-color)]/30 relative overflow-hidden shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-2xl"
                                                >
                                                    🎯
                                                </motion.div>
                                                <h4 className="font-bold text-[var(--tg-theme-text-color)] text-lg">
                                                    Try it Now!
                                                </h4>
                                            </div>
                                            <p className="text-sm text-[var(--tg-theme-hint-color)]">
                                                {practiceStep === 0 && "👇 Tap the button below to practice"}
                                                {practiceStep === 1 && "✨ Great! Now try checkout"}
                                                {practiceStep === 2 && "🎉 Almost there! Contact the seller"}
                                                {practiceStep === 3 && "🎊 Perfect! You're ready to shop"}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2, 3].map(step => (
                                                <motion.div
                                                    key={step}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: step <= practiceStep ? 1 : 0.7 }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-colors ${step <= practiceStep ? 'bg-[var(--tg-theme-button-color)] shadow-md' : 'bg-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Step 0: Add to Cart */}
                                    {practiceStep === 0 && (
                                        <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-3 shadow-sm border border-[var(--tg-theme-section-separator-color)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-xl">👟</div>
                                                <div>
                                                    <div className="text-sm font-bold text-[var(--tg-theme-text-color)]">Cool Sneakers</div>
                                                    <div className="text-xs text-[var(--tg-theme-hint-color)]">1,200 Birr</div>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setPracticeStep(1)}
                                                    className="px-4 py-2 rounded-lg font-bold text-sm bg-[var(--tg-theme-button-color)] text-white shadow-lg shadow-blue-500/30 whitespace-nowrap"
                                                >
                                                    Add to Cart
                                                </motion.button>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, x: 10 }}
                                                    animate={{ opacity: 1, y: [0, -5, 0], x: [0, -5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="absolute top-8 left-6 pointer-events-none drop-shadow-md z-10"
                                                >
                                                    <Hand size={32} className="text-black rotate-[-30deg] fill-white/80" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 1: Checkout */}
                                    {practiceStep === 1 && (
                                        <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-3 shadow-sm border border-[var(--tg-theme-section-separator-color)] animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-sm font-bold">My Cart</span>
                                                <span className="text-xs text-[var(--tg-theme-hint-color)]">1 Item</span>
                                            </div>
                                            <div className="relative">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setPracticeStep(2)}
                                                    className="w-full py-2 rounded-lg font-bold text-sm bg-[var(--tg-theme-button-color)] text-white shadow-md flex items-center justify-center gap-2"
                                                >
                                                    Checkout
                                                </motion.button>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, x: 10 }}
                                                    animate={{ opacity: 1, y: [0, -5, 0], x: [0, -5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="absolute top-6 left-1/2 pointer-events-none drop-shadow-md z-10"
                                                >
                                                    <Hand size={32} className="text-black rotate-[-30deg] fill-white/80" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Contact Options */}
                                    {practiceStep === 2 && (
                                        <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-3 shadow-sm border border-[var(--tg-theme-section-separator-color)] animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="text-center mb-3">
                                                <div className="text-sm font-bold text-[var(--tg-theme-text-color)]">Order Placed!</div>
                                                <div className="text-xs text-[var(--tg-theme-hint-color)]">Now contact the seller.</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 relative">
                                                <button className="py-2 rounded-lg font-bold text-xs bg-gray-100 text-[var(--tg-theme-button-color)] border border-[var(--tg-theme-button-color)]">
                                                    Call
                                                </button>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setPracticeStep(3)}
                                                    className="py-2 rounded-lg font-bold text-xs bg-[#0088cc] text-white"
                                                >
                                                    Message
                                                </motion.button>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, x: 10 }}
                                                    animate={{ opacity: 1, y: [0, -5, 0], x: [0, -5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="absolute top-6 right-8 pointer-events-none drop-shadow-md z-10"
                                                >
                                                    <Hand size={32} className="text-black rotate-[-30deg] fill-white/80" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Success */}
                                    {practiceStep === 3 && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-center py-2"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
                                            >
                                                <Check size={32} className="text-white" strokeWidth={3} />
                                            </motion.div>
                                            <h4 className="font-bold text-[var(--tg-theme-text-color)] text-lg">🎉 You're a Pro!</h4>
                                            <p className="text-sm text-[var(--tg-theme-hint-color)] mb-4">
                                                Shopping is that easy - no payment here, just contact us to complete your order!
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCloseHelp}
                                                className="inline-block px-8 py-3 bg-gradient-to-r from-[var(--tg-theme-button-color)] to-blue-600 text-white rounded-full font-bold text-sm shadow-lg active:shadow-md transition-all"
                                            >
                                                Start Shopping Now!
                                            </motion.button>
                                        </motion.div>
                                    )}
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
