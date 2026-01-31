import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetails from '../ProductDetails';
import useStore from '../../store/useStore';
import { vi } from 'vitest';

// Mock Zustand
vi.mock('../../store/useStore', () => ({
    default: vi.fn()
}));

// Mock API
global.fetch = vi.fn();

// Mock Child Components
vi.mock('../../components/NativeHeader', () => ({
    default: ({ title }) => <h1>Header: {title}</h1>
}));
vi.mock('../../components/ProductList', () => ({
    default: () => <div>Related Products</div>
}));

describe('ProductDetails', () => {
    const mockProduct = {
        id: '123', // Match route param type
        title: 'Cool Product',
        price: 999,
        images: ['img1.jpg'],
        variations: [
            { name: 'Small', price: 900, stock: 10 },
            { name: 'Large', price: 1000, stock: 5 }
        ]
    };

    beforeEach(() => {
        useStore.mockImplementation((selector) => {
            const state = {
                wishlist: [],
                cart: [],
                addToCart: vi.fn(),
                toggleWishlist: vi.fn()
            };
            return selector ? selector(state) : state;
        });

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockProduct
        });
    });

    test('fetches and renders product details', async () => {
        render(
            <MemoryRouter initialEntries={['/product/123']}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        // Wait for product load
        expect(await screen.findByText('Cool Product')).toBeInTheDocument();
    });

    test('variation selection updates price', async () => {
        render(
            <MemoryRouter initialEntries={['/product/123']}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText('Cool Product');

        // Initial Price (First variation default)
        expect(screen.getByText('ETB 900')).toBeInTheDocument();

        // Click other variation
        fireEvent.click(screen.getByText('Large')); // Wait, variations might simulate different text?
        // Let's check variations mapping in ProductDetails.jsx
        // Variations are rendered as buttons with name. 
        // In ProductDetails.jsx: {v.name} inside button.
        // It does NOT show price in the button text. 
        // Logic: text-[11px] ... {v.name}

        // Wait, the mock product has variations: {name: 'Large', ...}
        // So button has text 'Large'.

        fireEvent.click(screen.getByText('Large'));

        // Price should update
        expect(screen.getByText('ETB 1000')).toBeInTheDocument();
    });
});
