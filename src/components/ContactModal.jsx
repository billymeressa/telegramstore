import { X, CheckCircle, Phone, Send, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactModal = ({ isOpen, onClose, sellerUsername, orderMessage }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleDone = () => {
        onClose();
        navigate('/');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="text-green-600" size={32} strokeWidth={3} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Order Placed!</h3>
                    <p className="text-gray-500 text-sm mt-1 px-4">
                        Your order has been submitted. Contact the merchant to complete your purchase.
                    </p>
                </div>

                <div className="space-y-3">
                    <a
                        href="tel:+251911234567" // Ideally from config
                        className="flex items-center justify-center gap-3 w-full bg-white border-2 border-[#fb7701] text-[#fb7701] font-bold py-3.5 rounded-xl active:bg-orange-50 transition-colors"
                    >
                        <Phone size={20} />
                        Call Merchant
                    </a>

                    <a
                        href={`https://t.me/${sellerUsername}?text=${orderMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-[#0088cc] border-2 border-[#0088cc] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-[#0077b5] transition-colors"
                    >
                        <Send size={20} />
                        Message on Telegram
                    </a>

                    <button
                        onClick={handleDone}
                        className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-transform mt-2"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
