import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import useStore from '../store/useStore';

function ProductList({ products }) {
    const navigate = useNavigate();
    const addToCart = useStore(state => state.addToCart);
    const wishlist = useStore(state => state.wishlist);
    const toggleWishlist = useStore(state => state.toggleWishlist);

    return (
        <div>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => addToCart(product)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                />
            ))}
        </div>
    );
}

export default ProductList;
