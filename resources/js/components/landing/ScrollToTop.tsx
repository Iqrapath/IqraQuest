import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#338078] text-white shadow-lg transition-all duration-300 hover:bg-[#2a6b64] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#338078] focus:ring-offset-2"
                    aria-label="Scroll to top"
                >
                    <Icon icon="mdi:chevron-up" className="h-6 w-6" />
                </button>
            )}
        </>
    );
}
