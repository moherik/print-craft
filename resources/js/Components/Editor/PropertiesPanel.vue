<script setup>
import { X, Trash2, RotateCcw, MousePointerClick, Layers, Grid3x3, Layout, Ruler, Scan, AlignVerticalSpaceAround } from 'lucide-vue-next';
import { WIDGET_DEFAULTS } from '@/Data/widgets';
import { computed } from 'vue';

const props = defineProps({
    widget: Object,
    index: Number,
    template: Object,
    gridCols: Number,
    gridRows: Number,
    printQuantity: Number,
    marginMm: Number,
    guideMode: String,
    lineSpacing: Number
});
const emit = defineEmits([
    'update', 'close', 'remove',
    'update:gridCols', 'update:gridRows', 'update:printQuantity',
    'update:marginMm', 'update:guideMode', 'update:lineSpacing'
]);

function update(key, value) {
    emit('update', { [key]: value });
}

function updateNested(objKey, propKey, value) {
    const newObj = { ...(props.widget[objKey] || {}) };
    newObj[propKey] = value;
    emit('update', { [objKey]: newObj });
}

function getInitialValue(objKey, propKey = null) {
    // 1. Find the widget definition in the template
    const templateWidget = props.template?.widgets?.find(w => w.type === props.widget.type);
    const globalDefault = WIDGET_DEFAULTS[props.widget.type];

    if (propKey) {
        // Handle nested property (e.g., headerStyle.color)
        const templateVal = templateWidget?.[objKey]?.[propKey];
        const globalVal = globalDefault?.[objKey]?.[propKey];
        return templateVal !== undefined ? templateVal : globalVal;
    } else {
        // Handle flat property (e.g., color)
        const templateVal = templateWidget?.[objKey];
        const globalVal = globalDefault?.[objKey];
        return templateVal !== undefined ? templateVal : globalVal;
    }
}

function resetProperty(key) {
    const defaultValue = getInitialValue(key);
    if (defaultValue !== undefined) emit('update', { [key]: defaultValue });
}

function resetNestedProperty(objKey, propKey) {
    const defaultValue = getInitialValue(objKey, propKey);
    if (defaultValue !== undefined) updateNested(objKey, propKey, defaultValue);
}

function updateColCount(count) {
    const newChildren = props.widget.children ? [...props.widget.children] : [[], []];
    while (newChildren.length < count) newChildren.push([]);

    // Also adjust colWidths
    const oldWidths = props.widget.colWidths || [];
    const newWidths = Array(count).fill(1).map((_, i) => oldWidths[i] || 1);

    emit('update', {
        colCount: count,
        children: newChildren.slice(0, count),
        colWidths: newWidths
    });
}

function updateColWidth(colIdx, width) {
    const widths = props.widget.colWidths ? [...props.widget.colWidths] : Array(props.widget.colCount || 2).fill(1);
    widths[colIdx] = width;
    emit('update', { colWidths: widths });
}

// ─── Global Settings Capabilities ───
const isEnableQuantity = computed(() => props.template?.enableQuantity !== false);
const isEnableGrid = computed(() => props.template?.enableGrid !== false);

function reset(key) {
    // Get default value from template, or fallback to sensible defaults
    let defaultVal = props.template?.[key];
    
    // Fallback if template doesn't have the key
    if (defaultVal === undefined) {
        if (key === 'marginMm') defaultVal = 5;
        if (key === 'gridCols') defaultVal = 1;
        if (key === 'gridRows') defaultVal = 1;
        if (key === 'lineSpacing') defaultVal = 1.15;
    }

    if (defaultVal !== undefined) {
        emit(`update:${key}`, defaultVal);
    }
}
</script>

<template>
    <div
        class="w-64 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
        <div v-if="widget" class="p-4">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Properties</h3>
                <button @click="emit('close')"
                    class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <X class="w-4 h-4" />
                </button>
            </div>

            <div class="space-y-4">
                <!-- Widget Type -->
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tipe</label>
                    <div
                        class="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium inline-block">
                        {{ widget.type }}</div>
                </div>

                <!-- Label -->
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Label</label>
                    <input :value="widget.label" @input="update('label', $event.target.value)"
                        class="input-field text-xs py-1.5" />
                </div>

                <!-- Text-specific -->
                <template v-if="widget.type === 'text'">
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Placeholder</label>
                        <input :value="widget.placeholder" @input="update('placeholder', $event.target.value)"
                            class="input-field text-xs py-1.5" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Font
                                Size</label>
                            <input type="number" :value="widget.fontSize"
                                @input="update('fontSize', +$event.target.value)" min="6" max="72"
                                class="input-field text-xs py-1.5" />
                        </div>
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Weight</label>
                            <select :value="widget.fontWeight" @change="update('fontWeight', $event.target.value)"
                                class="input-field text-xs py-1.5 p-0 pl-2">
                                <option value="normal">Normal</option>
                                <option value="500">Medium</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Alignment</label>
                        <div class="flex bg-slate-100 border border-slate-300 p-0.5">
                            <button v-for="a in ['left', 'center', 'right']" :key="a" @click="update('align', a)"
                                class="flex-1 py-1 text-xs font-medium transition-colors"
                                :class="widget.align === a ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
                                {{ a === 'left' ? '←' : a === 'center' ? '↔' : '→' }}
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Line
                                Height</label>
                            <input type="number" :value="widget.lineHeight || 1.4"
                                @input="update('lineHeight', +$event.target.value)" step="0.1" min="0.5" max="3"
                                class="input-field text-xs py-1.5" />
                        </div>
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Spacing</label>
                            <input type="number" :value="widget.letterSpacing || 0"
                                @input="update('letterSpacing', +$event.target.value)" step="0.5" min="-2" max="10"
                                class="input-field text-xs py-1.5" />
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Warna
                            Teks</label>
                        <div class="flex items-center gap-2">
                            <input type="color" :value="widget.color" @input="update('color', $event.target.value)"
                                class="w-10 h-8 p-0 border-0 bg-transparent cursor-pointer" />
                            <span class="text-xs text-slate-600 uppercase">{{ widget.color || '#000000' }}</span>
                        </div>
                    </div>
                </template>

                <!-- Columns -->
                <template v-if="widget.type === 'columns'">
                    <div class="space-y-3">
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah
                                Kolom</label>
                            <input type="number" :value="widget.colCount || 2"
                                @input="updateColCount(+$event.target.value)" min="1" max="6"
                                class="input-field text-xs py-1.5" />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jarak
                                    (mm)</label>
                                <input type="number" :value="widget.gap || 2"
                                    @input="update('gap', +$event.target.value)" min="0" max="50"
                                    class="input-field text-xs py-1.5" />
                            </div>
                            <div>
                                <label
                                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Alignment</label>
                                <select :value="widget.align || 'left'" @change="update('align', $event.target.value)"
                                    class="input-field text-xs py-1.5 p-0 pl-2">
                                    <option value="left">Kiri</option>
                                    <option value="center">Tengah</option>
                                    <option value="right">Kanan</option>
                                </select>
                            </div>
                        </div>

                        <!-- Column Widths -->
                        <div class="pt-2 border-t border-slate-50 mt-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 block">Lebar
                                Relatif Kolom</label>
                            <div class="grid grid-cols-2 gap-2">
                                <div v-for="i in (widget.colCount || 2)" :key="i"
                                    class="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded">
                                    <span class="text-[9px] text-slate-400 font-bold">#{{ i }}</span>
                                    <input type="number" :value="widget.colWidths ? widget.colWidths[i - 1] : 1"
                                        @input="updateColWidth(i - 1, +$event.target.value)" min="1" max="12"
                                        class="w-full bg-white border border-slate-200 text-[10px] py-1 px-1.5 focus:ring-1 focus:ring-red-500 outline-none" />
                                </div>
                            </div>
                            <p class="text-[8px] text-slate-400 mt-1 italic">Contoh: 3 & 1 berarti kolom pertama 3x
                                lebih lebar.</p>
                        </div>
                    </div>
                </template>

                <!-- Divider / Spacer -->
                <template v-if="widget.type === 'divider'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tinggi /
                            Spasi (mm)</label>
                        <input type="number" :value="widget.height || 4" @input="update('height', +$event.target.value)"
                            min="1" max="100" class="input-field text-xs py-1.5" />
                    </div>
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Style</label>
                        <select :value="widget.style || 'solid'" @change="update('style', $event.target.value)"
                            class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="solid">Solid Line</option>
                            <option value="dashed">Dashed Line</option>
                            <option value="transparent">Transparent (Spacer)</option>
                        </select>
                    </div>
                    <div v-if="widget.style !== 'transparent'">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Warna
                            Garis</label>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <input type="color" :value="widget.color" @input="update('color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetProperty('color')"
                                    class="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                    title="Reset Color">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                            <span class="text-xs text-slate-600 uppercase">{{ widget.color || '#d1d5db' }}</span>
                        </div>
                    </div>
                </template>

                <!-- Barcode -->
                <template v-if="widget.type === 'barcode'">
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Nilai</label>
                        <input :value="widget.value" @input="update('value', $event.target.value)"
                            class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- QR Code -->
                <template v-if="widget.type === 'qrcode'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">URL /
                            Text</label>
                        <input :value="widget.value" @input="update('value', $event.target.value)"
                            class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Table -->
                <template v-if="widget.type === 'table'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah
                            Baris</label>
                        <input type="number" :value="widget.rows" @input="update('rows', +$event.target.value)" min="1"
                            max="50" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Checklist -->
                <template v-if="widget.type === 'checklist'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah
                            Item</label>
                        <input type="number" :value="widget.items" @input="update('items', +$event.target.value)"
                            min="1" max="50" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Lines -->
                <template v-if="widget.type === 'lines'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah
                            Garis</label>
                        <input type="number" :value="widget.lineCount"
                            @input="update('lineCount', +$event.target.value)" min="5" max="50"
                            class="input-field text-xs py-1.5" />
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Spacing
                            (mm)</label>
                        <input type="number" :value="widget.lineSpacing"
                            @input="update('lineSpacing', +$event.target.value)" min="4" max="20"
                            class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Calendar -->
                <template v-if="widget.type === 'calendar'">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Bulan</label>
                            <select :value="widget.month" @change="update('month', +$event.target.value)"
                                class="input-field text-xs py-1.5 p-0 pl-2">
                                <option v-for="m in 12" :key="m" :value="m">{{ new Date(2000, m -
                                    1).toLocaleString('id-ID', { month: 'long' }) }}</option>
                            </select>
                        </div>
                        <div>
                            <label
                                class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tahun</label>
                            <input type="number" :value="widget.year" @input="update('year', +$event.target.value)"
                                class="input-field text-xs py-1.5" />
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Mulai
                            Hari</label>
                        <select :value="widget.startDay || 'monday'" @change="update('startDay', $event.target.value)"
                            class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="monday">Senin</option>
                            <option value="sunday">Minggu</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" :checked="widget.showDates"
                                @change="update('showDates', $event.target.checked)"
                                class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                            <span class="text-xs text-slate-700 font-medium">Tampilkan Tanggal</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" :checked="widget.showHolidays"
                                @change="update('showHolidays', $event.target.checked)"
                                class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                            <span class="text-xs text-slate-700 font-medium">Tampilkan Hari Libur (ID)</span>
                        </label>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Calendar Title Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Judul Kalender</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.titleStyle?.show"
                            @change="updateNested('titleStyle', 'show', $event.target.checked)"
                            class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Judul (Bulan & Tahun)</span>
                    </label>
                    <div v-if="widget.titleStyle?.show" class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                                <div class="flex items-center gap-1">
                                    <input type="color" :value="widget.titleStyle?.color"
                                        @input="updateNested('titleStyle', 'color', $event.target.value)"
                                        class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                    <button @click="resetNestedProperty('titleStyle', 'color')"
                                        class="p-1 text-slate-400 hover:text-red-600 rounded">
                                        <RotateCcw class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                                <input type="number" :value="widget.titleStyle?.fontSize"
                                    @input="updateNested('titleStyle', 'fontSize', +$event.target.value)"
                                    class="input-field text-xs py-1" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Alignment</label>
                                <select :value="widget.titleStyle?.align"
                                    @change="updateNested('titleStyle', 'align', $event.target.value)"
                                    class="input-field text-xs py-1">
                                    <option value="left">Kiri</option>
                                    <option value="center">Tengah</option>
                                    <option value="right">Kanan</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Margin (mm)</label>
                                <input type="number" :value="widget.titleStyle?.marginBottom"
                                    @input="updateNested('titleStyle', 'marginBottom', +$event.target.value)"
                                    class="input-field text-xs py-1" />
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>


                    <!-- Header Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Style Header</h4>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.headerStyle?.fontSize"
                                @input="updateNested('headerStyle', 'fontSize', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Tinggi (mm)</label>
                            <input type="number" :value="widget.headerStyle?.height"
                                @input="updateNested('headerStyle', 'height', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.headerStyle?.color"
                                    @input="updateNested('headerStyle', 'color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('headerStyle', 'color')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.headerStyle?.bg"
                                    @input="updateNested('headerStyle', 'bg', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('headerStyle', 'bg')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.headerStyle?.fontWeight"
                            @change="updateNested('headerStyle', 'fontWeight', $event.target.value)"
                            class="input-field text-xs py-1">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Date Item Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Style Tanggal</h4>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.dateStyle?.fontSize"
                                @input="updateNested('dateStyle', 'fontSize', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Tinggi (mm)</label>
                            <input type="number" :value="widget.dateStyle?.height"
                                @input="updateNested('dateStyle', 'height', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.dateStyle?.color"
                                    @input="updateNested('dateStyle', 'color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('dateStyle', 'color')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.dateStyle?.bg"
                                    @input="updateNested('dateStyle', 'bg', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('dateStyle', 'bg')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.dateStyle?.fontWeight"
                            @change="updateNested('dateStyle', 'fontWeight', $event.target.value)"
                            class="input-field text-xs py-1">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Holiday Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Style Hari Libur
                    </h4>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.color"
                                    @input="updateNested('holidayStyle', 'color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'color')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.bg"
                                    @input="updateNested('holidayStyle', 'bg', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'bg')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.holidayStyle?.detailSize"
                                @input="updateNested('holidayStyle', 'detailSize', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                        <div class="mb-3">
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Detail</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.detailColor"
                                    @input="updateNested('holidayStyle', 'detailColor', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'detailColor')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.holidayStyle?.detailWeight"
                            @change="updateNested('holidayStyle', 'detailWeight', $event.target.value)"
                            class="input-field text-xs py-1">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>


                    <!-- Holiday List Footer Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Daftar Hari Libur
                        (Footer)</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.holidayListStyle?.show"
                            @change="updateNested('holidayListStyle', 'show', $event.target.checked)"
                            class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Daftar Libur</span>
                    </label>
                    <div v-if="widget.holidayListStyle?.show" class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                                <div class="flex items-center gap-1">
                                    <input type="color" :value="widget.holidayListStyle?.color"
                                        @input="updateNested('holidayListStyle', 'color', $event.target.value)"
                                        class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                    <button @click="resetNestedProperty('holidayListStyle', 'color')"
                                        class="p-1 text-slate-400 hover:text-red-600 rounded">
                                        <RotateCcw class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                                <input type="number" :value="widget.holidayListStyle?.fontSize"
                                    @input="updateNested('holidayListStyle', 'fontSize', +$event.target.value)"
                                    class="input-field text-xs py-1" />
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                            <select :value="widget.holidayListStyle?.fontWeight"
                                @change="updateNested('holidayListStyle', 'fontWeight', $event.target.value)"
                                class="input-field text-xs py-1">
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Event Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Garis Event</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.eventStyle?.show"
                            @change="updateNested('eventStyle', 'show', $event.target.checked)"
                            class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Garis Tulis</span>
                    </label>
                    <div v-if="widget.eventStyle?.show" class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Garis</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.eventStyle?.color"
                                    @input="updateNested('eventStyle', 'color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('eventStyle', 'color')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.eventStyle?.fontSize"
                                @input="updateNested('eventStyle', 'fontSize', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Footer Custom Event Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Area Catatan
                        (Footer)</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.footerEventStyle?.show"
                            @change="updateNested('footerEventStyle', 'show', $event.target.checked)"
                            class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Area Catatan</span>
                    </label>
                    <div v-if="widget.footerEventStyle?.show" class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.footerEventStyle?.color"
                                    @input="updateNested('footerEventStyle', 'color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('footerEventStyle', 'color')"
                                    class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.footerEventStyle?.fontSize"
                                @input="updateNested('footerEventStyle', 'fontSize', +$event.target.value)"
                                class="input-field text-xs py-1" />
                        </div>
                    </div>
                </template>

                <!-- Weekly Planner -->
                <template v-if="widget.type === 'weekly_planner'">
                    <div>
                        <label
                            class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Layout</label>
                        <select :value="widget.layout || 'vertical'" @change="update('layout', $event.target.value)"
                            class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="vertical">Kolom Vertikal (Kiri-Kanan)</option>
                            <option value="horizontal">Baris Horizontal (Atas-Bawah)</option>
                        </select>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" :checked="widget.includeWeekend"
                            @change="update('includeWeekend', $event.target.checked)"
                            class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Sertakan Akhir Pekan (Sabtu & Minggu)</span>
                    </label>
                </template>

                <!-- Delete -->
                <div class="pt-4 border-t border-slate-100 mt-6">
                    <button @click="emit('remove')"
                        class="w-full btn-ghost text-xs text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 justify-center">
                        <Trash2 class="w-4 h-4" /> Hapus Widget
                    </button>
                </div>
            </div>
        </div>

        <!-- Global Settings (Empty State) -->
        <div v-else class="p-4 h-full flex flex-col">
            <div class="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                <Layout class="w-4 h-4 text-slate-400" />
                <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengaturan Halaman</h3>
            </div>

            <div class="space-y-6">
                <!-- Quantity -->
                <div v-if="isEnableQuantity">
                    <div class="flex items-center justify-between mb-1.5">
                        <div class="flex items-center gap-2 text-slate-500">
                            <Layers class="w-3.5 h-3.5" />
                            <span class="text-[11px] font-semibold tracking-tight uppercase">Jumlah</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <input type="number" :value="printQuantity"
                                @input="emit('update:printQuantity', Math.max(1, +$event.target.value))" min="1"
                                class="w-16 bg-white border border-slate-200 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none rounded shadow-sm font-bold" />
                            <span class="text-[10px] font-bold text-slate-400 uppercase">Pcs</span>
                        </div>
                    </div>
                    <p class="text-[9px] text-slate-400 leading-tight">Total label yang akan di-generate di seluruh
                        halaman.</p>
                </div>

                <!-- Grid Settings -->
                <div v-if="isEnableGrid">
                    <div class="flex items-center gap-2 mb-2">
                        <Grid3x3 class="w-3.5 h-3.5 text-slate-500" />
                        <span class="text-[11px] font-semibold tracking-tight uppercase">Layout Grid</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div class="flex items-center bg-slate-50 border border-slate-200 pl-2">
                            <span class="text-[9px] font-bold text-slate-400 uppercase mr-2">Col</span>
                            <input type="number" :value="gridCols"
                                @input="emit('update:gridCols', Math.max(1, +$event.target.value))" min="1" max="10"
                                class="w-full bg-white border border-slate-200 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none rounded shadow-sm font-bold" />
                        </div>
                        <div class="flex items-center bg-slate-50 border border-slate-200 pl-2">
                            <span class="text-[9px] font-bold text-slate-400 uppercase mr-2">Row</span>
                            <input type="number" :value="gridRows"
                                @input="emit('update:gridRows', Math.max(1, +$event.target.value))" min="1" max="15"
                                class="w-full bg-white border border-slate-200 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none rounded shadow-sm font-bold" />
                        </div>
                    </div>
                    <p class="text-[9px] text-slate-400 mt-1.5 leading-tight italic">Grid menentukan kepadatan label
                        dalam 1
                        lembar kertas.</p>
                </div>

                <!-- Layout & Guides -->
                <div>
                    <div class="flex items-center gap-2 mb-4 border-t border-slate-100 pt-4">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Panduan &
                            Jarak</label>
                    </div>

                    <div class="space-y-5">
                        <!-- Margin -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <div class="flex items-center gap-2 text-slate-500 group/label">
                                    <Ruler class="w-3.5 h-3.5" />
                                    <span class="text-[11px] font-semibold tracking-tight">Margin</span>
                                    <button @click="reset('marginMm')"
                                        class="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover/label:opacity-100"
                                        title="Reset ke default template">
                                        <RotateCcw class="w-3 h-3" />
                                    </button>
                                </div>
                                <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{{
                                    marginMm }}mm</span>
                            </div>
                            <input type="range" :value="marginMm" @input="emit('update:marginMm', +$event.target.value)"
                                min="0" max="30"
                                class="w-full h-1 bg-slate-200 accent-red-600 appearance-none rounded-lg cursor-pointer" />
                        </div>

                        <!-- Line Spacing -->
                        <div>
                            <div class="flex items-center gap-2 text-slate-500 mb-1.5">
                                <AlignVerticalSpaceAround class="w-3.5 h-3.5" />
                                <span class="text-[11px] font-semibold tracking-tight">Jarak Antar Baris</span>
                            </div>
                            <select :value="lineSpacing" @change="emit('update:lineSpacing', +$event.target.value)"
                                class="w-full bg-white border border-slate-200 text-[11px] py-1.5 px-2 rounded-md focus:border-red-600 outline-none transition-all shadow-sm">
                                <option :value="1">Normal (1.0)</option>
                                <option :value="1.15">Renggang (1.15)</option>
                                <option :value="1.5">Lebar (1.5)</option>
                                <option :value="2">Double (2.0)</option>
                            </select>
                        </div>

                        <!-- Guide Mode -->
                        <div>
                            <div class="flex items-center gap-2 text-slate-500 mb-1.5">
                                <Scan class="w-3.5 h-3.5" />
                                <span class="text-[11px] font-semibold tracking-tight">Mode Garis Pandu</span>
                            </div>
                            <div class="flex bg-slate-100 p-1 rounded-md border border-slate-200/50">
                                <button v-for="mode in ['none', 'crop', 'full']" :key="mode"
                                    @click="emit('update:guideMode', mode)"
                                    class="flex-1 py-1 text-[10px] font-bold rounded transition-all capitalize"
                                    :class="guideMode === mode ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                                    {{ mode === 'none' ? 'Off' : mode }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contextual Info -->
                <div class="mt-auto pt-8 flex flex-col items-center justify-center opacity-40 grayscale">
                    <MousePointerClick class="w-6 h-6 text-slate-400 mb-2" />
                    <p class="text-[10px] text-slate-500 font-medium">Klik widget untuk edit</p>
                </div>
            </div>
        </div>
    </div>
</template>
