<script setup>
import { computed, ref } from 'vue';
import { getPaperDimensionsPx } from '@/Composables/usePaperSize';
import WidgetRenderer from '@/Components/Widgets/WidgetRenderer.vue';
import { Settings } from 'lucide-vue-next';
import draggable from 'vuedraggable';

const props = defineProps({
    paperSize: { type: String, default: 'A4' },
    orientation: { type: String, default: 'portrait' },
    gridCols: { type: Number, default: 1 },
    gridRows: { type: Number, default: 1 },
    marginMm: { type: Number, default: 5 },
    showCropMarks: { type: Boolean, default: true },
    zoom: { type: Number, default: 0.7 },
    isSynced: { type: Boolean, default: true },
    lineSpacing: { type: Number, default: 1.5 },
    cells: { type: Array, default: () => [[]] },
    selectedWidgetPath: Array,
    selectedCellIndex: { type: Number, default: 0 },
});

const emit = defineEmits(['select-widget', 'update-widget', 'remove-widget', 'reorder-widgets']);
const canvasContainer = ref(null);

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
    return props.cells.slice(start, start + cellsPerPage.value);
}

function absCellIdx(pIdx, cIdx = 0) {
    return (pIdx - 1) * cellsPerPage.value + cIdx;
}

// ─── Crop marks ───
const cropMarks = computed(() => {
    const M = m.value, W = w.value, H = h.value, C = cl;
    return [
        { x1: M, y1: 0, x2: M, y2: C },
        { x1: 0, y1: M, x2: C, y2: M },
        { x1: W - M, y1: 0, x2: W - M, y2: C },
        { x1: W, y1: M, x2: W - C, y2: M },
        { x1: M, y1: H, x2: M, y2: H - C },
        { x1: 0, y1: H - M, x2: C, y2: H - M },
        { x1: W - M, y1: H, x2: W - M, y2: H - C },
        { x1: W, y1: H - M, x2: W - C, y2: H - M },
    ];
});

function handleDraggableChange(evt, cellIdx) {
    if (evt.moved || evt.added) {
        emit('reorder-widgets', cellIdx, [...props.cells[cellIdx]]);
    }
}
</script>

<template>
    <div ref="canvasContainer" class="inline-block print:!w-auto print:!h-auto" :style="{
        width: w + 'mm',
        height: `calc(${zoom} * 100%)`,
        overflow: 'visible',
    }">
        <div class="zoom-wrapper" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }">

            <div v-for="pIdx in totalPages" :key="pIdx"
                class="page-container relative mb-12 print:mb-0 no-print-shadow">

                <!-- Crop marks (editor-only overlay, outside print-canvas capture) -->
                <svg v-if="showCropMarks" class="absolute inset-0 w-full h-full pointer-events-none z-30 no-print"
                    style="overflow:visible">
                    <line v-for="(ln, li) in cropMarks" :key="li" :x1="ln.x1 + 'mm'" :y1="ln.y1 + 'mm'"
                        :x2="ln.x2 + 'mm'" :y2="ln.y2 + 'mm'" stroke="#000" stroke-width="0.1mm" />
                </svg>

                <!--
                    PRINT-CANVAS: This is the element captured for PDF.
                    Kept intentionally simple — just a box with padding, no absolute positioning.
                -->
                <div class="print-canvas bg-white box-border" :style="{
                    width: w + 'mm',
                    height: h + 'mm',
                    padding: m + 'mm',
                }">
                    <!-- Cell grid (1×1 when not grid) -->
                    <div class="w-full h-full flex flex-wrap" :style="{ lineHeight: lineSpacing }">

                        <div v-for="(cellWidgets, cIdx) in getCellsForPage(pIdx)" :key="cIdx"
                            @click="emit('select-widget', null, absCellIdx(pIdx, cIdx))"
                            class="flex flex-col relative box-border" :class="[
                                isGrid ? 'border border-dashed border-slate-200 overflow-hidden no-print-border print:!border-transparent' : '',
                                { 'bg-red-50/50 ring-1 ring-inset ring-red-100 print:!bg-transparent print:!ring-0': !isSynced && selectedCellIndex === absCellIdx(pIdx, cIdx) }
                            ]" :style="{
                                width: (100 / gridCols) + '%',
                                height: (100 / gridRows) + '%',
                                gap: spacingMm,
                            }">

                            <!-- Cell badge -->
                            <div v-if="isGrid && !isSynced"
                                class="absolute top-0.5 right-0.5 text-[8px] text-slate-300 no-print font-bold">
                                #{{ absCellIdx(pIdx, cIdx) + 1 }}
                            </div>

                            <!-- Widget list -->
                            <draggable :list="cellWidgets" group="widgets" item-key="index" handle=".handle-selector"
                                @change="(evt) => handleDraggableChange(evt, absCellIdx(pIdx, cIdx))"
                                class="flex-1 flex flex-col" :class="{ 'w-full h-full': !isGrid }"
                                :style="{ gap: spacingMm }">

                                <template #item="{ element: widget, index: wIdx }">
                                    <div class="relative group/root"
                                        :class="{ 'z-10': selectedWidgetPath?.[0] === wIdx && selectedWidgetPath?.length === 1 }">

                                        <!-- Settings handle (editor only) -->
                                        <div
                                            class="absolute top-1/2 -translate-y-1/2 -left-6 opacity-0 group-hover/root:opacity-100 transition-opacity z-20 no-print">
                                            <button @click.stop="emit('select-widget', [wIdx], absCellIdx(pIdx, cIdx))"
                                                tabindex="-1"
                                                class="handle-selector p-1 text-slate-400 hover:text-red-600 bg-white shadow-sm border border-slate-200 rounded-md cursor-grab active:cursor-grabbing">
                                                <Settings class="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <WidgetRenderer :widget="widget" :allWidgets="cellWidgets" :index="wIdx"
                                            :path="[wIdx]" :selectedPath="selectedWidgetPath" :compact="isGrid"
                                            :cellIndex="absCellIdx(pIdx, cIdx)"
                                            @select-widget="(path) => emit('select-widget', path, absCellIdx(pIdx, cIdx))"
                                            @update-widget="(path, updates) => emit('update-widget', path, updates, absCellIdx(pIdx, cIdx))" />
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>
                </div>

                <!-- Page label (editor only) -->
                <div
                    class="absolute -bottom-8 left-1/2 -translate-x-1/2 no-print text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
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
</style>
