import React, { useRef, useEffect } from 'react';

const InfiniteScrollTrigger = ({ onIntersect, isLoading, hasMore }) => {
    const triggerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasMore && !isLoading) {
                onIntersect();
            }
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        const currentTrigger = triggerRef.current;
        if (currentTrigger) {
            observer.observe(currentTrigger);
        }

        return () => {
            if (currentTrigger) {
                observer.unobserve(currentTrigger);
            }
        };
    }, [onIntersect, isLoading, hasMore]);

    if (!hasMore) return null;

    return (
        <div ref={triggerRef} className="w-full py-6 flex justify-center items-center">
            {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fb7701]"></div>
            ) : (
                <div className="h-4" /> // Sentinel height
            )}
        </div>
    );
};

export default InfiniteScrollTrigger;
