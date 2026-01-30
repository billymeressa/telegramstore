import { useNavigate } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
import useStore from '../store/useStore';

function ProductCard({ product, onAdd, isWishlisted, onToggleWishlist }) {
    const navigate = useNavigate();
    const [isAdded, setIsAdded] = useState(false);
    const settings = useStore(state => state.settings);

    // Logic for flash sale (functional, not visual)
    const intensity = settings.global_sale_intensity || 'medium';
    const showFlashSale = useMemo(() => {
        if (product.isFlashSale) return true;
        const prob = settings.system_flash_sale_prob !== undefined
            ? settings.system_flash_sale_prob
            : (intensity === 'low' ? 0 : intensity === 'high' ? 0.5 : 0.2);
        if (prob === 0) return false;

        let hash = 0;
        const str = String(product.id || product.title);
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const rand = Math.abs(hash) % 100;
        return rand < (prob * 100);
    }, [intensity, settings.system_flash_sale_prob, product.id, product.title, product.isFlashSale]);

    const handleAdd = (e) => {
        e.stopPropagation();
        onAdd(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleWishlist = (e) => {
        e.stopPropagation();
        onToggleWishlist();
    };

    return (
        <div onClick={() => navigate(`/product/${product.id}`)}>
            {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.title} width="100" />
            ) : (
                <div style={{ width: 100, height: 100, background: '#ccc' }}>No Image</div>
            )}

            <h3>{product.title}</h3>

            <div>
                <span>
                    ETB {product.variations && product.variations.length > 0
                        ? Math.min(...product.variations.map(v => v.price))
                        : product.price
                    }
                </span>
                {(product.originalPrice > product.price) && (
                    <span style={{ textDecoration: 'line-through', marginLeft: 5 }}>
                        {product.originalPrice}
                    </span>
                )}
            </div>

            {showFlashSale && <div>Flesh Sale Active!</div>}

            <div>
                <button onClick={handleAdd}>
                    {isAdded ? 'Added' : 'Add to Cart'}
                </button>
                <button onClick={handleWishlist}>
                    {isWishlisted ? 'Un-Wishlist' : 'Wishlist'}
                </button>
            </div>

            {product.stock === 0 && !product.isUnique && (
                <div>Sold Out</div>
            )}
        </div>
    );
}

export default React.memo(ProductCard);
