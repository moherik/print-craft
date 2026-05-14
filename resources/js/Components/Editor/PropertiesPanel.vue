<script setup>
import { X, Trash2, RotateCcw, MousePointerClick } from 'lucide-vue-next';
import { WIDGET_DEFAULTS } from '@/Data/widgets';

const props = defineProps({ widget: Object, index: Number, template: Object });
const emit = defineEmits(['update', 'close', 'remove']);

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
</script>

<template>
    <div class="w-64 bg-white border-l border-slate-200 overflow-y-auto flex-shrink-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
        <div v-if="widget" class="p-4">
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Properties</h3>
                <button @click="emit('close')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><X class="w-4 h-4" /></button>
            </div>

            <div class="space-y-4">
                <!-- Widget Type -->
                <div>
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tipe</label>
                    <div class="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium inline-block">{{ widget.type }}</div>
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
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Placeholder</label>
                        <input :value="widget.placeholder" @input="update('placeholder', $event.target.value)"
                            class="input-field text-xs py-1.5" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Font Size</label>
                            <input type="number" :value="widget.fontSize" @input="update('fontSize', +$event.target.value)"
                                min="6" max="72" class="input-field text-xs py-1.5" />
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Weight</label>
                            <select :value="widget.fontWeight" @change="update('fontWeight', $event.target.value)"
                                class="input-field text-xs py-1.5 p-0 pl-2">
                                <option value="normal">Normal</option>
                                <option value="500">Medium</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Alignment</label>
                        <div class="flex bg-slate-100 border border-slate-300 p-0.5">
                            <button v-for="a in ['left','center','right']" :key="a" @click="update('align', a)"
                                class="flex-1 py-1 text-xs font-medium transition-colors"
                                :class="widget.align === a ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
                                {{ a === 'left' ? '←' : a === 'center' ? '↔' : '→' }}
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Line Height</label>
                            <input type="number" :value="widget.lineHeight || 1.4" @input="update('lineHeight', +$event.target.value)"
                                step="0.1" min="0.5" max="3" class="input-field text-xs py-1.5" />
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Spacing</label>
                            <input type="number" :value="widget.letterSpacing || 0" @input="update('letterSpacing', +$event.target.value)"
                                step="0.5" min="-2" max="10" class="input-field text-xs py-1.5" />
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Warna Teks</label>
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
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah Kolom</label>
                            <input type="number" :value="widget.colCount || 2" 
                                @input="updateColCount(+$event.target.value)"
                                min="1" max="6" class="input-field text-xs py-1.5" />
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jarak (mm)</label>
                                <input type="number" :value="widget.gap || 2" @input="update('gap', +$event.target.value)"
                                    min="0" max="50" class="input-field text-xs py-1.5" />
                            </div>
                            <div>
                                <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Alignment</label>
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
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2 block">Lebar Relatif Kolom</label>
                            <div class="grid grid-cols-2 gap-2">
                                <div v-for="i in (widget.colCount || 2)" :key="i" class="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded">
                                    <span class="text-[9px] text-slate-400 font-bold">#{{ i }}</span>
                                    <input type="number" :value="widget.colWidths ? widget.colWidths[i-1] : 1" 
                                        @input="updateColWidth(i-1, +$event.target.value)"
                                        min="1" max="12"
                                        class="w-full bg-white border border-slate-200 text-[10px] py-1 px-1.5 focus:ring-1 focus:ring-red-500 outline-none" />
                                </div>
                            </div>
                            <p class="text-[8px] text-slate-400 mt-1 italic">Contoh: 3 & 1 berarti kolom pertama 3x lebih lebar.</p>
                        </div>
                    </div>
                </template>

                <!-- Divider / Spacer -->
                <template v-if="widget.type === 'divider'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tinggi / Spasi (mm)</label>
                        <input type="number" :value="widget.height || 4" @input="update('height', +$event.target.value)"
                            min="1" max="100" class="input-field text-xs py-1.5" />
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Style</label>
                        <select :value="widget.style || 'solid'" @change="update('style', $event.target.value)"
                            class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="solid">Solid Line</option>
                            <option value="dashed">Dashed Line</option>
                            <option value="transparent">Transparent (Spacer)</option>
                        </select>
                    </div>
                    <div v-if="widget.style !== 'transparent'">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Warna Garis</label>
                        <div class="flex items-center gap-2">
                            <div class="flex items-center gap-2">
                                <input type="color" :value="widget.color" @input="update('color', $event.target.value)"
                                    class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetProperty('color')" class="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50" title="Reset Color">
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
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Nilai</label>
                        <input :value="widget.value" @input="update('value', $event.target.value)" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- QR Code -->
                <template v-if="widget.type === 'qrcode'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">URL / Text</label>
                        <input :value="widget.value" @input="update('value', $event.target.value)" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Table -->
                <template v-if="widget.type === 'table'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah Baris</label>
                        <input type="number" :value="widget.rows" @input="update('rows', +$event.target.value)"
                            min="1" max="50" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Checklist -->
                <template v-if="widget.type === 'checklist'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah Item</label>
                        <input type="number" :value="widget.items" @input="update('items', +$event.target.value)"
                            min="1" max="50" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Lines -->
                <template v-if="widget.type === 'lines'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Jumlah Garis</label>
                        <input type="number" :value="widget.lineCount" @input="update('lineCount', +$event.target.value)"
                            min="5" max="50" class="input-field text-xs py-1.5" />
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Spacing (mm)</label>
                        <input type="number" :value="widget.lineSpacing" @input="update('lineSpacing', +$event.target.value)"
                            min="4" max="20" class="input-field text-xs py-1.5" />
                    </div>
                </template>

                <!-- Calendar -->
                <template v-if="widget.type === 'calendar'">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Bulan</label>
                            <select :value="widget.month" @change="update('month', +$event.target.value)" class="input-field text-xs py-1.5 p-0 pl-2">
                                <option v-for="m in 12" :key="m" :value="m">{{ new Date(2000, m - 1).toLocaleString('id-ID', { month: 'long' }) }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Tahun</label>
                            <input type="number" :value="widget.year" @input="update('year', +$event.target.value)" class="input-field text-xs py-1.5" />
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Mulai Hari</label>
                        <select :value="widget.startDay || 'monday'" @change="update('startDay', $event.target.value)" class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="monday">Senin</option>
                            <option value="sunday">Minggu</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" :checked="widget.showDates" @change="update('showDates', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                            <span class="text-xs text-slate-700 font-medium">Tampilkan Tanggal</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" :checked="widget.showHolidays" @change="update('showHolidays', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                            <span class="text-xs text-slate-700 font-medium">Tampilkan Hari Libur (ID)</span>
                        </label>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Calendar Title Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Judul Kalender</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.titleStyle?.show" @change="updateNested('titleStyle', 'show', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Judul (Bulan & Tahun)</span>
                    </label>
                    <div v-if="widget.titleStyle?.show" class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                                <div class="flex items-center gap-1">
                                    <input type="color" :value="widget.titleStyle?.color" @input="updateNested('titleStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                    <button @click="resetNestedProperty('titleStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                        <RotateCcw class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                                <input type="number" :value="widget.titleStyle?.fontSize" @input="updateNested('titleStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Alignment</label>
                                <select :value="widget.titleStyle?.align" @change="updateNested('titleStyle', 'align', $event.target.value)" class="input-field text-xs py-1">
                                    <option value="left">Kiri</option>
                                    <option value="center">Tengah</option>
                                    <option value="right">Kanan</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Margin (mm)</label>
                                <input type="number" :value="widget.titleStyle?.marginBottom" @input="updateNested('titleStyle', 'marginBottom', +$event.target.value)" class="input-field text-xs py-1" />
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>


                    <!-- Header Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Style Header</h4>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.headerStyle?.fontSize" @input="updateNested('headerStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Tinggi (mm)</label>
                            <input type="number" :value="widget.headerStyle?.height" @input="updateNested('headerStyle', 'height', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.headerStyle?.color" @input="updateNested('headerStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('headerStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.headerStyle?.bg" @input="updateNested('headerStyle', 'bg', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('headerStyle', 'bg')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.headerStyle?.fontWeight" @change="updateNested('headerStyle', 'fontWeight', $event.target.value)" class="input-field text-xs py-1">
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
                            <input type="number" :value="widget.dateStyle?.fontSize" @input="updateNested('dateStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Tinggi (mm)</label>
                            <input type="number" :value="widget.dateStyle?.height" @input="updateNested('dateStyle', 'height', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.dateStyle?.color" @input="updateNested('dateStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('dateStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.dateStyle?.bg" @input="updateNested('dateStyle', 'bg', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('dateStyle', 'bg')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.dateStyle?.fontWeight" @change="updateNested('dateStyle', 'fontWeight', $event.target.value)" class="input-field text-xs py-1">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Holiday Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Style Hari Libur</h4>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.color" @input="updateNested('holidayStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna BG</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.bg" @input="updateNested('holidayStyle', 'bg', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'bg')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.holidayStyle?.detailSize" @input="updateNested('holidayStyle', 'detailSize', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                        <div class="mb-3">
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Detail</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.holidayStyle?.detailColor" @input="updateNested('holidayStyle', 'detailColor', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('holidayStyle', 'detailColor')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                        <select :value="widget.holidayStyle?.detailWeight" @change="updateNested('holidayStyle', 'detailWeight', $event.target.value)" class="input-field text-xs py-1">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                        </select>
                    </div>


                    <!-- Holiday List Footer Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Daftar Hari Libur (Footer)</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.holidayListStyle?.show" @change="updateNested('holidayListStyle', 'show', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Daftar Libur</span>
                    </label>
                    <div v-if="widget.holidayListStyle?.show" class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                                <div class="flex items-center gap-1">
                                    <input type="color" :value="widget.holidayListStyle?.color" @input="updateNested('holidayListStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                    <button @click="resetNestedProperty('holidayListStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                        <RotateCcw class="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                                <input type="number" :value="widget.holidayListStyle?.fontSize" @input="updateNested('holidayListStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Weight</label>
                            <select :value="widget.holidayListStyle?.fontWeight" @change="updateNested('holidayListStyle', 'fontWeight', $event.target.value)" class="input-field text-xs py-1">
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Event Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Garis Event</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.eventStyle?.show" @change="updateNested('eventStyle', 'show', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Garis Tulis</span>
                    </label>
                    <div v-if="widget.eventStyle?.show" class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Garis</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.eventStyle?.color" @input="updateNested('eventStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('eventStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.eventStyle?.fontSize" @input="updateNested('eventStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                    </div>

                    <div class="h-px bg-slate-100 my-4"></div>

                    <!-- Footer Custom Event Styling -->
                    <h4 class="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3">Area Catatan (Footer)</h4>
                    <label class="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" :checked="widget.footerEventStyle?.show" @change="updateNested('footerEventStyle', 'show', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Tampilkan Area Catatan</span>
                    </label>
                    <div v-if="widget.footerEventStyle?.show" class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Warna Teks</label>
                            <div class="flex items-center gap-1">
                                <input type="color" :value="widget.footerEventStyle?.color" @input="updateNested('footerEventStyle', 'color', $event.target.value)" class="w-full h-8 p-0 border-0 bg-transparent cursor-pointer" />
                                <button @click="resetNestedProperty('footerEventStyle', 'color')" class="p-1 text-slate-400 hover:text-red-600 rounded">
                                    <RotateCcw class="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-500 mb-1 block">Font Size</label>
                            <input type="number" :value="widget.footerEventStyle?.fontSize" @input="updateNested('footerEventStyle', 'fontSize', +$event.target.value)" class="input-field text-xs py-1" />
                        </div>
                    </div>
                </template>

                <!-- Weekly Planner -->
                <template v-if="widget.type === 'weekly_planner'">
                    <div>
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">Layout</label>
                        <select :value="widget.layout || 'vertical'" @change="update('layout', $event.target.value)" class="input-field text-xs py-1.5 p-0 pl-2">
                            <option value="vertical">Kolom Vertikal (Kiri-Kanan)</option>
                            <option value="horizontal">Baris Horizontal (Atas-Bawah)</option>
                        </select>
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer mt-2">
                        <input type="checkbox" :checked="widget.includeWeekend" @change="update('includeWeekend', $event.target.checked)" class="rounded border-slate-300 text-red-600 focus:ring-red-500" />
                        <span class="text-xs text-slate-700 font-medium">Sertakan Akhir Pekan (Sabtu & Minggu)</span>
                    </label>
                </template>

                <!-- Delete -->
                <div class="pt-4 border-t border-slate-100 mt-6">
                    <button @click="emit('remove')" class="w-full btn-ghost text-xs text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 justify-center">
                        <Trash2 class="w-4 h-4" /> Hapus Widget
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="h-full flex flex-col items-center justify-center p-6 text-center opacity-60">
            <MousePointerClick class="w-8 h-8 text-slate-400 mb-3" />
            <p class="text-xs text-slate-500 font-medium">Pilih komponen di kanvas untuk melihat properti.</p>
        </div>
    </div>
</template>
