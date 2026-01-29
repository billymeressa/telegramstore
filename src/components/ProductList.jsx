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
        <div className="columns-2 md:columns-3 gap-3 px-1">
            {products.map((product) => (
                <div key={product.id} className="break-inside-avoid mb-3">
                    <ProductCard
                        product={product}
                        onAdd={() => addToCart(product)}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                    />
                </div>
            ))}
        </div>
    );
}

export default ProductList;

