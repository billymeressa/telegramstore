import { X, CheckCircle, Phone, Send } from 'lucide-react';

const ContactModal = ({ isOpen, onClose, sellerUsername, orderMessage }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-t-xl sm:rounded-xl p-6 shadow-xl relative animate-in slide-in-from-bottom-10 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)] mb-2 flex items-center gap-2">
                    <CheckCircle className="text-[var(--tg-theme-button-color)]" size={24} />
                    Order Placed!
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                    Your order has been submitted successfully. Please contact the merchant to arrange payment and delivery.
                </p>

                <div className="space-y-3">
                    <a
                        href="tel:+251911234567"
                        className="flex items-center justify-center gap-3 w-full bg-[var(--tg-theme-bg-color)] border-2 border-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-color)] font-bold py-3 rounded-xl active:bg-[var(--tg-theme-secondary-bg-color)] transition-colors"
                    >
                        <Phone size={20} />
                        Call Merchant
                    </a>

                    <a
                        href={`https://t.me/${sellerUsername}?text=${orderMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-[#0088cc] border-2 border-[#0088cc] text-white font-bold py-3 rounded-xl hover:bg-[#0077b5] transition-colors"
                    >
                        <Send size={20} />
                        Message on Telegram
                    </a>

                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-3 w-full bg-[#D4AF37] text-[#111827] font-bold py-3 rounded-xl shadow-md active:scale-[0.98] transition-transform mt-4"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
