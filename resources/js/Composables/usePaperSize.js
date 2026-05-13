/**
 * Paper size presets in millimeters
 */
export const PAPER_SIZES = {
    A4: { width: 210, height: 297, label: 'A4', unit: 'mm' },
    A5: { width: 148, height: 210, label: 'A5', unit: 'mm' },
    A6: { width: 105, height: 148, label: 'A6', unit: 'mm' },
    Letter: { width: 216, height: 279, label: 'Letter', unit: 'mm' },
    F4: { width: 215, height: 330, label: 'F4 (Folio)', unit: 'mm' },
};

/**
 * Convert mm to px at a given DPI (screen = 96dpi for preview)
 */
export function mmToPx(mm, dpi = 96) {
    return (mm / 25.4) * dpi;
}

/**
 * Convert px to mm
 */
export function pxToMm(px, dpi = 96) {
    return (px * 25.4) / dpi;
}

/**
 * Get paper dimensions in pixels for canvas rendering
 */
export function getPaperDimensionsPx(paperSize, orientation = 'portrait', dpi = 96) {
    const paper = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
    let w = paper.width;
    let h = paper.height;

    if (orientation === 'landscape') {
        [w, h] = [h, w];
    }

    return {
        width: mmToPx(w, dpi),
        height: mmToPx(h, dpi),
        widthMm: w,
        heightMm: h,
    };
}

/**
 * Standard margins in mm
 */
export const DEFAULT_MARGINS = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
};

/**
 * Calculate grid cell dimensions
 */
export function getGridCellDimensions(paperSize, orientation, cols, rows, margins = DEFAULT_MARGINS, gap = 2) {
    const paper = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
    let totalW = paper.width;
    let totalH = paper.height;

    if (orientation === 'landscape') {
        [totalW, totalH] = [totalH, totalW];
    }

    const usableW = totalW - margins.left - margins.right - (gap * (cols - 1));
    const usableH = totalH - margins.top - margins.bottom - (gap * (rows - 1));

    return {
        cellWidth: usableW / cols,
        cellHeight: usableH / rows,
        usableWidth: usableW,
        usableHeight: usableH,
        gap,
    };
}
