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
import EditorToast from '@/Components/Editor/EditorToast.vue';
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
const toastRef = ref(null);
const isDirty = ref(false);

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

// ─── LocalStorage Auto-save ───
const STORAGE_KEY = computed(() => `printcraft-editor-${props.templateSlug}`);
let autoSaveTimer = null;

function autoSave() {
    if (!isDirty.value) return;
    try {
        const state = {
            cells: cells.value,
            paperSize: paperSize.value,
            orientation: orientation.value,
            gridCols: gridCols.value,
            gridRows: gridRows.value,
            marginMm: marginMm.value,
            guideMode: guideMode.value,
            lineSpacing: lineSpacing.value,
            savedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY.value, JSON.stringify(state));
        isDirty.value = false;
    } catch (e) { /* quota exceeded or private mode */ }
}

function loadSavedState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY.value);
        if (!raw) return null;
        const state = JSON.parse(raw);
        // Only restore if saved less than 24h ago
        if (state.savedAt && Date.now() - state.savedAt < 86400000) return state;
        localStorage.removeItem(STORAGE_KEY.value);
    } catch (e) { /* corrupt data */ }
    return null;
}

function handleBeforeUnload(e) {
    if (isDirty.value) {
        autoSave();
        e.preventDefault();
        e.returnValue = '';
    }
}

watch(cells, () => { isDirty.value = true; }, { deep: true });

onMounted(() => {
    // Try restoring saved state first
    const saved = loadSavedState();

    if (saved && saved.cells?.length) {
        cells.value = saved.cells;
        paperSize.value = saved.paperSize || paperSize.value;
        orientation.value = saved.orientation || orientation.value;
        gridCols.value = saved.gridCols || gridCols.value;
        gridRows.value = saved.gridRows || gridRows.value;
        marginMm.value = saved.marginMm ?? marginMm.value;
        guideMode.value = saved.guideMode || guideMode.value;
        lineSpacing.value = saved.lineSpacing || lineSpacing.value;
        isDirty.value = false;
        nextTick(() => toastRef.value?.show('Sesi sebelumnya dipulihkan', 'save'));
    } else if (template.value) {
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
    window.addEventListener('beforeunload', handleBeforeUnload);
    autoSaveTimer = setInterval(autoSave, 3000);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    // Intentional navigation → clear saved state so next visit starts fresh
    localStorage.removeItem(STORAGE_KEY.value);
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
    const cellsPerPage = gridCols.value * gridRows.value;
    // If template has fixed records (like calendar 12 months), use that count
    if (template.value?.enableGrid === false && template.value?.defaultPages) {
        return Math.max(1, Math.ceil(template.value.defaultPages / cellsPerPage));
    }
    return Math.max(1, Math.ceil(cells.value.length / cellsPerPage));
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

function updateQuantity(newCount) {
    if (newCount === cells.value.length) return;
    if (newCount > cells.value.length) {
        const master = JSON.stringify(cells.value[0] || []);
        const newCells = Array.from({ length: newCount - cells.value.length }, () => JSON.parse(master));
        cells.value = [...cells.value, ...newCells];
    } else {
        cells.value = cells.value.slice(0, newCount);
    }
    isDirty.value = true;
}

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

function duplicateWidget(path) {
    if (!path || !path.length) return;

    function applyDuplicate(cell) {
        if (!cell || !path || !path.length) return;
        if (path.length === 1) {
            const original = cell[path[0]];
            if (original) {
                cell.splice(path[0] + 1, 0, JSON.parse(JSON.stringify(original)));
            }
        } else if (path.length === 3) {
            const parent = cell[path[0]];
            if (parent?.children?.[path[1]]) {
                const original = parent.children[path[1]][path[2]];
                if (original) {
                    parent.children[path[1]].splice(path[2] + 1, 0, JSON.parse(JSON.stringify(original)));
                }
            }
        }
    }

    if (isSynced.value) {
        cells.value.forEach(applyDuplicate);
    } else {
        applyDuplicate(cells.value[selectedCellIndex.value]);
    }

    // Select the newly duplicated widget
    const newPath = [...path];
    newPath[newPath.length - 1]++;
    selectedWidgetPath.value = newPath;

    toastRef.value?.show('Widget diduplikasi', 'copy');
}

function updateWidget(path, updates, cellIndex = null) {
    const targetCellIdx = cellIndex !== null ? cellIndex : selectedCellIndex.value;
    const PROTECTED_KEYS = ['month', 'year', 'day', 'date', 'currentMonth', 'currentYear'];

    function applyUpdate(cell, index) {
        if (!cell || !path || !path.length) return;
        
        // If syncing, we only want to apply updates that are NOT protected
        // or if we are updating the target cell itself
        const filteredUpdates = { ...updates };
        if (isSynced.value && index !== targetCellIdx) {
            PROTECTED_KEYS.forEach(key => delete filteredUpdates[key]);
        }

        if (path.length === 1) {
            if (cell[path[0]]) cell[path[0]] = { ...cell[path[0]], ...filteredUpdates };
        } else if (path.length === 3) {
            const w = cell[path[0]];
            if (w?.children?.[path[1]]?.[path[2]]) {
                w.children[path[1]][path[2]] = { ...w.children[path[1]][path[2]], ...filteredUpdates };
            }
        }
    }

    if (isSynced.value) {
        cells.value.forEach((cell, idx) => applyUpdate(cell, idx));
    } else {
        applyUpdate(cells.value[targetCellIdx], targetCellIdx);
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
        toastRef.value?.show('Widget dihapus', 'delete');
        return;
    }

    // Undo (Ctrl+Z)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isEditingText) {
        e.preventDefault();
        undo();
        toastRef.value?.show('Undo', 'undo');
        return;
    }

    // Redo (Ctrl+Y or Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isEditingText) {
        e.preventDefault();
        redo();
        toastRef.value?.show('Redo', 'redo');
        return;
    }

    // Copy (Ctrl+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isEditingText && selectedWidget.value) {
        e.preventDefault();
        clipboard.value = JSON.parse(JSON.stringify(selectedWidget.value));
        toastRef.value?.show('Widget disalin', 'copy');
        return;
    }

    // Duplicate (Ctrl+D)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !isEditingText && selectedWidgetPath.value) {
        e.preventDefault();
        duplicateWidget(selectedWidgetPath.value);
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
        toastRef.value?.show('Widget ditempel', 'paste');
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
            <EditorToolbar v-model:paperSize="paperSize" v-model:orientation="orientation" v-model:gridCols="gridCols"
                v-model:gridRows="gridRows" v-model:marginMm="marginMm" v-model:lineSpacing="lineSpacing"
                v-model:guideMode="guideMode" :printQuantity="cells.length" :isSynced="isSynced" :template="template"
                :category="category" :isExporting="isExporting" @update:printQuantity="updateQuantity"
                @print="handlePrint" @export-pdf="handleExportPdf" />

            <div class="flex flex-1 overflow-hidden relative print:block print:overflow-visible">
                <!-- Widget Sidebar -->
                <WidgetSidebar class="no-print hidden lg:block" @add-widget="addWidget" />

                <!-- Canvas Wrapper -->
                <div
                    class="flex-1 flex flex-col relative overflow-hidden bg-slate-200 print:bg-white print:block print:overflow-visible">

                    <!-- Canvas Area -->
                    <div ref="scrollContainerRef"
                        class="flex-1 overflow-auto flex flex-col p-4 md:p-8 relative print:static print:p-0 print:block print:overflow-visible"
                        @wheel.ctrl.prevent="handleWheelZoom" @wheel.meta.prevent="handleWheelZoom"
                        @click="selectedWidgetPath = null">
                        <div class="absolute inset-0 pattern-dots opacity-50 pointer-events-none no-print"></div>
                        <EditorCanvas ref="canvasRef" :paperSize="paperSize" :orientation="orientation"
                            :gridCols="gridCols" :gridRows="gridRows" :marginMm="marginMm" :guideMode="guideMode"
                            :zoom="zoom" :isSynced="isSynced" :lineSpacing="lineSpacing" :cells="cells"
                            :printQuantity="printQuantity" :selectedWidgetPath="selectedWidgetPath"
                            :selectedCellIndex="selectedCellIndex" @select-widget="handleSelectWidget"
                            @update-widget="updateWidget" @remove-widget="removeWidget"
                            @reorder-widgets="handleReorderWidgets" class="z-10 relative" />
                    </div>

                    <!-- Floating Bottom Toolbar -->
                    <FloatingToolbar v-model:isSynced="isSynced" v-model:zoom="zoom" :totalPages="totalPagesCount"
                        :canUndo="canUndo" :canRedo="canRedo" :template="template" @add-page="addPage"
                        @remove-page="removePage" @fit-page="handleFitPage"
                        @undo="() => { undo(); toastRef?.show('Undo', 'undo'); }"
                        @redo="() => { redo(); toastRef?.show('Redo', 'redo'); }" />
                </div>

                <!-- Properties Panel -->
                <PropertiesPanel class="no-print hidden lg:block" :widget="selectedWidget" :template="template"
                    :gridCols="gridCols" :gridRows="gridRows" :printQuantity="cells.length" :marginMm="marginMm"
                    :guideMode="guideMode" :lineSpacing="lineSpacing" @update:gridCols="(val) => gridCols = val"
                    @update:gridRows="(val) => gridRows = val" @update:printQuantity="updateQuantity"
                    @update:marginMm="(val) => marginMm = val" @update:guideMode="(val) => guideMode = val"
                    @update:lineSpacing="(val) => lineSpacing = val"
                    @update="(updates) => updateWidget(selectedWidgetPath, updates)" @close="selectedWidgetPath = null"
                    @remove="removeWidget(selectedWidgetPath)" />
            </div>
        </div>

        <!-- Toast Notifications -->
        <EditorToast ref="toastRef" />
    </AppLayout>
</template>

<style>
.pattern-dots {
    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
    background-size: 20px 20px;
}
</style>
