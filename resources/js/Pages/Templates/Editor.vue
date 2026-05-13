<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted, nextTick } from 'vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { getTemplateBySlug, CATEGORIES } from '@/Data/templates';
import { PAPER_SIZES, mmToPx, getPaperDimensionsPx } from '@/Composables/usePaperSize';
import { exportToPdf, triggerPrint } from '@/Composables/usePdfExport';
import EditorToolbar from '@/Components/Editor/EditorToolbar.vue';
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
const showCropMarks = ref(true);
const zoom = ref(0.7);
const isSynced = ref(true);
const lineSpacing = ref(1.15);
const selectedCellIndex = ref(0);
const selectedWidgetPath = ref(null); // Array like [wIdx] or [wIdx, colIdx, childIdx]
const canvasRef = ref(null);
const isExporting = ref(false);

// Widgets per cell (array of arrays)
const cells = ref([[]]);

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

// Watch grid changes to adjust cells array
import { watch } from 'vue';
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
</script>

<template>
    <Head :title="template?.name || 'Editor'" />

    <AppLayout hideHeader hideFooter>
        <div class="flex flex-col h-screen bg-slate-100">
            <!-- Toolbar -->
            <EditorToolbar
                v-model:paperSize="paperSize"
                v-model:orientation="orientation"
                v-model:gridCols="gridCols"
                v-model:gridRows="gridRows"
                v-model:marginMm="marginMm"
                v-model:showCropMarks="showCropMarks"
                v-model:zoom="zoom"
                v-model:isSynced="isSynced"
                v-model:lineSpacing="lineSpacing"
                :template="template"
                :category="category"
                :isExporting="isExporting"
                :totalPages="totalPagesCount"
                @print="handlePrint"
                @export-pdf="handleExportPdf"
                @add-page="addPage"
                @remove-page="removePage"
            />

            <div class="flex flex-1 overflow-hidden">
                <!-- Widget Sidebar -->
                <WidgetSidebar
                    class="no-print hidden lg:block"
                    @add-widget="addWidget"
                />

                <!-- Canvas Area -->
                <div class="flex-1 overflow-auto bg-slate-200 flex items-start justify-center p-4 md:p-8 relative print:static print:p-0 print:bg-white print:block print:overflow-visible">
                    <div class="absolute inset-0 pattern-dots opacity-50 pointer-events-none no-print"></div>
                    <EditorCanvas
                        ref="canvasRef"
                        :paperSize="paperSize"
                        :orientation="orientation"
                        :gridCols="gridCols"
                        :gridRows="gridRows"
                        :marginMm="marginMm"
                        :showCropMarks="showCropMarks"
                        :zoom="zoom"
                        :isSynced="isSynced"
                        :lineSpacing="lineSpacing"
                        :cells="cells"
                        :selectedWidgetPath="selectedWidgetPath"
                        :selectedCellIndex="selectedCellIndex"
                        @select-widget="handleSelectWidget"
                        @update-widget="updateWidget"
                        @remove-widget="removeWidget"
                        @reorder-widgets="handleReorderWidgets"
                        class="z-10 relative"
                    />
                </div>

                <!-- Properties Panel -->
                <PropertiesPanel
                    v-if="selectedWidget && selectedWidgetPath"
                    class="no-print hidden lg:block"
                    :widget="selectedWidget"
                    :template="template"
                    @update="(updates) => updateWidget(selectedWidgetPath, updates)"
                    @close="selectedWidgetPath = null"
                    @remove="removeWidget(selectedWidgetPath)"
                />
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
