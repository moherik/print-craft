import { PAPER_SIZES } from "./usePaperSize";

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
        paperSize = "A4",
        orientation = "portrait",
        filename = "printcraft-document",
        quality = 4,
        margin = 0,
    } = options;

    const format = paperSize === "F4" ? [215, 330] : paperSize.toLowerCase();

    const pages = element.querySelectorAll(".print-canvas");
    if (!pages.length) {
        console.error("No .print-canvas pages found for PDF export.");
        return false;
    }

    try {
        const { jsPDF } = await import("jspdf");
        const domtoimage = await import("dom-to-image-more");

        const pxWidth = pages[0].offsetWidth;
        const pxHeight = pages[0].offsetHeight;

        const mmWidth = pxWidth * 0.264583;
        const mmHeight = pxHeight * 0.264583;

        console.log(mmWidth, mmHeight);

        const pdf = new jsPDF({
            unit: "mm",
            format: [mmWidth, mmHeight],
            orientation: orientation,
            compress: true,
        });

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];

            // Add exporting class to clean up Tailwind artifacts
            page.classList.add("exporting");

            // --- Fix Tailwind border bug for dom-to-image ---
            // Tailwind sets border-style: solid and border-width: 0 globally.
            // dom-to-image-more sometimes renders a faint border when scaling if border-style is solid.
            const allElements = page.querySelectorAll("*");
            const modifiedElements = [];

            allElements.forEach((el) => {
                const style = window.getComputedStyle(el);
                if (
                    style.borderTopWidth === "0px" &&
                    style.borderRightWidth === "0px" &&
                    style.borderBottomWidth === "0px" &&
                    style.borderLeftWidth === "0px"
                ) {
                    if (style.borderStyle !== "none") {
                        modifiedElements.push({
                            el,
                            oldStyle: el.style.getPropertyValue("border-style"),
                        });
                        el.style.setProperty(
                            "border-style",
                            "none",
                            "important",
                        );
                    }
                }
            });

            // Wait a tick for styles to apply and layout to recalculate
            await new Promise((r) => setTimeout(r, 50));

            const dataUrl = await domtoimage.toPng(page, {
                bgColor: "#ffffff",
                cacheBust: true,
                quality: 1,
                width: pxWidth * quality,
                height: pxHeight * quality,
                style: {
                    transform: `scale(${quality})`,
                    transformOrigin: "top left",
                    width: pxWidth + "px",
                    height: pxHeight + "px",
                },
                filter: (node) => {
                    if (!node.classList) return true;
                    return !node.classList.contains("no-print");
                },
            });

            // Remove exporting class to restore editor view
            page.classList.remove("exporting");

            // Restore original border styles
            modifiedElements.forEach(({ el, oldStyle }) => {
                if (oldStyle) {
                    el.style.setProperty("border-style", oldStyle);
                } else {
                    el.style.removeProperty("border-style");
                }
                if (!el.getAttribute("style")) el.removeAttribute("style");
            });

            if (i > 0) pdf.addPage([mmWidth, mmHeight], orientation);
            pdf.setPage(i + 1);
            pdf.addImage(
                dataUrl,
                "PNG",
                0,
                0,
                mmWidth,
                mmHeight,
                undefined,
                "FAST",
            );
        }

        pdf.save(`${filename}.pdf`);
        return true;
    } catch (error) {
        console.error("PDF export failed:", error);
        // Clean up exporting class in case of error
        pages.forEach((p) => p.classList.remove("exporting"));
        return false;
    }
}

/**
 * Trigger browser print
 */
export function triggerPrint() {
    window.print();
}
