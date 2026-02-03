import React, { useEffect } from 'react';

/**
 * useSmartPagination Hook
 * 
 * This hook simulates the "Smart Pagination" logic (break-inside: avoid) within the Editor Preview.
 * It detects items that cross the A4 page boundary (approx 1122px at 96 DPI) and pushes them
 * to the next page visually using margin-top.
 * 
 * @param containerRef Reference to the ResumePreview container
 * @param enabled Whether pagination simulation is enabled
 */
export const useSmartPagination = (containerRef: React.RefObject<HTMLElement>, enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled || !containerRef.current) return;

        const container = containerRef.current;
        const PAGE_HEIGHT_PX = 1122; // Standard A4 height at 96 DPI
        const PAGE_MARGIN_TOP_PX = 40; // Visual gap at top of next page (padding)

        const calculateLayout = () => {
            // 1. Reset previous calculations to avoid compounding margins
            const items = container.querySelectorAll('.break-inside-avoid');
            items.forEach(item => {
                (item as HTMLElement).style.marginTop = '';
                (item as HTMLElement).classList.remove('pushed-to-next-page');
            });

            // 2. Re-calculate positions
            // We must re-query after reset because positions change
            // Actually, we need to iterate in flow order.
            const freshItems = container.querySelectorAll('.break-inside-avoid');

            let currentPush = 0; // Track cumulative push to adjust subsequent items? 
            // No, DOM flow handles subsequent items. We just need to check if *current* item crosses line.

            freshItems.forEach((item) => {
                const el = item as HTMLElement;
                const rect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Relative Top from container start
                const relativeTop = rect.top - containerRect.top;
                const height = rect.height;
                const relativeBottom = relativeTop + height;

                // Find which page this item STARTS on
                const startPage = Math.floor(relativeTop / PAGE_HEIGHT_PX);

                // Find which page this item ENDS on
                const endPage = Math.floor(relativeBottom / PAGE_HEIGHT_PX);

                // If it crosses a page boundary
                if (startPage !== endPage) {
                    // Check if it's too big for a single page (ignore huge items)
                    if (height < PAGE_HEIGHT_PX) {
                        // Push to next page start + Visual Gap offset
                        // The separator is centered at the break. 
                        // Break logic: Item crosses 'startPage * 1123'. 
                        // We want to push it to '(startPage + 1) * 1123 + GAP'.

                        const nextPageStart = (startPage + 1) * PAGE_HEIGHT_PX;
                        // Add extra buffer so it visually clears the "Cut" bar (40px height + margins)
                        const VISUAL_SEPARATOR_HEIGHT = 60;

                        const pushNeeded = nextPageStart - relativeTop + VISUAL_SEPARATOR_HEIGHT;

                        el.style.marginTop = `${pushNeeded}px`;
                        el.classList.add('pushed-to-next-page');

                        // Note: Pushing this item downwards affects all subsequent items immediately.
                        // But for this simplified loop, getting clientRects inside the loop *might* work 
                        // if browser recalculates layout synchronously (reflow).
                        // Browsers usually batch, but accessing offsetTop forces reflow.
                    }
                }
            });
        };

        // Debounce buffer
        let timeout: NodeJS.Timeout;
        const runCalculation = () => {
            clearTimeout(timeout);
            timeout = setTimeout(calculateLayout, 300); // 300ms delay to wait for typing
        };

        // Observers
        const observer = new MutationObserver(runCalculation);
        const resizeObserver = new ResizeObserver(runCalculation);

        observer.observe(container, { childList: true, subtree: true, characterData: true });
        resizeObserver.observe(container);

        // Initial run
        setTimeout(calculateLayout, 500);

        return () => {
            observer.disconnect();
            resizeObserver.disconnect();
            clearTimeout(timeout);
        };

    }, [containerRef, enabled]);
};
