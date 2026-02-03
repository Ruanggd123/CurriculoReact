import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a high-resolution PDF from a list of A4 page elements.
 * @param pageIds Array of DOM IDs corresponding to the A4 pages
 * @param fileName Name of the output file
 */
export const generateA4PDF = async (pageIds: string[], fileName: string = 'document.pdf') => {
    // A4 Dimensions in mm
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    // Create new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Save current scroll position to restore later
    const originalScrollPos = window.scrollY;

    // Scroll to top to ensure html2canvas captures correctly (prevents whitespace bugs)
    window.scrollTo(0, 0);

    for (let i = 0; i < pageIds.length; i++) {
        const originalElement = document.getElementById(pageIds[i]);
        if (!originalElement) continue;

        // --- CLONE STRATEGY V2 (FIXED) ---
        const element = originalElement.cloneNode(true) as HTMLElement;

        // Wrap in a container to ensure isolated context
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '210mm';
        container.style.zIndex = '-9999'; // Behind current view
        container.style.visibility = 'visible'; // MUST be visible for html2canvas
        container.style.overflow = 'visible';

        // Force styles on the cloned element
        element.style.position = 'relative';
        element.style.margin = '0';
        element.style.boxShadow = 'none';
        element.style.transform = 'none';
        element.style.width = '100%';
        element.style.minHeight = '297mm';
        element.style.height = 'auto';

        // If dark mode, ensure background is set (html2canvas sometimes defaults to white/transparent)
        const isDark = document.documentElement.classList.contains('dark');
        if (!element.style.backgroundColor && !element.className.includes('bg-')) {
            element.style.backgroundColor = isDark ? '#111827' : '#ffffff';
        }

        container.appendChild(element);
        document.body.appendChild(container);

        try {
            // Wait for images and layout (critical delay)
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(element, {
                scale: 2, // Slightly reduced scale for stability
                useCORS: true,
                logging: false, // Set to true if debugging needed
                backgroundColor: null, // Transparent to let element bg show
                windowWidth: 1200, // Force desktop width
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.90);

            // Calculate dimensions
            const imgWidth = A4_WIDTH_MM;
            const contentHeightPx = canvas.height;
            const contentWidthPx = canvas.width;

            // Ratio
            const imgHeight = (contentHeightPx * imgWidth) / contentWidthPx;

            let heightLeft = imgHeight;
            let position = 0;

            // First page
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= A4_HEIGHT_MM;

            // Multi-page slicing
            while (heightLeft > 5) { // 5mm threshold
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

    // Restore user's scroll position
    window.scrollTo(0, originalScrollPos);

    pdf.save(fileName);
};
