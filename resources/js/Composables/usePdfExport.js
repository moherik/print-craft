import html2pdf from 'html2pdf.js';
import { PAPER_SIZES } from './usePaperSize';

/**
 * Generate PDF from an HTML element
 */
export async function exportToPdf(element, options = {}) {
    const {
        paperSize = 'A4',
        orientation = 'portrait',
        filename = 'printcraft-document',
        quality = 2,
        margins = 0,
    } = options;

    const paper = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
    const format = paperSize === 'F4' ? [215, 330] : paperSize.toLowerCase();

    const opt = {
        margin: margins,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: quality,
            useCORS: true,
            allowTaint: true,
            logging: false,
        },
        jsPDF: {
            unit: 'mm',
            format: format,
            orientation: orientation,
        },
    };

    try {
        await html2pdf().set(opt).from(element).save();
        return true;
    } catch (error) {
        console.error('PDF export failed:', error);
        return false;
    }
}

/**
 * Trigger browser print
 */
export function triggerPrint() {
    window.print();
}
