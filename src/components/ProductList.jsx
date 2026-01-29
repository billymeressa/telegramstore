import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import useStore from '../store/useStore';

function ProductList({ products }) {
    const navigate = useNavigate();

    // Zustand
    const addToCart = useStore(state => state.addToCart);
    const wishlist = useStore(state => state.wishlist);
    const toggleWishlist = useStore(state => state.toggleWishlist);

    return (
    // Split products into two stable columns to prevent scroll glitching
    const leftColumn = products.filter((_, i) => i % 2 === 0);
    const rightColumn = products.filter((_, i) => i % 2 === 1);

    return (
        <div className="flex gap-3 px-1 items-start">
            <div className="flex-1 flex flex-col gap-3">
                {leftColumn.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={() => addToCart(product)}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                    />
                ))}
            </div>
            <div className="flex-1 flex flex-col gap-3">
                {rightColumn.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={() => addToCart(product)}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                    />
                ))}
            </div>
        </div>
    );
    );
}

export default ProductList;

