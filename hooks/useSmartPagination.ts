import React, { useEffect } from 'react';

const TOP_MARGIN = 70;    // Zona de segurança no topo da página
const BOTTOM_MARGIN = 70; // Zona de segurança no final da página (simétrico)

/**
 * useSmartPagination Hook
 *
 * Detecta elementos .break-inside-avoid que cruzam a quebra de página A4
 * e os empurra para a próxima página via margin-top, respeitando
 * uma margem de segurança de 70px no topo e 70px no fundo de cada página.
 *
 * IMPORTANTE: O getBoundingClientRect retorna valores já afetados por qualquer
 * transform: scale() pai. Por isso usamos o scrollWidth do próprio container
 * (que NÃO é afetado por transforms externos) para calcular a PAGE_HEIGHT_PX real.
 */
export const useSmartPagination = (containerRef: React.RefObject<HTMLElement>, enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled || !containerRef.current) return;
        const container = containerRef.current;

        const calculateLayout = () => {
            // scrollWidth/scrollHeight NÃO são afetados por transform: scale() do pai,
            // então refletem o tamanho real do layout do A4.
            const realWidth = container.scrollWidth;

            // Proporção matemática A4: 297mm / 210mm
            const PAGE_HEIGHT_PX = realWidth * (297 / 210);

            // ---- 1. RESET ----
            // Remove todos os margin-top que foram injetados em execuções anteriores
            const items = Array.from(container.querySelectorAll('.break-inside-avoid')) as HTMLElement[];
            items.forEach(el => {
                el.style.marginTop = '';
                el.classList.remove('pushed-to-next-page');
            });

            // ---- 2. CALCULAR POSIÇÕES ----
            // Lemos as posições RELATIVAS ao container (via offsetTop).
            // offsetTop não é afetado por transforms externos — é o deslocamento
            // em relação ao offsetParent, que aqui é o próprio container.
            for (let i = 0; i < items.length; i++) {
                const el = items[i];

                // offsetTop: posição do topo do elemento relativa ao container
                const relativeTop = getOffsetRelativeTo(el, container);
                const height = el.offsetHeight;
                const relativeBottom = relativeTop + height;

                // Elemento maior que uma página inteira: impossível acomodar, ignora
                if (height > PAGE_HEIGHT_PX - (TOP_MARGIN + BOTTOM_MARGIN)) {
                    continue;
                }

                const startPage = Math.floor(relativeTop / PAGE_HEIGHT_PX);
                const endPage   = Math.floor(relativeBottom / PAGE_HEIGHT_PX);

                const offsetInPageTop    = relativeTop    % PAGE_HEIGHT_PX;
                const offsetInPageBottom = relativeBottom % PAGE_HEIGHT_PX;

                let needsPush = false;
                let targetTop = relativeTop;

                // CASO 1: O elemento cruza a quebra de página (começa numa página, termina em outra)
                //         OU o rodapé do elemento invade a margem inferior da página atual
                if (startPage !== endPage || offsetInPageBottom > (PAGE_HEIGHT_PX - BOTTOM_MARGIN)) {
                    needsPush = true;
                    // Empurra para o TOPO da próxima página + margem de segurança
                    targetTop = (startPage + 1) * PAGE_HEIGHT_PX + TOP_MARGIN;
                }
                // CASO 2: O elemento está na margem de segurança do topo da página
                else if (startPage > 0 && offsetInPageTop < TOP_MARGIN) {
                    needsPush = true;
                    targetTop = startPage * PAGE_HEIGHT_PX + TOP_MARGIN;
                }

                if (needsPush) {
                    const pushNeeded = targetTop - relativeTop;
                    if (pushNeeded > 0) {
                        // Soma com a margem computada atual para não sobrescrever estilos existentes
                        const currentMarginTop = parseFloat(el.style.marginTop) || 0;
                        el.style.marginTop = `${pushNeeded + currentMarginTop}px`;
                        el.classList.add('pushed-to-next-page');
                    }
                }
            }
        };

        // Debounce para não recalcular a cada tecla
        let timeout: ReturnType<typeof setTimeout>;
        const runCalculation = () => {
            clearTimeout(timeout);
            timeout = setTimeout(calculateLayout, 250);
        };

        const mutationObserver = new MutationObserver(runCalculation);
        const resizeObserver = new ResizeObserver(runCalculation);

        mutationObserver.observe(container, { childList: true, subtree: true, characterData: true });
        resizeObserver.observe(container);

        // Primeira execução com delay para aguardar a renderização inicial
        setTimeout(calculateLayout, 600);

        return () => {
            mutationObserver.disconnect();
            resizeObserver.disconnect();
            clearTimeout(timeout);
        };

    }, [containerRef, enabled]);
};

/**
 * Calcula o offsetTop de um elemento relativo a um ancestral específico,
 * percorrendo a cadeia de offsetParent.
 * Não é afetado por transform: scale() externo.
 */
function getOffsetRelativeTo(el: HTMLElement, ancestor: HTMLElement): number {
    let top = 0;
    let current: HTMLElement | null = el;
    while (current && current !== ancestor) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
    }
    return top;
}
