<script setup>
import { computed, ref } from 'vue';
import { getPaperDimensionsPx, mmToPx } from '@/Composables/usePaperSize';
import WidgetRenderer from '@/Components/Widgets/WidgetRenderer.vue';
import { Settings, Trash2 } from 'lucide-vue-next';
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
const printEl = ref(null);

function handleDraggableChange(evt, cellIdx) {
    if (evt.moved) {
        const newList = [...props.cells[cellIdx]];
        emit('reorder-widgets', cellIdx, newList);
    } else if (evt.added) {
        const newList = [...props.cells[cellIdx]];
        emit('reorder-widgets', cellIdx, newList);
    }
}
const dims = computed(() => getPaperDimensionsPx(props.paperSize, props.orientation));
const cropMarkLen = 10;

defineExpose({
    getPrintElement() { return canvasContainer.value; }
});

const isGridTemplate = computed(() => props.gridCols > 1 || props.gridRows > 1);
const cellCount = computed(() => props.gridCols * props.gridRows);

// Multi-page logic
const cellsPerPage = computed(() => props.gridCols * props.gridRows);
const totalPages = computed(() => Math.max(1, Math.ceil(props.cells.length / cellsPerPage.value)));

function getCellsForPage(pageIdx) {
    const start = (pageIdx - 1) * cellsPerPage.value;
    return props.cells.slice(start, start + cellsPerPage.value);
}

// Safe access for MM values
const m = computed(() => props.marginMm || 0);
const w = computed(() => dims.value.widthMm || 210);
const h = computed(() => dims.value.heightMm || 297);
const cl = computed(() => cropMarkLen);
</script>

<template>
    <div ref="canvasContainer" class="inline-block zoom-wrapper" :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }">
        
        <!-- Render each page -->
        <div v-for="pIdx in totalPages" :key="pIdx" class="page-container relative mb-12 print:mb-0 shadow-2xl shadow-black/30 no-print-shadow">
            <!-- Paper -->
            <div class="print-canvas relative bg-white overflow-hidden box-border"
                :style="{ 
                    width: w + 'mm', 
                    height: h + 'mm',
                    minWidth: w + 'mm',
                    minHeight: h + 'mm',
                }">

                <!-- Crop marks (only show on editor) -->
                <svg v-if="showCropMarks" class="absolute inset-0 w-full h-full pointer-events-none z-30 no-print" style="overflow:visible">
                    <!-- Top-left -->
                    <line :x1="m + 'mm'" y1="0" :x2="m + 'mm'" :y2="cl + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <line x1="0" :y1="m + 'mm'" :x2="cl + 'mm'" :y2="m + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <!-- Top-right -->
                    <line :x1="(w - m) + 'mm'" y1="0" :x2="(w - m) + 'mm'" :y2="cl + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <line :x1="w + 'mm'" :y1="m + 'mm'" :x2="(w - cl) + 'mm'" :y2="m + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <!-- Bottom-left -->
                    <line :x1="m + 'mm'" :y1="h + 'mm'" :x2="m + 'mm'" :y2="(h - cl) + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <line x1="0" :y1="(h - m) + 'mm'" :x2="cl + 'mm'" :y2="(h - m) + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <!-- Bottom-right -->
                    <line :x1="(w - m) + 'mm'" :y1="h + 'mm'" :x2="(w - m) + 'mm'" :y2="(h - cl) + 'mm'" stroke="#000" stroke-width="0.1mm" />
                    <line :x1="w + 'mm'" :y1="(h - m) + 'mm'" :x2="(w - cl) + 'mm'" :y2="(h - m) + 'mm'" stroke="#000" stroke-width="0.1mm" />
                </svg>

                <!-- Margin area / content area -->
                <div class="absolute text-black box-border"
                    :style="{
                        top: m + 'mm', 
                        left: m + 'mm',
                        right: m + 'mm', 
                        bottom: m + 'mm',
                    }">

                    <!-- Grid layout -->
                    <div v-if="isGridTemplate" class="w-full h-full flex flex-wrap content-start">
                        <div v-for="(cellWidgets, cIdx) in getCellsForPage(pIdx)" :key="cIdx"
                            @click="emit('select-widget', null, (pIdx - 1) * cellsPerPage + cIdx)"
                            class="border border-dashed border-slate-200 overflow-hidden flex flex-col relative no-print-border box-border print:!border-transparent"
                            :class="{ 'bg-red-50/50 ring-1 ring-inset ring-red-100 print:!bg-transparent print:!ring-0': !isSynced && selectedCellIndex === ((pIdx - 1) * cellsPerPage + cIdx) }"
                            :style="{ 
                                width: (100 / gridCols) + '%', 
                                height: (100 / gridRows) + '%',
                                gap: ((lineSpacing - 1) * 4) + 'mm',
                                lineHeight: lineSpacing
                            }">
                            
                            <div v-if="!isSynced" class="absolute top-0.5 right-0.5 text-[8px] text-slate-300 no-print font-bold">#{{ (pIdx - 1) * cellsPerPage + cIdx + 1 }}</div>

                            <draggable 
                                :list="cellWidgets" 
                                group="widgets"
                                item-key="index"
                                handle=".handle-selector"
                                @change="(evt) => handleDraggableChange(evt, (pIdx - 1) * cellsPerPage + cIdx)"
                                class="flex-1 flex flex-col"
                                :style="{ gap: ((lineSpacing - 1) * 4) + 'mm' }"
                            >
                                <template #item="{ element: widget, index: wIdx }">
                                    <div class="relative group/root"
                                         :class="{ 'z-10': selectedWidgetPath?.[0] === wIdx && selectedWidgetPath?.length === 1 }">
                                        <div class="absolute top-1/2 -translate-y-1/2 -left-6 opacity-0 group-hover/root:opacity-100 transition-opacity z-20 no-print">
                                            <button @click.stop="emit('select-widget', [wIdx], (pIdx - 1) * cellsPerPage + cIdx)" class="handle-selector p-1 text-slate-400 hover:text-red-600 bg-white shadow-sm border border-slate-200 rounded-md cursor-grab active:cursor-grabbing">
                                                <Settings class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <WidgetRenderer
                                            :widget="widget" 
                                            :allWidgets="cellWidgets"
                                            :index="wIdx" :path="[wIdx]" :selectedPath="selectedWidgetPath" :compact="true" :cellIndex="(pIdx - 1) * cellsPerPage + cIdx"
                                            @select-widget="(path) => emit('select-widget', path, (pIdx - 1) * cellsPerPage + cIdx)"
                                            @update-widget="(path, updates) => emit('update-widget', path, updates, (pIdx - 1) * cellsPerPage + cIdx)"
                                        />
                                    </div>
                                </template>
                            </draggable>
                        </div>
                    </div>

                    <!-- Single layout (treated as cells if gridCols=1, gridRows=1) -->
                    <div v-else class="w-full h-full flex flex-col" 
                        @click="emit('select-widget', null, pIdx - 1)"
                        :style="{ gap: ((lineSpacing - 1) * 4) + 'mm', lineHeight: lineSpacing }">
                        <draggable 
                            :list="getCellsForPage(pIdx)[0]" 
                            group="widgets"
                            item-key="index"
                            handle=".handle-selector"
                            @change="(evt) => handleDraggableChange(evt, pIdx - 1)"
                            class="w-full h-full flex flex-col"
                            :style="{ gap: ((lineSpacing - 1) * 4) + 'mm' }"
                        >
                            <template #item="{ element: widget, index: wIdx }">
                                <div class="relative group/root"
                                     :class="{ 'z-10': selectedWidgetPath?.[0] === wIdx && selectedWidgetPath?.length === 1 }">
                                    <div class="absolute top-1/2 -translate-y-1/2 -left-6 opacity-0 group-hover/root:opacity-100 transition-opacity z-20 no-print">
                                        <button @click.stop="emit('select-widget', [wIdx], pIdx - 1)" class="handle-selector p-1 text-slate-400 hover:text-red-600 bg-white shadow-sm border border-slate-200 rounded-md cursor-grab active:cursor-grabbing">
                                            <Settings class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <WidgetRenderer
                                        :widget="widget" 
                                        :allWidgets="getCellsForPage(pIdx)[0]"
                                        :index="wIdx" :path="[wIdx]" :selectedPath="selectedWidgetPath" :compact="false" :cellIndex="pIdx - 1"
                                        @select-widget="(path) => emit('select-widget', path, pIdx - 1)"
                                        @update-widget="(path, updates) => emit('update-widget', path, updates, pIdx - 1)"
                                    />
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
            
            <!-- Page Divider in UI -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 no-print text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Halaman {{ pIdx }}
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
        margin: 0 !important;
        padding: 0 !important;
    }
}
</style>
