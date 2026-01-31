import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import { useNavigate } from 'react-router-dom';
import { smartSearch } from '../utils/smartSearch';
import { Search, X, ShieldCheck, Wallet, Gift } from 'lucide-react';
import useStore from '../store/useStore';
import BannerCarousel from '../components/BannerCarousel';
import DailyRewardModal from '../components/DailyRewardModal';
import GamificationProgressBar from '../components/GamificationProgressBar';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import SocialProofToast from '../components/SocialProofToast';

const PLACEHOLDERS = [
    "iphone 15 pro max",
    "summer dress",
    "gaming laptop",
    "smart watch",
    "bluetooth headphones",
    "sneakers",
    "home decor"
];

// Sub-category mapping
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

const Home = ({ products, hasMore, loadMore, isFetching }) => {
    const navigate = useNavigate();
    const walletBalance = useStore(state => state.walletBalance);
    const settings = useStore(state => state.settings);
    const banners = settings?.home_banners || [];

    const popularCategories = useMemo(() => {
        const counts = {};
        products.forEach(p => {
            if (p.category) {
                counts[p.category] = (counts[p.category] || 0) + 1;
            }
        });
        const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        return ["All", ...sorted.filter(c => c !== "All")];
    }, [products]);

    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    // Rotate placeholders
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(p => {
            const matchesDepartment = selectedDepartment === "All" || p.department === selectedDepartment;
            let matchesCategory = selectedCategory === "All";
            if (!matchesCategory) {
                if (selectedCategory === "Other") {
                    matchesCategory = p.category === "Other" || !p.category;
                } else {
                    matchesCategory = p.category === selectedCategory;
                }
            }
            return matchesDepartment && matchesCategory;
        });

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
            let foundDept = "All";
            for (const [dept, subCats] of Object.entries(SUBCATEGORIES)) {
                if (subCats.includes(category)) {
                    foundDept = dept;
                    break;
                }
            }
            setSelectedDepartment(foundDept);
            setSelectedCategory(category);
        }
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    // Infinite Scroll via Component now


    const nextRewardTarget = 500;
    const currentProgress = walletBalance || 0;

    return (
        <div className="bg-[#f5f5f5] min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white shadow-md">
                <div className="px-3 py-2 flex items-center gap-2">
                    {/* Wallet Balance (Left) */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-2 pr-3 py-1.5 active:scale-95 transition-transform"
                    >
                        <div className="w-5 h-5 rounded-full bg-[#fb7701] flex items-center justify-center">
                            <Wallet size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-[#fb7701]">
                            {Math.floor(walletBalance || 0)}
                        </span>
                    </button>

                    {/* Search Bar - Compact */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder={PLACEHOLDERS[placeholderIndex]}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f0f0f0] rounded-full py-2 pl-8 pr-7 text-xs focus:outline-none focus:ring-2 focus:ring-[#fb7701]/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-0.5 hover:bg-gray-300 transition-colors"
                            >
                                <X size={12} className="text-gray-500" />
                            </button>
                        )}
                    </div>

                    {/* Reward / Gift Icon (Right) */}
                    <button
                        className="relative p-2 active:scale-90 transition-transform animate-float"
                        // Logic to open daily reward modal needs to be wired if not automatic
                        onClick={() => document.dispatchEvent(new CustomEvent('open-daily-reward'))}
                    >
                        <Gift size={24} className="text-[#be0000]" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#fb7701] rounded-full border-2 border-white animate-pulse" />
                    </button>
                </div>

                {/* Categories Scroll */}
                <div className="flex overflow-x-auto no-scrollbar px-3 pb-2 gap-4 border-b border-gray-100">
                    {popularCategories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleTabChange(cat)}
                            className={`whitespace-nowrap pb-1.5 text-sm font-bold border-b-2 transition-all ${selectedCategory === cat ? 'border-[#fb7701] text-[#fb7701]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="pb-4">
                {/* Safety / Trust Banner */}
                <div className="bg-[#fff0e0] px-3 py-1.5 flex items-center justify-between text-[10px] text-[#fb7701]">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Free Returns</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Price Adjustment</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secure Payment</span>
                </div>

                {/* Banners */}
                <div className="mt-2">
                    <BannerCarousel banners={banners} />
                </div>

                {/* Gamification Progress */}
                <div className="mt-2 bg-white pt-2 pb-1">
                    <GamificationProgressBar
                        current={currentProgress}
                        target={nextRewardTarget}
                        label="Free Gift Progress"
                    />
                </div>

                <DailyRewardModal />
                <SocialProofToast products={products} />

                {/* Section Title */}
                <div className="px-3 pt-4 pb-2">
                    <h2 className="text-base font-bold text-[#191919] flex items-center gap-2">
                        Just For You
                    </h2>
                </div>

                {/* Product Grid */}
                <div className="min-h-[50vh]">
                    {filteredProducts.length > 0 ? (
                        <>
                            <ProductList products={filteredProducts} />
                            <InfiniteScrollTrigger
                                onIntersect={loadMore}
                                isLoading={isFetching}
                                hasMore={hasMore}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="mb-4">No products found</p>
                            <button
                                onClick={() => {
                                    handleTabChange("All");
                                    setSearchQuery("");
                                }}
                                className="bg-[#fb7701] text-white px-4 py-2 rounded-full text-sm font-bold"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {!hasMore && filteredProducts.length > 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs text-black">
                        You've reached the end!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
