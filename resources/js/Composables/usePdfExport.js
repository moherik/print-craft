import { PAPER_SIZES } from './usePaperSize';

/**
 * Generate PDF from an HTML element containing multiple .print-canvas pages.
 * Uses jsPDF + dom-to-image-more for sharp, WYSIWYG output.
 *
 * Before rendering each page, adds an `.exporting` class to the page element
 * which triggers CSS rules that clean up Tailwind artifacts (ghost borders,
 * ring shadows, etc.) so the PDF output is clean.
 */
export async function exportToPdf(element, options = {}) {
    const {
        paperSize = 'A4',
        orientation = 'portrait',
        filename = 'printcraft-document',
        quality = 4,
    } = options;

    const format = paperSize === 'F4' ? [215, 330] : paperSize.toLowerCase();

    const pages = element.querySelectorAll('.print-canvas');
    if (!pages.length) {
        console.error('No .print-canvas pages found for PDF export.');
        return false;
    }

    try {
        const { jsPDF } = await import('jspdf');
        const domtoimage = await import('dom-to-image-more');

        const pdf = new jsPDF({
            unit: 'mm',
            format: format,
            orientation: orientation,
            compress: true,
        });

        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];

            // Add exporting class to clean up Tailwind artifacts
            page.classList.add('exporting');

            // Wait a tick for styles to apply and layout to recalculate
            await new Promise(r => setTimeout(r, 50));

            // Use offsetWidth/Height to get unscaled dimensions. 
            const pixelW = page.offsetWidth * quality;
            const pixelH = page.offsetHeight * quality;

            const dataUrl = await domtoimage.toPng(page, {
                width: pixelW,
                height: pixelH,
                style: {
                    transform: `scale(${quality})`,
                    transformOrigin: 'top left',
                },
                filter: (node) => {
                    if (!node.classList) return true;
                    return !node.classList.contains('no-print');
                },
            });

            // Remove exporting class to restore editor view
            page.classList.remove('exporting');

            if (i > 0) pdf.addPage(format, orientation);
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
        }

        pdf.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error('PDF export failed:', error);
        // Clean up exporting class in case of error
        pages.forEach(p => p.classList.remove('exporting'));
        return false;
    }
}

/**
 * Trigger browser print
 */
export function triggerPrint() {
    window.print();
}
