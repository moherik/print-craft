<script setup>
import { computed, ref } from 'vue';
import { getPaperDimensionsPx } from '@/Composables/usePaperSize';
import WidgetRenderer from '@/Components/Widgets/WidgetRenderer.vue';
import { GripVertical } from 'lucide-vue-next';
import draggable from 'vuedraggable';

const props = defineProps({
    paperSize: { type: String, default: 'A4' },
    orientation: { type: String, default: 'portrait' },
    gridCols: { type: Number, default: 1 },
    gridRows: { type: Number, default: 1 },
    marginMm: { type: Number, default: 5 },
    guideMode: { type: String, default: 'crop' },
    showCropMarks: { type: Boolean, default: true },
    zoom: { type: Number, default: 0.7 },
    isSynced: { type: Boolean, default: true },
    lineSpacing: { type: Number, default: 1.15 },
    gridGapMm: { type: Number, default: 0 },
    cells: { type: Array, default: () => [[]] },
    selectedWidgetPath: Array,
    selectedCellIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['select-widget', 'update-widget', 'remove-widget', 'reorder-widgets', 'open-photo-editor']);
const canvasContainer = ref(null);
const isDragging = ref(false);

defineExpose({
    getPrintElement() { return canvasContainer.value; }
});

// ─── Paper dimensions ───
const dims = computed(() => getPaperDimensionsPx(props.paperSize, props.orientation));
const m = computed(() => props.marginMm || 0);
const w = computed(() => dims.value.widthMm || 210);
const h = computed(() => dims.value.heightMm || 297);
const cl = 10;

// ─── Layout ───
const isGrid = computed(() => props.gridCols > 1 || props.gridRows > 1);
const cellsPerPage = computed(() => props.gridCols * props.gridRows);
const totalPages = computed(() => Math.max(1, Math.ceil(props.cells.length / cellsPerPage.value)));
const spacingMm = computed(() => ((props.lineSpacing - 1) * 4) + 'mm');

function getCellsForPage(pageIdx) {
    const start = (pageIdx - 1) * cellsPerPage.value;
    const pageCells = props.cells.slice(start, start + cellsPerPage.value);

    // Fill remaining slots in grid to keep layout consistent
    while (pageCells.length < cellsPerPage.value) {
        pageCells.push([]);
    }
    return pageCells;
}

function absCellIdx(pIdx, cIdx = 0) {
    return (pIdx - 1) * cellsPerPage.value + cIdx;
}

// ─── Guide Lines ───
const guideLines = computed(() => {
    const M = m.value, W = w.value, H = h.value, C = cl, G = props.gridGapMm;
    const lines = [];

    // Base Margin Guides
    if (props.guideMode === 'crop') {
        lines.push(
            { x1: M, y1: 0, x2: M, y2: C },
            { x1: 0, y1: M, x2: C, y2: M },
            { x1: W - M, y1: 0, x2: W - M, y2: C },
            { x1: W, y1: M, x2: W - C, y2: M },
            { x1: M, y1: H, x2: M, y2: H - C },
            { x1: 0, y1: H - M, x2: C, y2: H - M },
            { x1: W - M, y1: H, x2: W - M, y2: H - C },
            { x1: W, y1: H - M, x2: W - C, y2: H - M }
        );
    } else if (props.guideMode === 'full') {
        lines.push(
            { x1: M, y1: 0, x2: M, y2: H },
            { x1: 0, y1: M, x2: W, y2: M },
            { x1: W - M, y1: 0, x2: W - M, y2: H },
            { x1: 0, y1: H - M, x2: W, y2: H - M }
        );
    }

    // Grid Guides
    if (props.guideMode !== 'none') {
        const innerW = W - (2 * M);
        const innerH = H - (2 * M);

        // Exact physical sizes of items
        const itemW = (innerW - (props.gridCols - 1) * G) / props.gridCols;
        const itemH = (innerH - (props.gridRows - 1) * G) / props.gridRows;

        // Vertical Grid Marks
        for (let i = 1; i <= props.gridCols; i++) {
            // Lines at start and end of each item
            const x1 = M + (i - 1) * (itemW + G);
            const x2 = x1 + itemW;

            // Only draw interior lines to avoid duplicating margin lines
            if (i > 1) {
                const drawX = x1;
                if (props.guideMode === 'full') lines.push({ x1: drawX, y1: 0, x2: drawX, y2: H });
                else lines.push({ x1: drawX, y1: 0, x2: drawX, y2: C }, { x1: drawX, y1: H, x2: drawX, y2: H - C });
            }
            if (i < props.gridCols) {
                const drawX = x2;
                if (props.guideMode === 'full') lines.push({ x1: drawX, y1: 0, x2: drawX, y2: H });
                else lines.push({ x1: drawX, y1: 0, x2: drawX, y2: C }, { x1: drawX, y1: H, x2: drawX, y2: H - C });
            }
        }

        // Horizontal Grid Marks
        for (let i = 1; i <= props.gridRows; i++) {
            const y1 = M + (i - 1) * (itemH + G);
            const y2 = y1 + itemH;

            if (i > 1) {
                const drawY = y1;
                if (props.guideMode === 'full') lines.push({ x1: 0, y1: drawY, x2: W, y2: drawY });
                else lines.push({ x1: 0, y1: drawY, x2: C, y2: drawY }, { x1: W, y1: drawY, x2: W - C, y2: drawY });
            }
            if (i < props.gridRows) {
                const drawY = y2;
                if (props.guideMode === 'full') lines.push({ x1: 0, y1: drawY, x2: W, y2: drawY });
                else lines.push({ x1: 0, y1: drawY, x2: C, y2: drawY }, { x1: W, y1: drawY, x2: W - C, y2: drawY });
            }
        }
    }

    return lines;
});

function handleDraggableChange(evt, cellIdx) {
    if (evt.moved || evt.added) {
        emit('reorder-widgets', cellIdx, [...props.cells[cellIdx]]);
    }
}

function onDragStart() { isDragging.value = true; }
function onDragEnd() { isDragging.value = false; }
</script>

<template>
    <div ref="canvasContainer" class="mx-auto print:!w-auto print:!h-auto print-reset-zoom" :style="{ zoom: zoom }"
        @click.stop>
        <div class="zoom-wrapper">

            <div v-for="pIdx in totalPages" :key="pIdx"
                class="page-container relative mb-12 print:mb-0 no-print-shadow">

                <!--
                    PRINT-CANVAS: This is the element captured for PDF.
                    Kept intentionally simple — just a box with padding, no absolute positioning.
                -->
                <div class="print-canvas bg-white box-border relative border-none border-0" :style="{
                    width: w + 'mm',
                    height: h + 'mm',
                    padding: m + 'mm',
                }">

                    <!-- Guide Marks (z-0 so it never blocks drag) -->
                    <svg v-if="guideMode !== 'none'" class="absolute inset-0 w-full h-full pointer-events-none z-0"
                        style="overflow:visible">
                        <line v-for="(ln, li) in guideLines" :key="li" :x1="ln.x1 + 'mm'" :y1="ln.y1 + 'mm'"
                            :x2="ln.x2 + 'mm'" :y2="ln.y2 + 'mm'" stroke="#94a3b8" stroke-width="0.1mm"
                            :stroke-dasharray="guideMode === 'crop' ? 'none' : '0.5 1'" />
                    </svg>

                    <!-- Cell grid (1×1 when not grid) -->
                    <div class="w-full h-full flex flex-wrap relative z-10" :style="{
                        lineHeight: lineSpacing,
                        gap: gridGapMm + 'mm'
                    }">

                        <div v-for="(cellWidgets, cIdx) in getCellsForPage(pIdx)" :key="cIdx"
                            @click="emit('select-widget', null, absCellIdx(pIdx, cIdx))"
                            class="flex flex-col relative box-border" :class="[
                                { 'bg-red-50/50 ring-1 ring-inset ring-red-100 print:!bg-transparent print:!ring-0': !isSynced && selectedCellIndex === absCellIdx(pIdx, cIdx) }
                            ]" :style="{
                                width: `calc((100% - ${(gridCols - 1) * gridGapMm}mm) / ${gridCols})`,
                                height: `calc((100% - ${(gridRows - 1) * gridGapMm}mm) / ${gridRows})`,
                                gap: spacingMm,
                            }">

                            <!-- Cell badge -->
                            <div v-if="isGrid && !isSynced"
                                class="absolute top-0.5 right-0.5 text-[8px] text-slate-300 no-print font-bold">
                                #{{ absCellIdx(pIdx, cIdx) + 1 }}
                            </div>

                            <!-- Widget list -->
                            <draggable :list="cellWidgets" group="widgets" item-key="index" handle=".drag-handle"
                                @change="(evt) => handleDraggableChange(evt, absCellIdx(pIdx, cIdx))"
                                @start="onDragStart" @end="onDragEnd" ghost-class="sortable-ghost"
                                drag-class="sortable-drag" class="flex-1 flex flex-col drop-zone w-full h-full"
                                :class="{ 'drop-zone-active': isDragging }" :style="{ gap: spacingMm }">

                                <template #item="{ element: widget, index: wIdx }">
                                    <div class="relative group/root" :class="[
                                        { 'z-10': selectedWidgetPath?.[0] === wIdx && selectedWidgetPath?.length === 1 },
                                        { 'flex-1 w-full h-full flex flex-col': widget.type === 'image' }
                                    ]">

                                        <!-- Drag handle (editor only) -->
                                        <div
                                            class="absolute top-1/2 -translate-y-1/2 -left-7 opacity-0 group-hover/root:opacity-100 transition-opacity z-20 no-print">
                                            <button @click.stop="emit('select-widget', [wIdx], absCellIdx(pIdx, cIdx))"
                                                class="drag-handle p-0.5 text-slate-400 hover:text-red-600 bg-white shadow-sm border border-slate-200 rounded cursor-grab active:cursor-grabbing"
                                                title="Drag to reorder" tabindex="-1">
                                                <GripVertical class="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <WidgetRenderer :widget="widget" :allWidgets="cellWidgets" :index="wIdx"
                                            :path="[wIdx]" :selectedPath="selectedWidgetPath" :compact="isGrid"
                                            :cellIndex="absCellIdx(pIdx, cIdx)" :selectedCellIndex="selectedCellIndex"
                                            @select-widget="(path) => emit('select-widget', path, absCellIdx(pIdx, cIdx))"
                                            @update-widget="(path, updates) => emit('update-widget', path, updates, absCellIdx(pIdx, cIdx))"
                                            @open-photo-editor="(payload) => emit('open-photo-editor', payload)" />
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                </div>

                <!-- Page label (editor only) -->
                <div
                    class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 text-[10px] font-bold text-slate-400 no-print uppercase tracking-widest z-40">
                    Halaman {{ pIdx }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@media print {
    .no-print-border {
        border-color: transparent !important;
        border-style: none !important;
    }
}

.print-canvas {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    background-color: white !important;
}


@media screen {
    .no-print-shadow {
        box-shadow: 0 10px 50px -12px rgba(0, 0, 0, 0.25);
    }
}

@media print {
    .page-container {
        page-break-after: always;
        break-after: page;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
    }

    .page-container:last-child {
        page-break-after: auto;
        break-after: auto;
    }
}

/* Drag & Drop feedback */
.sortable-ghost {
    opacity: 0.4;
    background: #fef2f2;
    border: 2px dashed #fca5a5;
    border-radius: 4px;
}

.sortable-drag {
    opacity: 0.9;
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    transform: rotate(1deg);
}

/* Drop zone highlight during drag */
.drop-zone {
    transition: outline 0.15s ease, outline-offset 0.15s ease;
    outline: 2px solid transparent;
    outline-offset: -2px;
    border-radius: 2px;
}

.drop-zone-active {
    outline: 2px dashed #93c5fd;
    outline-offset: -2px;
    background: rgba(219, 234, 254, 0.15);
}
</style>
