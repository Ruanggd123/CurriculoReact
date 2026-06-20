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

        const calculateLayout = () => {
            // Calcular dinamicamente a altura exata do A4 baseado na largura renderizada
            const containerRect = container.getBoundingClientRect();
            // Proporção matemática A4: 297 / 210 = ~1.41428
            const PAGE_HEIGHT_PX = containerRect.width * (297 / 210); 
            
            const TOP_MARGIN = 70;    // Zona de segurança no topo da página (evita colar na borda)
            const BOTTOM_MARGIN = 50; // Zona de segurança no final da página

            // 1. Reset previous calculations
            const items = Array.from(container.querySelectorAll('.break-inside-avoid')) as HTMLElement[];
            items.forEach(el => {
                el.style.marginTop = '';
                el.classList.remove('pushed-to-next-page');
            });

            // 2. Re-calculate positions sequentially.
            // Pushing an element down affects all subsequent elements.
            // By calling getBoundingClientRect in the loop, we force synchronous layout reflow,
            // ensuring the exact positions are read correctly step by step.
            
            for (let i = 0; i < items.length; i++) {
                const el = items[i];
                const rect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const relativeTop = rect.top - containerRect.top;
                const height = rect.height;
                const relativeBottom = relativeTop + height;

                if (height > PAGE_HEIGHT_PX - (TOP_MARGIN + BOTTOM_MARGIN)) {
                    continue; // Elemento é maior que uma página inteira, ignora
                }

                const startPage = Math.floor(relativeTop / PAGE_HEIGHT_PX);
                const endPage = Math.floor(relativeBottom / PAGE_HEIGHT_PX);
                
                const offsetInPageTop = relativeTop % PAGE_HEIGHT_PX;
                const offsetInPageBottom = relativeBottom % PAGE_HEIGHT_PX;

                let needsPush = false;
                let targetTop = relativeTop;

                // Se o elemento cruza a quebra de página OU se o pé dele invade a margem inferior
                if (startPage !== endPage || offsetInPageBottom > (PAGE_HEIGHT_PX - BOTTOM_MARGIN)) {
                    needsPush = true;
                    // Joga o elemento para a PRÓXIMA página, respeitando a margem superior
                    targetTop = (startPage + 1) * PAGE_HEIGHT_PX + TOP_MARGIN;
                } 
                // Se o elemento já está na página certa, mas a cabeça dele invade a margem superior
                else if (offsetInPageTop < TOP_MARGIN) {
                    needsPush = true;
                    targetTop = startPage * PAGE_HEIGHT_PX + TOP_MARGIN;
                }

                if (needsPush) {
                    // Descobrir a margem existente para somar e evitar colapso total (margin collapse)
                    const currentStyle = window.getComputedStyle(el);
                    const currentMarginTop = parseFloat(currentStyle.marginTop) || 0;
                    
                    const pushNeeded = targetTop - relativeTop;
                    
                    el.style.marginTop = `${pushNeeded + currentMarginTop}px`;
                    el.classList.add('pushed-to-next-page');
                }
            }
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
