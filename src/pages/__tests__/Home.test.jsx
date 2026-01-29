import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { vi } from 'vitest';

// Mock child components to isolate Home logic
vi.mock('../../components/ProductList', () => ({
    default: ({ products }) => <div data-testid="product-list">{products.length} products</div>
}));

describe('Home Page', () => {
    const mockProducts = [
        { id: 1, title: 'Phone', category: 'Electronics', department: 'Electronics' },
        { id: 2, title: 'Shirt', category: 'Men', department: 'Men' },
        { id: 3, title: 'Laptop', category: 'Electronics', department: 'Electronics' }
    ];

    test('renders search bar and category tabs', () => {
        render(
            <BrowserRouter>
                <Home products={mockProducts} />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
        const allTabs = screen.getAllByText('All');
        expect(allTabs.length).toBeGreaterThan(0);
    });

    test('filters products by search query', async () => {
        render(
            <BrowserRouter>
                <Home products={mockProducts} />
            </BrowserRouter>
        );

        const searchInput = screen.getByPlaceholderText(/search products/i);
        fireEvent.change(searchInput, { target: { value: 'Phone' } });

        // Expect ProductList to receive filtered products
        // Since we mocked ProductList to show count
        expect(await screen.findByText('1 products')).toBeInTheDocument();
    });

    test('filters products by category tab', async () => {
        render(
            <BrowserRouter>
                <Home products={mockProducts} />
            </BrowserRouter>
        );

        // Click on a category (assuming "Electronics" is in the popular list derived from mockProducts)
        // Note: Popular logic puts "Electronics" in tabs because count > 0
        const categoryTab = screen.getAllByText('Electronics')[0]; // might appear multiple times due to loop
        fireEvent.click(categoryTab);

        // Should filter to 2 electronics items
        expect(await screen.findByText('2 products')).toBeInTheDocument();
    });
});
