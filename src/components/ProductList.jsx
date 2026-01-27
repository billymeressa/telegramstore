import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';




const Countdown = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold py-1 px-2 flex justify-between items-center z-10">
        <span className="text-orange-300">⚡ Flash Deal</span>
        <span className="font-mono">04:23:45</span>
    </div>
);

const StockBar = ({ percentage }) => {
    return (
        <div className="mt-2">
            <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                <span className="text-orange-600 font-bold">Almost Sold Out</span>
                <span>{percentage}% claimed</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

function ProductList({ products }) {
    const navigate = useNavigate();

    return (
        <div
            className="grid grid-cols-2 gap-2 p-2 pb-24"
        >
            {products.map((product, index) => (
                <div
                    key={`${product.id}-${index}`}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-[var(--tg-theme-bg-color)] rounded-xl overflow-hidden cursor-pointer transition-shadow shadow-sm border border-[var(--tg-theme-section-separator-color)] hover:shadow-md active:scale-95 transition-transform"
                >
                    <div className="relative w-full aspect-[4/5] bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full text-[var(--tg-theme-hint-color)] bg-[var(--tg-theme-secondary-bg-color)]">
                                <Package size={32} opacity={0.5} />
                            </div>
                        )}
                        {/* Sale Tag */}
                        {product.salePrice > 0 && product.salePrice < product.price && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                                SALE
                            </div>
                        )}
                        {/* Temu-style badges */}
                        {product.soldCount > 0 && (
                            <div className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-orange-200 shadow-sm z-10">
                                {product.soldCount >= 1000 ? (product.soldCount / 1000).toFixed(1) + 'k' : product.soldCount}+ sold
                            </div>
                        )}
                        {product.isFlashSale && <Countdown />}
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 text-left">
                        <h3 className="text-[var(--tg-theme-text-color)] text-base leading-tight line-clamp-2 min-h-[2.5em] font-bold">
                            {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-baseline gap-0.5">
                                {product.variations && product.variations.length > 0 ? (
                                    // Show price range for products with variations
                                    <>
                                        <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">
                                            {Math.floor(Math.min(...product.variations.map(v => v.price)))}
                                        </span>
                                        <span className="text-[var(--tg-theme-text-color)] text-sm font-normal mx-0.5">-</span>
                                        <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">
                                            {Math.floor(Math.max(...product.variations.map(v => v.price)))}
                                        </span>
                                        <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                                    </>
                                ) : (
                                    // Show single price for regular products
                                    product.salePrice > 0 && product.salePrice < product.price ? (
                                        <>
                                            <span className="text-red-600 text-lg font-extrabold">{Math.floor(product.salePrice)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal line-through ml-1">{Math.floor(product.price)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal ml-0.5">ETB</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[var(--tg-theme-text-color)] text-lg font-extrabold">{Math.floor(product.price)}</span>
                                            <span className="text-[var(--tg-theme-hint-color)] text-xs font-normal">ETB</span>
                                        </>
                                    )
                                )}
                            </div>

                        </div>

                        {/* Urgency Stock Bar (Randomly shown) */}
                        {product.stockPercentage > 0 && <StockBar percentage={product.stockPercentage} />}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProductList;

