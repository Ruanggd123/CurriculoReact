import { useState, useEffect, RefObject } from 'react';

export const useOverflowDetection = (ref: RefObject<HTMLElement>) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        const checkOverflow = () => {
            if (ref.current) {
                const { scrollHeight, clientHeight } = ref.current;
                const currentContentHeight = scrollHeight;

                // 297mm in pixels is approx 1122px at 96 DPI
                // We use clientHeight as the limit
                const limit = clientHeight || 1120;

                setContentHeight(currentContentHeight);
                setIsOverflowing(currentContentHeight > limit);
            }
        };

        const observer = new ResizeObserver(checkOverflow);
        if (ref.current) {
            observer.observe(ref.current);
            // Check immediately
            checkOverflow();
        }

        // Also check on input for contentEditable
        const element = ref.current;
        if (element) {
            element.addEventListener('input', checkOverflow);
        }

        return () => {
            observer.disconnect();
            if (element) {
                element.removeEventListener('input', checkOverflow);
            }
        };
    }, [ref]);

    return { isOverflowing, contentHeight };
};
