import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a high-resolution PDF from a list of A4 page elements.
 * @param pageIds Array of DOM IDs corresponding to the A4 pages
 * @param fileName Name of the output file
 */
export const generateA4PDF = async (pageIds: string[], fileName: string = 'document.pdf') => {
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const originalScrollPos = window.scrollY;
    window.scrollTo(0, 0);

    for (let i = 0; i < pageIds.length; i++) {
        const originalElement = document.getElementById(pageIds[i]);
        if (!originalElement) continue;

        const element = originalElement.cloneNode(true) as HTMLElement;
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '210mm';
        container.style.zIndex = '-9999';
        container.style.visibility = 'visible';
        container.style.overflow = 'visible';

        element.style.position = 'relative';
        element.style.margin = '0';
        element.style.boxShadow = 'none';
        element.style.transform = 'none';
        element.style.width = '100%';
        element.style.minHeight = '297mm';
        element.style.height = 'auto';

        const isDark = document.documentElement.classList.contains('dark');
        if (!element.style.backgroundColor && !element.className.includes('bg-')) {
            element.style.backgroundColor = isDark ? '#111827' : '#ffffff';
        }

        container.appendChild(element);
        document.body.appendChild(container);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                windowWidth: 1200,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.90);
            const imgWidth = A4_WIDTH_MM;
            const contentHeightPx = canvas.height;
            const contentWidthPx = canvas.width;
            const imgHeight = (contentHeightPx * imgWidth) / contentWidthPx;

            let heightLeft = imgHeight;
            let position = 0;

            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= A4_HEIGHT_MM;

            while (heightLeft > 5) {
                position -= A4_HEIGHT_MM;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= A4_HEIGHT_MM;
            }

        } catch (error) {
            console.error(`Error generating page ${i + 1}:`, error);
        } finally {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        }
    }

    window.scrollTo(0, originalScrollPos);
    pdf.save(fileName);
};

/**
 * Função otimizada para capturar o currículo gigante (ResumePreview) e fatiá-lo perfeitamente
 * de acordo com a altura (que já é forçada a ser múltipla de A4).
 */
/**
 * Converte cores OKLCH/OKLAB/LCH para RGBA temporariamente.
 * Retorna uma função de limpeza para restaurar as cores originais.
 */
function applyOklchFixAndGetRestoreFunction(el: HTMLElement): () => void {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Armazena os estilos originais modificados para restaurar depois
    const originalStyles = new Map<HTMLElement | SVGElement, { prop: string, val: string }[]>();

    if (!ctx) return () => {};

    const colorProps = [
        'color', 'backgroundColor', 'borderColor', 
        'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
        'textDecorationColor', 'fill', 'stroke'
    ];

    const elements = [el, ...Array.from(el.querySelectorAll('*'))] as (HTMLElement | SVGElement)[];
    const isUnsupportedColor = (val: string) => /(oklch|oklab|lch|lab|color\()/.test(val);
    
    for (const child of elements) {
        const style = window.getComputedStyle(child);
        const modifications: { prop: string, val: string }[] = [];
        
        for (const prop of colorProps) {
            const cssProp = prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
            const val = style.getPropertyValue(cssProp);
            if (val && isUnsupportedColor(val)) {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = val;
                ctx.fillRect(0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
                
                // Salvar valor inline anterior (se existir) para restaurar
                modifications.push({ prop, val: (child.style as any)[prop] });
                
                (child.style as any)[prop] = rgba;
            }
        }
        
        if (child instanceof SVGElement) {
            const fill = child.getAttribute('fill');
            if (fill && isUnsupportedColor(fill)) {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = fill;
                ctx.fillRect(0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
                
                modifications.push({ prop: 'svg-fill', val: fill });
                child.setAttribute('fill', rgba);
            }
        }

        if (modifications.length > 0) {
            originalStyles.set(child, modifications);
        }
    }

    // Retorna a função de restauração
    return () => {
        originalStyles.forEach((mods, element) => {
            mods.forEach(({ prop, val }) => {
                if (prop === 'svg-fill') {
                    if (val) element.setAttribute('fill', val);
                    else element.removeAttribute('fill');
                } else {
                    (element.style as any)[prop] = val;
                }
            });
        });
    };
}

/**
 * Adiciona anotações de link clicável no PDF para cada <a> do DOM naquela página.
 */
function addLinkAnnotations(
    pdf: jsPDF,
    element: HTMLElement,
    containerRect: DOMRect,
    pageIndex: number,
    PAGE_HEIGHT_PX: number,
    A4_WIDTH_MM: number,
    A4_HEIGHT_MM: number
) {
    const links = element.querySelectorAll('a[href]');
    links.forEach(linkEl => {
        const anchor = linkEl as HTMLAnchorElement;
        let href = anchor.getAttribute('href') || '';

        // Ignora âncoras internas ou javascript:
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        // Garante protocolo
        if (!href.startsWith('http')) href = 'https://' + href.replace(/^\/\//, '');

        const linkRect = anchor.getBoundingClientRect();

        // Posição relativa ao container nesta página
        const relTop = linkRect.top - containerRect.top - pageIndex * PAGE_HEIGHT_PX;
        const relBottom = linkRect.bottom - containerRect.top - pageIndex * PAGE_HEIGHT_PX;

        // Ignora se o link não está nesta página
        if (relBottom < 0 || relTop > PAGE_HEIGHT_PX) return;

        // Converte pixels → milímetros PDF
        const pdfX = (linkRect.left - containerRect.left) / containerRect.width * A4_WIDTH_MM;
        const pdfY = Math.max(0, relTop) / PAGE_HEIGHT_PX * A4_HEIGHT_MM;
        const pdfW = linkRect.width / containerRect.width * A4_WIDTH_MM;
        const pdfH = (Math.min(relBottom, PAGE_HEIGHT_PX) / PAGE_HEIGHT_PX * A4_HEIGHT_MM) - pdfY;

        if (pdfW > 0 && pdfH > 0) {
            pdf.link(pdfX, pdfY, pdfW, pdfH, { url: href });
        }
    });
}

/**
 * Adiciona uma camada de texto invisível mas selecionável/pesquisável sobre a imagem de cada página.
 * Isso torna o PDF "digitalizado" — o texto pode ser copiado, buscado (Ctrl+F) e lido por
 * leitores de tela, sem alterar a aparência visual do documento.
 */
function addInvisibleTextLayer(
    pdf: jsPDF,
    element: HTMLElement,
    containerRect: DOMRect,
    pageIndex: number,
    PAGE_HEIGHT_PX: number,
    A4_WIDTH_MM: number,
    A4_HEIGHT_MM: number
) {
    pdf.setFont('helvetica', 'normal');

    // TreeWalker percorre todos os nós de texto do DOM
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const text = node.textContent?.trim();
            if (!text) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (parent?.closest('[data-html2canvas-ignore]')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const range = document.createRange();

    let node: Node | null;
    while ((node = walker.nextNode())) {
        const textContent = node.textContent?.trim();
        if (!textContent || !node.parentElement) continue;

        try {
            range.selectNodeContents(node);
            const rects = range.getClientRects();

            for (const rect of Array.from(rects)) {
                if (rect.width === 0 || rect.height === 0) continue;

                const relTop = rect.top - containerRect.top - pageIndex * PAGE_HEIGHT_PX;
                const relBottom = rect.bottom - containerRect.top - pageIndex * PAGE_HEIGHT_PX;

                if (relBottom < 0 || relTop > PAGE_HEIGHT_PX) continue;

                const computedStyle = window.getComputedStyle(node.parentElement);
                const fontSizePx = parseFloat(computedStyle.fontSize) || 12;
                // px → mm (proporção de escala da página)
                const fontSizeMm = fontSizePx * (A4_HEIGHT_MM / PAGE_HEIGHT_PX);
                pdf.setFontSize(Math.max(3, Math.min(fontSizeMm * 2.835, 30)));

                const pdfX = (rect.left - containerRect.left) / containerRect.width * A4_WIDTH_MM;
                const pdfY = (Math.max(0, relTop) + rect.height * 0.85) / PAGE_HEIGHT_PX * A4_HEIGHT_MM;

                if (pdfX >= 0 && pdfX < A4_WIDTH_MM && pdfY >= 0 && pdfY <= A4_HEIGHT_MM) {
                    // renderingMode: 'invisible' — texto no PDF mas 100% transparente
                    pdf.text(textContent, pdfX, pdfY, {
                        baseline: 'alphabetic',
                        renderingMode: 'invisible'
                    });
                }
            }
        } catch {
            // Ignora nós que não podem ser medidos
        }
    }
}

export const generateResumePDF = async (containerId: string): Promise<Blob> => {
    const originalElement = document.getElementById(containerId);
    if (!originalElement) throw new Error("Container não encontrado");

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const originalScrollPos = window.scrollY;
    window.scrollTo(0, 0);

    const separators = originalElement.querySelectorAll('[data-html2canvas-ignore="true"]');
    separators.forEach(el => (el as HTMLElement).style.opacity = '0');

    // Remover transformações (scale) do elemento pai que causam o bug de corte de texto no html2canvas
    const parentWrapper = originalElement.parentElement;
    const originalTransform = parentWrapper ? parentWrapper.style.transform : '';
    const originalTransition = parentWrapper ? parentWrapper.style.transition : '';
    if (parentWrapper) {
        parentWrapper.style.transition = 'none';
        parentWrapper.style.transform = 'none';
    }

    // O html2canvas buga com overflow-hidden e truncate quando a escala muda
    const truncateElements = originalElement.querySelectorAll('.truncate');
    truncateElements.forEach(el => {
        (el as HTMLElement).style.overflow = 'visible';
        (el as HTMLElement).style.whiteSpace = 'normal';
    });

    // Aplicar a correção de cores no elemento ORIGINAL
    const restoreColors = applyOklchFixAndGetRestoreFunction(originalElement);

    try {
        const rect = originalElement.getBoundingClientRect();
        const PAGE_HEIGHT_PX = rect.width * (297 / 210);
        
        const totalHeight = originalElement.scrollHeight;
        const totalPages = Math.max(1, Math.round(totalHeight / PAGE_HEIGHT_PX));

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            
            const canvas = await html2canvas(originalElement, {
                scale: 2, 
                useCORS: true,
                logging: false,
                backgroundColor: null,
                y: originalElement.offsetTop + (i * PAGE_HEIGHT_PX),
                height: PAGE_HEIGHT_PX, 
                windowWidth: 1200,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            // 1. Adiciona a imagem visual da página
            pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

            // 2. Camada de texto invisível (selecionável, pesquisável, acessível)
            addInvisibleTextLayer(pdf, originalElement, rect, i, PAGE_HEIGHT_PX, A4_WIDTH_MM, A4_HEIGHT_MM);

            // 3. Anotações de links clicáveis
            addLinkAnnotations(pdf, originalElement, rect, i, PAGE_HEIGHT_PX, A4_WIDTH_MM, A4_HEIGHT_MM);
        }

        return pdf.output('blob');

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        throw error;
    } finally {
        restoreColors();
        
        truncateElements.forEach(el => {
            (el as HTMLElement).style.overflow = '';
            (el as HTMLElement).style.whiteSpace = '';
        });

        if (parentWrapper) {
            parentWrapper.style.transform = originalTransform;
            setTimeout(() => {
                parentWrapper.style.transition = originalTransition;
            }, 50);
        }

        separators.forEach(el => (el as HTMLElement).style.opacity = '1');
        window.scrollTo(0, originalScrollPos);
    }
};

