import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HorizontalProductRow = ({ title, products }) => {
    const navigate = useNavigate();

    if (!products || products.length === 0) return null;

    return (
        <div className="py-2">
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-base font-bold text-[var(--tg-theme-text-color)]">{title}</h3>
                <button className="text-[var(--tg-theme-link-color)] text-xs font-medium flex items-center gap-0.5">
                    See All <ArrowRight size={12} />
                </button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2 snap-x">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="min-w-[140px] w-[140px] snap-start flex flex-col gap-1.5 cursor-pointer active:opacity-80 transition-opacity"
                    >
                        <div className="w-full aspect-[4/5] bg-[var(--tg-theme-bg-color)] rounded-lg overflow-hidden border border-[var(--tg-theme-section-separator-color)] relative">
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl bg-[var(--tg-theme-secondary-bg-color)]">📦</div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-[var(--tg-theme-text-color)] text-sm font-bold line-clamp-1">{product.title}</h4>
                            <p className="text-[var(--tg-theme-button-color)] text-sm font-bold">{Math.floor(product.price)} ETB</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalProductRow;
