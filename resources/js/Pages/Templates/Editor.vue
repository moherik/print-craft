<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { getTemplateBySlug, CATEGORIES } from '@/Data/templates';
import { PAPER_SIZES, mmToPx, getPaperDimensionsPx } from '@/Composables/usePaperSize';
import { exportToPdf, triggerPrint } from '@/Composables/usePdfExport';
import EditorToolbar from '@/Components/Editor/EditorToolbar.vue';
import FloatingToolbar from '@/Components/Editor/FloatingToolbar.vue';
import EditorCanvas from '@/Components/Editor/EditorCanvas.vue';
import WidgetSidebar from '@/Components/Editor/WidgetSidebar.vue';
import PropertiesPanel from '@/Components/Editor/PropertiesPanel.vue';
import { WIDGET_DEFAULTS } from '@/Data/widgets';

const props = defineProps({ templateSlug: String });

const template = computed(() => getTemplateBySlug(props.templateSlug));
const category = computed(() => template.value ? CATEGORIES.find(c => c.id === template.value.categoryId) : null);

// Editor state
const paperSize = ref('A4');
const orientation = ref('portrait');
const gridCols = ref(1);
const gridRows = ref(1);
const marginMm = ref(5);
const guideMode = ref('crop'); // 'none', 'crop', 'full'
const zoom = ref(0.7);
const isSynced = ref(true);
const lineSpacing = ref(1.15);
const selectedCellIndex = ref(0);
const selectedWidgetPath = ref(null); // Array like [wIdx] or [wIdx, colIdx, childIdx]
const canvasRef = ref(null);
const scrollContainerRef = ref(null);
const isExporting = ref(false);

// Widgets per cell (array of arrays)
const cells = ref([[]]);

// History & Clipboard
const clipboard = ref(null);
const history = ref([]);
const historyIndex = ref(-1);
let isUndoing = false;
let historyTimeout = null;

function saveHistory() {
    if (isUndoing) return;
    if (historyTimeout) clearTimeout(historyTimeout);
    historyTimeout = setTimeout(() => {
        if (historyIndex.value < history.value.length - 1) {
            history.value = history.value.slice(0, historyIndex.value + 1);
        }
        history.value.push(JSON.parse(JSON.stringify(cells.value)));
        if (history.value.length > 50) history.value.shift();
        historyIndex.value = history.value.length - 1;
    }, 400);
}

function undo() {
    if (historyIndex.value > 0) {
        isUndoing = true;
        historyIndex.value--;
        cells.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
        selectedWidgetPath.value = null;
        nextTick(() => { isUndoing = false; });
    }
}

function redo() {
    if (historyIndex.value < history.value.length - 1) {
        isUndoing = true;
        historyIndex.value++;
        cells.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
        selectedWidgetPath.value = null;
        nextTick(() => { isUndoing = false; });
    }
}

watch(cells, () => saveHistory(), { deep: true, immediate: true });

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);

onMounted(() => {
    if (template.value) {
        paperSize.value = template.value.paperSize;
        orientation.value = template.value.orientation;
        gridCols.value = template.value.gridCols;
        gridRows.value = template.value.gridRows;

        const initialWidgets = JSON.parse(JSON.stringify(template.value.widgets || []));

        if (template.value.defaultPages) {
            cells.value = Array.from({ length: template.value.defaultPages }, (_, i) => {
                const widgets = JSON.parse(JSON.stringify(initialWidgets));

                if (template.value.autoIncrementMonth) {
                    widgets.forEach(widget => {
                        if (widget.type === 'calendar') {
                            let newMonth = (widget.month || 1) + i;
                            let newYear = widget.year || new Date().getFullYear();

                            while (newMonth > 12) {
                                newMonth -= 12;
                                newYear += 1;
                            }
                            widget.month = newMonth;
                            widget.year = newYear;
                        }
                    });
                }
                return widgets;
            });
        } else {
            // Standard initialization
            const count = gridCols.value * gridRows.value;
            cells.value = Array.from({ length: count }, () => JSON.parse(JSON.stringify(initialWidgets)));
        }
    }
    
    window.addEventListener('keydown', handleKeydown, { passive: false });
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

function addPage() {
    const count = gridCols.value * gridRows.value;
    const newCells = Array.from({ length: count }, () => JSON.parse(JSON.stringify(cells.value[0] || [])));
    cells.value = [...cells.value, ...newCells];
}

function removePage() {
    const count = gridCols.value * gridRows.value;
    if (cells.value.length > count) {
        cells.value = cells.value.slice(0, cells.value.length - count);
    }
}

const totalPagesCount = computed(() => {
    const count = gridCols.value * gridRows.value;
    return Math.max(1, Math.ceil(cells.value.length / count));
});

watch([gridCols, gridRows], ([cols, rows]) => {
    const count = cols * rows;
    if (cells.value.length < count) {
        // Add new cells by copying the first one
        const newCells = Array.from({ length: count - cells.value.length }, () => JSON.parse(JSON.stringify(cells.value[0] || [])));
        cells.value = [...cells.value, ...newCells];
    } else if (cells.value.length > count) {
        cells.value = cells.value.slice(0, count);
    }
});

const selectedWidget = computed(() => {
    if (selectedCellIndex.value === null || !selectedWidgetPath.value) return null;
    let target = cells.value[selectedCellIndex.value];
    const path = selectedWidgetPath.value;

    if (path.length === 1) return target[path[0]];
    if (path.length === 3 && target[path[0]]?.children) {
        return target[path[0]].children[path[1]]?.[path[2]];
    }
    return null;
});

function addWidget(type) {
    const newWidget = { ...(WIDGET_DEFAULTS[type] || WIDGET_DEFAULTS.text) };
    if (isSynced.value) {
        cells.value.forEach(cell => cell.push(JSON.parse(JSON.stringify(newWidget))));
    } else {
        cells.value[selectedCellIndex.value].push(JSON.parse(JSON.stringify(newWidget)));
    }
}

function handleReorderWidgets(cellIndex, newList) {
    if (isSynced.value) {
        // Sync the order across all cells
        cells.value.forEach(cell => {
            // This is a bit complex if cells have different content, 
            // but usually they are synced.
            cell.splice(0, cell.length, ...JSON.parse(JSON.stringify(newList)));
        });
    } else {
        cells.value[cellIndex] = newList;
    }
}

function removeWidget(path) {
    function applyRemove(cell) {
        if (!cell || !path || !path.length) return;
        if (path.length === 1) {
            cell.splice(path[0], 1);
        } else if (path.length === 3) {
            const w = cell[path[0]];
            if (w?.children?.[path[1]]) {
                w.children[path[1]].splice(path[2], 1);
            }
        }
    }
    if (isSynced.value) {
        cells.value.forEach(applyRemove);
    } else {
        applyRemove(cells.value[selectedCellIndex.value]);
    }
    selectedWidgetPath.value = null;
}

function updateWidget(path, updates, cellIndex = null) {
    const targetCellIdx = cellIndex !== null ? cellIndex : selectedCellIndex.value;

    function applyUpdate(cell) {
        if (!cell || !path || !path.length) return;
        if (path.length === 1) {
            if (cell[path[0]]) cell[path[0]] = { ...cell[path[0]], ...updates };
        } else if (path.length === 3) {
            const w = cell[path[0]];
            if (w?.children?.[path[1]]?.[path[2]]) {
                w.children[path[1]][path[2]] = { ...w.children[path[1]][path[2]], ...updates };
            }
        }
    }

    if (isSynced.value) {
        cells.value.forEach(applyUpdate);
    } else {
        applyUpdate(cells.value[targetCellIdx]);
    }
}

function handleSelectWidget(path, cIndex) {
    selectedWidgetPath.value = path;
    selectedCellIndex.value = cIndex;
}

async function handleExportPdf() {
    if (!canvasRef.value) return;
    isExporting.value = true;
    try {
        const el = canvasRef.value.getPrintElement();
        if (el) {
            await exportToPdf(el, {
                paperSize: paperSize.value,
                orientation: orientation.value,
                filename: `printcraft-${template.value?.slug || 'document'}`,
                quality: 3, // Increase quality for better print
                margins: 0,
            });
        }
    } finally {
        isExporting.value = false;
    }
}

function handlePrint() {
    triggerPrint();
}

function handleWheelZoom(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        zoom.value = Math.max(0.3, Math.min(2, zoom.value + delta));
    }
}

function handleKeydown(e) {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const isEditingText = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement?.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault();
        const delta = (e.key === '-') ? -0.1 : 0.1;
        zoom.value = Math.max(0.3, Math.min(2, zoom.value + delta));
        return;
    }
    
    // Fit to page (Ctrl+0)
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleFitPage();
        return;
    }

    // Delete/Backspace to remove selected widget
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText && selectedWidgetPath.value) {
        e.preventDefault();
        removeWidget(selectedWidgetPath.value);
        return;
    }

    // Undo (Ctrl+Z)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isEditingText) {
        e.preventDefault();
        undo();
        return;
    }

    // Redo (Ctrl+Y or Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isEditingText) {
        e.preventDefault();
        redo();
        return;
    }

    // Copy (Ctrl+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isEditingText && selectedWidget.value) {
        e.preventDefault();
        clipboard.value = JSON.parse(JSON.stringify(selectedWidget.value));
        return;
    }

    // Paste (Ctrl+V)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isEditingText && clipboard.value) {
        e.preventDefault();
        const newWidget = JSON.parse(JSON.stringify(clipboard.value));
        if (isSynced.value) {
            cells.value.forEach(cell => cell.push(JSON.parse(JSON.stringify(newWidget))));
        } else {
            cells.value[selectedCellIndex.value].push(JSON.parse(JSON.stringify(newWidget)));
        }
        return;
    }
}

function handleFitPage() {
    if (!scrollContainerRef.value) return;
    const paddingX = 64; // 32px padding on left/right
    const paddingY = 96; // Extra padding for top/bottom to account for floating toolbar
    const availableWidth = scrollContainerRef.value.clientWidth - paddingX;
    const availableHeight = scrollContainerRef.value.clientHeight - paddingY;
    const dims = getPaperDimensionsPx(paperSize.value, orientation.value);
    
    // Fit to whichever dimension is more restrictive (width or height)
    const scaleX = availableWidth / dims.width;
    const scaleY = availableHeight / dims.height;
    
    const scale = Math.min(scaleX, scaleY);
    zoom.value = Math.max(0.3, Math.min(2, scale));
}
</script>

<template>

    <Head :title="template?.name || 'Editor'" />

    <AppLayout hideHeader hideFooter>
        <div class="flex flex-col h-screen bg-slate-100 print:block print:h-auto print:overflow-visible">
            <!-- Main Header Toolbar -->
            <EditorToolbar
                v-model:paperSize="paperSize"
                v-model:orientation="orientation"
                v-model:gridCols="gridCols"
                v-model:gridRows="gridRows"
                v-model:marginMm="marginMm"
                v-model:lineSpacing="lineSpacing"
                v-model:guideMode="guideMode"
                :template="template"
                :category="category"
                :isExporting="isExporting"
                @print="handlePrint"
                @export-pdf="handleExportPdf"
            />

            <div class="flex flex-1 overflow-hidden relative print:block print:overflow-visible">
                <!-- Widget Sidebar -->
                <WidgetSidebar class="no-print hidden lg:block" @add-widget="addWidget" />

                <!-- Canvas Wrapper -->
                <div class="flex-1 flex flex-col relative overflow-hidden bg-slate-200 print:bg-white print:block print:overflow-visible">
                    
                    <!-- Canvas Area -->
                    <div ref="scrollContainerRef"
                        class="flex-1 overflow-auto flex flex-col p-4 md:p-8 relative print:static print:p-0 print:block print:overflow-visible"
                        @wheel.ctrl.prevent="handleWheelZoom"
                        @wheel.meta.prevent="handleWheelZoom"
                        @click="selectedWidgetPath = null">
                        <div class="absolute inset-0 pattern-dots opacity-50 pointer-events-none no-print"></div>
                        <EditorCanvas ref="canvasRef" :paperSize="paperSize" :orientation="orientation" :gridCols="gridCols"
                        :gridRows="gridRows" :marginMm="marginMm" :guideMode="guideMode" :zoom="zoom"
                        :isSynced="isSynced" :lineSpacing="lineSpacing" :cells="cells"
                            :selectedWidgetPath="selectedWidgetPath" :selectedCellIndex="selectedCellIndex"
                            @select-widget="handleSelectWidget" @update-widget="updateWidget" @remove-widget="removeWidget"
                            @reorder-widgets="handleReorderWidgets" class="z-10 relative" />
                    </div>

                    <!-- Floating Bottom Toolbar -->
                    <FloatingToolbar
                        v-model:isSynced="isSynced"
                        v-model:zoom="zoom"
                        :totalPages="totalPagesCount"
                        :canUndo="canUndo"
                        :canRedo="canRedo"
                        @add-page="addPage"
                        @remove-page="removePage"
                        @fit-page="handleFitPage"
                        @undo="undo"
                        @redo="redo"
                    />
                </div>

                <!-- Properties Panel -->
                <PropertiesPanel class="no-print hidden lg:block"
                    :widget="selectedWidget" :template="template"
                    @update="(updates) => updateWidget(selectedWidgetPath, updates)" @close="selectedWidgetPath = null"
                    @remove="removeWidget(selectedWidgetPath)" />
            </div>
        </div>
    </AppLayout>
</template>

<style>
.pattern-dots {
    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
    background-size: 20px 20px;
}
</style>
