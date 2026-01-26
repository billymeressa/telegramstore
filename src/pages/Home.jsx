import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import HorizontalProductRow from '../components/HorizontalProductRow';
import CategoryColumnRow from '../components/CategoryColumnRow';
import { smartSearch } from '../utils/smartSearch';
import { Search, HelpCircle, X, ShoppingBag } from 'lucide-react';

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {
    const [showHelp, setShowHelp] = useState(false);

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
        // Check for onboarding status
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            // Short delay to ensure animations are smooth
            setTimeout(() => setShowHelp(true), 500);
        }
    }, [hasMore, isFetching, loadMore]);

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
            {/* ... content ... */}

            {/* How to Buy Modal */}
            {
                showHelp && (
                    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
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

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center flex-shrink-0 text-[var(--tg-theme-button-color)] font-bold text-lg">1</div>
                                    <div>
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)]">Add to Cart</h4>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)] leading-tight">Browse items and tap "Add to Cart" for things you love.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center flex-shrink-0 text-[var(--tg-theme-button-color)] font-bold text-lg">2</div>
                                    <div>
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)]">Checkout</h4>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)] leading-tight">Go to your cart and tap "Checkout" to place your order.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center flex-shrink-0 text-[var(--tg-theme-button-color)] font-bold text-lg">3</div>
                                    <div>
                                        <h4 className="font-bold text-[var(--tg-theme-text-color)]">Contact Seller</h4>
                                        <p className="text-sm text-[var(--tg-theme-hint-color)] leading-tight">
                                            Arranging payment & delivery is easy! Contact us directly to finish the sale.
                                        </p>
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
                )
            }
        </div >
    );
};

export default Home;
