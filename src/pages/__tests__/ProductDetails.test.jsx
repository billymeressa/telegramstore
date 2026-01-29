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
        useStore.mockReturnValue([]); // Default mock for wishlist
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
        expect(await screen.findByText('Header: Cool Product')).toBeInTheDocument();
    });

    test('variation selection updates price', async () => {
        render(
            <MemoryRouter initialEntries={['/product/123']}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText('Header: Cool Product');

        // Initial Price (First variation default)
        // Note: Code defaults to first variation logic: setSelectedVariation(data.variations[0])
        expect(screen.getByText('900')).toBeInTheDocument();

        // Click other variation
        fireEvent.click(screen.getByText('Large - 1000 Birr'));

        // Price should update
        expect(screen.getByText('1000')).toBeInTheDocument();
    });
});
