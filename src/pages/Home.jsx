import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import { useNavigate } from 'react-router-dom';
import { smartSearch } from '../utils/smartSearch';
import { Search, X, ShieldCheck } from 'lucide-react';
import useStore from '../store/useStore';
import BannerCarousel from '../components/BannerCarousel';
import DailyRewardModal from '../components/DailyRewardModal';
import GamificationProgressBar from '../components/GamificationProgressBar';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';

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
    };

    // Infinite Scroll via Component now


    const nextRewardTarget = 500;
    const currentProgress = walletBalance || 0;

    return (
        <div className="bg-[#f5f5f5] min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white shadow-md">
                <div className="px-3 py-2 flex items-center gap-3">
                    {/* Search Bar - Temu Style */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="iphone 15 pro max"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#f0f0f0] rounded-full py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#fb7701]/20 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-0.5 hover:bg-gray-300 transition-colors"
                            >
                                <X size={14} className="text-gray-500" />
                            </button>
                        )}
                    </div>
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
