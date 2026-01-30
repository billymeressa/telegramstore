import ProductCard from './ProductCard';
import useStore from '../store/useStore';

function ProductList({ products }) {
    const addToCart = useStore(state => state.addToCart);

    // Masonry-ish 2 Column Layout using simple flex col split
    // (This is often more performant than grid for variable height cards)
    const leftCol = products.filter((_, i) => i % 2 === 0);
    const rightCol = products.filter((_, i) => i % 2 === 1);

    return (
        <div className="flex gap-2 px-2 pb-2">
            <div className="flex-1 flex flex-col gap-2">
                {leftCol.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={addToCart}
                    />
                ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
                {rightCol.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={addToCart}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProductList;
