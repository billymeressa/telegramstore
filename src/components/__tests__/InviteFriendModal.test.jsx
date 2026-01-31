import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InviteFriendModal from '../InviteFriendModal';
import useStore from '../../store/useStore';

// Mock dependencies
vi.mock('../../store/useStore');
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, onClick, className }) => <div onClick={onClick} className={className}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));
vi.mock('lucide-react', () => ({
    Users: () => <span>Users Icon</span>,
    Copy: () => <span>Copy Icon</span>,
    Send: () => <span>Send Icon</span>,
    X: () => <span>X Icon</span>,
    Gift: () => <span>Gift Icon</span>
}));

describe('InviteFriendModal', () => {
    const mockSetShowInviteModal = vi.fn();
    const mockState = {
        user: { id: 123, first_name: 'Test' },
        settings: { referral_reward_amount: 100 },
        setShowInviteModal: mockSetShowInviteModal
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default store mock to handle selectors correctly
        useStore.mockImplementation((selector) => {
            if (selector) return selector(mockState);
            return mockState;
        });
        useStore.getState = vi.fn(() => mockState);
    });

    it('renders nothing when closed', () => {
        render(<InviteFriendModal isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByText('Invite Friends,')).toBeNull();
    });

    it('renders correctly when open', () => {
        render(<InviteFriendModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByText(/invite friends/i)).toBeInTheDocument();
        expect(screen.getByText(/earn cash/i)).toBeInTheDocument();

        // "100 ETB" appears multiple times (badge and text)
        const amountTexts = screen.getAllByText(/100 ETB/i);
        expect(amountTexts.length).toBeGreaterThan(0);

        expect(screen.getByText(/ref_123/)).toBeInTheDocument(); // Checks if user ID is in link
    });

    it('displays default amount if settings missing', () => {
        const stateWithoutSettings = {
            ...mockState,
            settings: {}
        };
        useStore.mockImplementation((selector) => {
            if (selector) return selector(stateWithoutSettings);
            return stateWithoutSettings;
        });

        render(<InviteFriendModal isOpen={true} onClose={vi.fn()} />);
        const amountTexts = screen.getAllByText(/50 ETB/i); // Default is 50
        expect(amountTexts.length).toBeGreaterThan(0);
    });

    it('calls onClose when close button clicked', () => {
        const onClose = vi.fn();
        render(<InviteFriendModal isOpen={true} onClose={onClose} />);

        const closeBtn = screen.getByText('X Icon').parentElement;
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });

    it('copies link on copy button click', () => {
        // Mock clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn(),
            },
        });

        render(<InviteFriendModal isOpen={true} onClose={vi.fn()} />);

        const copyBtn = screen.getByText('Copy Icon').parentElement;
        fireEvent.click(copyBtn);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('ref_123'));
        expect(screen.getByText('COPIED')).toBeInTheDocument();
    });
});
