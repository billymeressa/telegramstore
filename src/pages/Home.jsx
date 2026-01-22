import { useState, useMemo } from 'react';
import ProductList from '../components/ProductList';
import BannerCarousel from '../components/BannerCarousel';
import { Search } from 'lucide-react';

const Home = ({ products, onAdd, wishlist, toggleWishlist }) => {




    // Extract departments and categories
    const departments = useMemo(() => {
        const depts = products.map(p => p.department).filter(Boolean);
        return ["All", ...new Set(depts)];
    }, [products]);
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedSubCategory, setSelectedSubCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Get unique categories based on selected department
    const availableSubCategories = useMemo(() => {
        if (selectedDepartment === "All") return [];
        const cats = products
            .filter(p => p.department === selectedDepartment)
            .map(p => p.category);
        return ["All", ...new Set(cats)];
    }, [products, selectedDepartment]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesDepartment = selectedDepartment === "All" || p.department === selectedDepartment;
            const matchesCategory = selectedSubCategory === "All" || p.category === selectedSubCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesDepartment && matchesCategory && matchesSearch;
        });
    }, [products, selectedDepartment, selectedSubCategory, searchQuery]);

    // Reset subcategory when department changes
    const handleDepartmentChange = (dept) => {
        setSelectedDepartment(dept);
        setSelectedSubCategory("All");
    };

    return (
        <div className="pb-4">
            {/* Addis Store Header */}
            <div className="sticky top-0 z-20 bg-[#054D3B] pt-4 pb-2 px-4 shadow-md transition-all">
                <div className="flex flex-col gap-3 mb-2">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white text-[#0F1111] pl-10 pr-4 py-2.5 rounded-lg border-0 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-[#D4AF37] outline-none placeholder:text-gray-400"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </div>


                    {/* Department Nav */}
                    <div className="flex gap-5 overflow-x-auto no-scrollbar items-center pb-2 pt-1 border-b border-white/10">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => handleDepartmentChange(dept)}
                                className={`whitespace-nowrap text-sm font-medium transition-colors ${selectedDepartment === dept
                                    ? 'text-white border-b-2 border-[#D4AF37] pb-1'
                                    : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {/* Sub-Category Nav (only if specific department selected) */}
                    {selectedDepartment !== "All" && availableSubCategories.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar items-center py-2 animate-fadeIn">
                            {availableSubCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedSubCategory(cat)}
                                    className={`whitespace-nowrap text-xs px-3 py-1 rounded-full transition-colors ${selectedSubCategory === cat
                                        ? 'bg-white text-[#054D3B] font-bold'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>





            <BannerCarousel />

            <div className="mt-2">
                <ProductList products={filteredProducts} onAdd={onAdd} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
            </div>
        </div >
    );
};

export default Home;
