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

export const generateResumePDF = async (containerId: string): Promise<Blob> => {
    const originalElement = document.getElementById(containerId);
    if (!originalElement) throw new Error("Container não encontrado");

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const originalScrollPos = window.scrollY;
    window.scrollTo(0, 0);

    const separators = originalElement.querySelectorAll('[data-html2canvas-ignore="true"]');
    
    // Esconder separadores visuais
    separators.forEach(el => (el as HTMLElement).style.opacity = '0');

    // Remover transformações (scale) do elemento pai E avô que causam bug de corte de texto no html2canvas
    // O ScaledPreview tem 2 níveis: wrapper externo (sem transform) e inner div (com transform: scale)
    const innerWrapper = originalElement.parentElement; // o div com transform: scale()
    const outerWrapper = innerWrapper?.parentElement;   // o div#preview-wrapper (sem transform)
    const originalInnerTransform = innerWrapper ? innerWrapper.style.transform : '';
    const originalOuterWidth = outerWrapper ? outerWrapper.style.width : '';
    const originalOuterHeight = outerWrapper ? outerWrapper.style.height : '';
    
    if (innerWrapper) {
        innerWrapper.style.transition = 'none';
        innerWrapper.style.transform = 'none';
        innerWrapper.style.width = '100%'; // restaura para 100% sem compensação de escala
    }
    if (outerWrapper) {
        // Remove as dimensões fixas do wrapper para a folha se expandir ao tamanho real
        outerWrapper.style.width = 'auto';
        outerWrapper.style.height = 'auto';
    }

    // O html2canvas buga com overflow-hidden e truncate quando a escala muda, vamos desabilitar temporariamente
    const truncateElements = originalElement.querySelectorAll('.truncate');
    truncateElements.forEach(el => {
        (el as HTMLElement).style.overflow = 'visible';
        (el as HTMLElement).style.whiteSpace = 'normal';
    });

    // Aplicar a correção de cores no elemento ORIGINAL (para manter layout e fontes perfeitas)
    const restoreColors = applyOklchFixAndGetRestoreFunction(originalElement);

    // Aguardar o navegador recalcular o layout após remover os transforms
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Agora sem transform, o elemento está com seu tamanho real em 210mm
        // Usamos scrollHeight para medir e BoundingRect para a posição
        const rect = originalElement.getBoundingClientRect();
        const PAGE_HEIGHT_PX = rect.width * (297 / 210); // Proporção A4 exata
        
        const totalHeight = originalElement.scrollHeight;
        const totalPages = Math.max(1, Math.round(totalHeight / PAGE_HEIGHT_PX));

        // Coordenada Y de início do elemento em relação ao documento inteiro
        const elementStartY = rect.top + window.scrollY;

        for (let i = 0; i < totalPages; i++) {
            if (i > 0) pdf.addPage();
            
            const canvas = await html2canvas(originalElement, {
                scale: 2, 
                useCORS: true,
                logging: false,
                backgroundColor: null,
                // y relativo ao elemento, não ao documento
                y: i * PAGE_HEIGHT_PX,
                height: PAGE_HEIGHT_PX, 
                windowWidth: 1200,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
        }

        return pdf.output('blob');

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        throw error;
    } finally {
        // Restaurar as cores originais
        restoreColors();
        
        // Restaurar truncate e overflow
        truncateElements.forEach(el => {
            (el as HTMLElement).style.overflow = '';
            (el as HTMLElement).style.whiteSpace = '';
        });

        // Restaurar transformações dos wrappers do ScaledPreview
        if (innerWrapper) {
            innerWrapper.style.transform = originalInnerTransform;
            innerWrapper.style.width = ''; // remove o override que pusemos
        }
        if (outerWrapper) {
            outerWrapper.style.width = originalOuterWidth;
            outerWrapper.style.height = originalOuterHeight;
        }

        // Restaurar visibilidade dos separadores
        separators.forEach(el => (el as HTMLElement).style.opacity = '1');
        
        window.scrollTo(0, originalScrollPos);
    }
};
