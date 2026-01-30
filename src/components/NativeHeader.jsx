import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NativeHeader = ({ title, children, onBack }) => {
    const navigate = useNavigate();

    // Use children if provided (custom content like search bar), otherwise use title
    const content = children || (
        <span className="font-semibold text-lg truncate text-black">
            {title}
        </span>
    );

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-white shadow-sm pt-[var(--tg-safe-area-top)] transition-all duration-200">
            <div className="px-[100px] flex items-center justify-center h-[var(--tg-header-buttons-height)] min-h-[44px] w-full box-border relative">

                {/* Optional Back Button (if not relying entirely on Telegram's native back button) 
                    Although Telegram has a native back button, sometimes an articulate in-app back is useful if the user 
                    navigates deeply. However, the prompt implies relying on "telegram native buttons".
                    We will assume the Native Back Button is handled by the Telegram WebApp context or the user understands it.
                    But if we want to mimic the "space between buttons", we strictly just center the content.
                */}

                {content}
            </div>
        </div>
    );
};

export default NativeHeader;
