import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
class IntersectionObserverMock {
    constructor(cb, options) {
        this.disconnect = vi.fn();
        this.observe = vi.fn();
        this.takeRecords = vi.fn();
        this.unobserve = vi.fn();
    }
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
