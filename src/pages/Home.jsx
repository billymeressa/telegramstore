import { useState, useMemo, useEffect } from 'react';
import ProductList from '../components/ProductList';
import { useNavigate } from 'react-router-dom';
import { smartSearch } from '../utils/smartSearch';
import { throttle } from '../utils/throttle';
import { Search, X, ShoppingBag, Wallet } from 'lucide-react';
import useStore from '../store/useStore';
import BannerCarousel from '../components/BannerCarousel';
import DailyRewardModal from '../components/DailyRewardModal';
import GamificationProgressBar from '../components/GamificationProgressBar';

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

const Home = ({ products, onAdd, wishlist, toggleWishlist, hasMore, loadMore, isFetching }) => {
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

    // Infinite Scroll Listener
    useEffect(() => {
        const handleScroll = throttle(() => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                if (hasMore && !isFetching && loadMore) {
                    loadMore();
                }
            }
        }, 200);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isFetching, loadMore]);

    // Pin Tip Logic
    const [showPinTip, setShowPinTip] = useState(false);
    useEffect(() => {
        const hasSeenPinTip = localStorage.getItem('hasSeenPinTip');
        if (!hasSeenPinTip) {
            setTimeout(() => setShowPinTip(true), 2000);
        }
    }, []);

    const handleClosePinTip = () => {
        setShowPinTip(false);
        localStorage.setItem('hasSeenPinTip', 'true');
    };

    const nextRewardTarget = 500;
    const currentProgress = walletBalance || 0;

    return (
        <div>
            {/* Header */}
            <div>
                <div>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')}>X</button>
                    )}
                </div>

                <div onClick={() => navigate('/profile')}>
                    Wallet: {walletBalance || 0}
                </div>
            </div>

            {/* Categories */}
            <div>
                {popularCategories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleTabChange(cat)}
                        style={{ fontWeight: selectedCategory === cat ? 'bold' : 'normal' }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div>
                <BannerCarousel banners={banners} />

                <GamificationProgressBar
                    current={currentProgress}
                    target={nextRewardTarget}
                    label="Next Free Gift"
                />

                <DailyRewardModal />

                {showPinTip && (
                    <div>
                        <h4>Don't lose us!</h4>
                        <p>Pin this bot to the top of your chat list.</p>
                        <button onClick={handleClosePinTip}>X</button>
                    </div>
                )}

                <div>
                    {filteredProducts.length > 0 ? (
                        <ProductList products={filteredProducts} />
                    ) : (
                        <div>
                            <p>No products found</p>
                            <button onClick={() => {
                                handleTabChange("All");
                                setSearchQuery("");
                            }}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {isFetching && <div>Loading...</div>}

                {!hasMore && filteredProducts.length > 0 && (
                    <div>You've reached the end!</div>
                )}
            </div>
        </div>
    );
};

export default Home;
