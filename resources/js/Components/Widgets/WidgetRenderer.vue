<script>
export default { name: 'WidgetRenderer' };
</script>
<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { Plus, Type, Image as ImageIcon, QrCode, Barcode } from 'lucide-vue-next';
import { useHolidays } from '@/Composables/useHolidays';

const props = defineProps({
    widget: Object,
    allWidgets: { type: Array, default: () => [] },
    index: Number,
    path: { type: Array, default: () => [] },
    selectedPath: { type: Array, default: null },
    compact: Boolean,
    cellIndex: { type: Number, default: 0 },
    selectedCellIndex: { type: Number, default: 0 },
    isSynced: { type: Boolean, default: true }
});

const emit = defineEmits(['select-widget', 'update-widget', 'open-photo-editor']);

const isSelected = computed(() => {
    if (!props.selectedPath || !props.path) return false;
    const pathMatches = props.selectedPath.join('-') === props.path.join('-');
    return pathMatches && props.cellIndex === props.selectedCellIndex;
});

// ─── Calendar Helpers ───
const calendarDays = computed(() => {
    if (props.widget.type !== 'calendar') return [];
    const year = props.widget.year || new Date().getFullYear();
    const month = (props.widget.month || (new Date().getMonth() + 1)) - 1;
    const startDay = props.widget.startDay === 'sunday' ? 0 : 1;

    const date = new Date(year, month, 1);
    const days = [];

    let firstDayOfWeek = date.getDay();
    let offset = firstDayOfWeek - startDay;
    if (offset < 0) offset += 7;
    for (let i = 0; i < offset; i++) days.push('');

    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) days.push(i);

    while (days.length % 7 !== 0) days.push('');
    return days;
});

const weekDays = computed(() => {
    return props.widget.startDay === 'sunday'
        ? ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
        : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
});

// ─── Holiday Logic ───
const { fetchHolidays } = useHolidays();
const holidays = ref([]);

async function loadHolidays() {
    const year = props.widget.year || new Date().getFullYear();
    if (props.widget.type === 'calendar' && props.widget.showHolidays && year) {
        holidays.value = await fetchHolidays(year, props.widget.country || 'ID');
    } else {
        holidays.value = [];
    }
}

onMounted(loadHolidays);
watch(() => [props.widget.year, props.widget.showHolidays, props.widget.country], loadHolidays);

const getHoliday = (day) => {
    if (!day || props.widget.type !== 'calendar' || !props.widget.showHolidays) return null;
    const year = props.widget.year || new Date().getFullYear();
    const month = String(props.widget.month || (new Date().getMonth() + 1)).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${d}`;
    return holidays.value.find(h => h.date === dateStr);
};

const monthlyHolidays = computed(() => {
    if (props.widget.type !== 'calendar' || !props.widget.showHolidays) return [];
    const year = props.widget.year || new Date().getFullYear();
    const month = String(props.widget.month || (new Date().getMonth() + 1)).padStart(2, '0');
    const monthPrefix = `${year}-${month}-`;
    return holidays.value
        .filter(h => h.date.startsWith(monthPrefix))
        .sort((a, b) => a.date.localeCompare(b.date));
});


// ─── Text Widget ───
const editableText = ref('');
onMounted(() => {
    if (props.widget.type === 'text') {
        editableText.value = props.widget.value || '';
    }
});

watch(() => props.widget.value, (newVal) => {
    if (props.widget.type === 'text' && newVal !== editableText.value) {
        editableText.value = newVal || '';
    }
});


const displayValue = computed(() => {
    if (props.widget.type !== 'text') return '';
    let val = editableText.value;

    // Check if we have sibling calendar to get month/year
    const calendar = props.allWidgets.find(w => w.type === 'calendar');
    if (calendar) {
        const monthName = new Date(2000, (calendar.month || 1) - 1).toLocaleString('id-ID', { month: 'long' });
        val = val.replace(/\{\{month\}\}/gi, monthName);
        val = val.replace(/\{\{year\}\}/gi, calendar.year || new Date().getFullYear());
    }

    return val || props.widget.placeholder || '';
});

// Auto-resize textarea
const textInput = ref(null);
function adjustHeight() {
    if (textInput.value) {
        textInput.value.style.height = 'auto';
        textInput.value.style.height = textInput.value.scrollHeight + 'px';
    }
}

watch(editableText, () => {
    if (props.widget.type === 'text' && isSelected.value) {
        nextTick(adjustHeight);
    }
});

watch(isSelected, (val) => {
    if (val && props.widget.type === 'text') {
        nextTick(() => {
            adjustHeight();
            textInput.value?.focus();
        });
    }
});

const textStyles = computed(() => {
    const baseSize = props.widget.fontSize || 12;
    const size = props.compact ? (baseSize * 0.7) : baseSize;
    return {
        fontSize: size + 'px',
        fontWeight: props.widget.fontWeight || 'normal',
        textAlign: props.widget.align || 'left',
        color: props.widget.color || '#000000',
        lineHeight: props.widget.lineHeight || 1.4,
        letterSpacing: props.widget.letterSpacing || 'normal',
        fontFamily: props.widget.fontFamily || 'inherit',
    };
});

// ─── Image Widget ───
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        emit('open-photo-editor', {
            path: props.path,
            src: ev.target.result,
            aspectRatio: props.widget.aspectRatio || null
        });
        e.target.value = ''; // Reset input
    };
    reader.readAsDataURL(file);
}

// ─── QR Code ───
const qrCanvas = ref(null);
const qrLoaded = ref(false);

async function renderQR() {
    if (props.widget.type !== 'qrcode' || !qrCanvas.value) return;
    try {
        const QRCode = (await import('qrcode')).default;
        await QRCode.toCanvas(qrCanvas.value, props.widget.value || 'https://example.com', {
            width: props.compact ? 50 : 120,
            margin: 1,
            color: { dark: '#000', light: '#fff' },
        });
        qrLoaded.value = true;
    } catch (e) { console.error('QR error:', e); }
}

onMounted(() => { if (props.widget.type === 'qrcode') nextTick(renderQR); });
watch(() => props.widget.value, () => { if (props.widget.type === 'qrcode') nextTick(renderQR); });

// ─── Barcode ───
const barcodeRef = ref(null);
const barcodeLoaded = ref(false);

async function renderBarcode() {
    if (props.widget.type !== 'barcode' || !barcodeRef.value) return;
    try {
        const JsBarcode = (await import('jsbarcode')).default;
        JsBarcode(barcodeRef.value, props.widget.value || '123456', {
            format: props.widget.format || 'CODE128',
            width: props.compact ? 1 : 2,
            height: props.compact ? 25 : 50,
            displayValue: true,
            fontSize: props.compact ? 8 : 12,
            margin: 2,
        });
        barcodeLoaded.value = true;
    } catch (e) { console.error('Barcode error:', e); }
}

onMounted(() => { if (props.widget.type === 'barcode') nextTick(renderBarcode); });
watch(() => props.widget.value, () => { if (props.widget.type === 'barcode') nextTick(renderBarcode); });

function addChild(colIndex, type = 'text') {
    const newChildren = [...(props.widget.children || [[], []])];
    const defaults = {
        text: { type: 'text', placeholder: 'Teks...', fontSize: 10, align: 'left' },
        image: { type: 'image', label: 'Image', fit: 'contain' },
        qrcode: { type: 'qrcode', value: 'https://example.com' },
        barcode: { type: 'barcode', value: '1234567890', format: 'CODE128' },
    };
    newChildren[colIndex] = [...(newChildren[colIndex] || []), defaults[type]];
    emit('update-widget', props.path, { children: newChildren });
}

// In synced mode, only the selected cell's widgets should be focusable/interactive
const isInteractive = computed(() => {
    if (!props.isSynced) return true;
    return props.cellIndex === props.selectedCellIndex;
});

function handleFocus() {
    if (isInteractive.value && !isSelected.value) {
        emit('select-widget', props.path);
    }
}
</script>

<template>
    <div @click.stop="emit('select-widget', path)" @focus="handleFocus"
        :tabindex="(isInteractive && !isSelected) ? 0 : -1"
        class="widget-renderer relative group/widget cursor-pointer outline-none focus:ring-2 focus:ring-red-600/50 focus:ring-offset-1"
        :class="[
            { 'ring-2 ring-red-600 ring-offset-1 print:!ring-0 print:!ring-offset-0': isSelected },
            { 'flex-1 w-full h-full flex flex-col': widget.type === 'image' }
        ]">

        <!-- TEXT -->
        <div v-if="widget.type === 'text'" class="w-full relative">
            <div v-if="isSelected" class="w-full">
                <textarea ref="textInput" v-model="editableText"
                    @input="emit('update-widget', path, { value: editableText })"
                    class="w-full bg-transparent border-none p-0 m-0 outline-none resize-none overflow-hidden block transition-all placeholder:text-slate-300"
                    :style="textStyles" rows="1" :placeholder="widget.placeholder || 'Ketik sesuatu...'"></textarea>
                <!-- Subtle indicator that it's being edited -->
                <div
                    class="absolute -inset-x-2 -inset-y-1 bg-red-50/30 -z-10 rounded-sm border border-red-100/50 pointer-events-none no-print">
                </div>
            </div>
            <div v-else class="w-full break-words whitespace-pre-wrap transition-all cursor-text"
                :class="{ 'text-slate-300 italic': !editableText && widget.placeholder }" :style="textStyles">
                {{ displayValue }}
            </div>
        </div>


        <!-- IMAGE -->
        <div v-else-if="widget.type === 'image'" class="flex-1 w-full h-full relative group/img overflow-hidden">
            <div v-if="widget.src" class="w-full h-full relative">
                <img :src="widget.src" class="absolute inset-0 w-full h-full aspect-1/4" :style="{
                    objectFit: widget.fit || 'cover',
                    filter: `brightness(${widget.brightness !== undefined ? widget.brightness : 100}%) contrast(${widget.contrast !== undefined ? widget.contrast : 100}%)`,
                    transform: `scale(${widget.zoom || 1}) rotate(${widget.rotation || 0}deg)`
                }" />

                <!-- Hover Edit Overlay -->
                <div v-if="!compact || isSelected"
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center no-print backdrop-blur-sm">
                    <button
                        @click.stop="emit('open-photo-editor', { path, src: widget.originalSrc || widget.src, aspectRatio: widget.aspectRatio })"
                        class="px-3 py-1.5 bg-white text-slate-800 rounded text-xs font-bold shadow hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                        <ImageIcon class="w-3.5 h-3.5" />
                        Edit Foto
                    </button>
                </div>
            </div>
            <label v-else
                class="absolute inset-0 w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors group/upload no-print"
                :class="compact ? 'p-1' : 'p-4'">
                <div
                    class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                    <ImageIcon class="w-4 h-4 text-slate-400 group-hover/upload:text-red-500" />
                </div>
                <span class="text-slate-500 font-medium text-center leading-tight"
                    :class="compact ? 'text-[8px]' : 'text-xs'">
                    {{ widget.label || 'Pilih Foto' }}
                </span>
                <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
            </label>
        </div>

        <!-- DIVIDER / SPACER -->
        <div v-else-if="widget.type === 'divider'" class="w-full flex flex-col justify-center"
            :style="{ height: (widget.height || 4) + 'mm' }">
            <hr v-if="widget.style !== 'transparent'" class="w-full border-t" :style="{
                borderStyle: widget.style || 'solid',
                borderColor: widget.color || '#d1d5db'
            }" />
        </div>

        <!-- QR CODE -->
        <div v-else-if="widget.type === 'qrcode'" class="flex justify-center">
            <canvas ref="qrCanvas" :class="compact ? 'w-[50px] h-[50px]' : 'w-[120px] h-[120px]'"></canvas>
        </div>

        <!-- BARCODE -->
        <div v-else-if="widget.type === 'barcode'" class="flex justify-center w-full">
            <svg ref="barcodeRef"></svg>
        </div>

        <!-- TABLE -->
        <div v-else-if="widget.type === 'table'" class="w-full">
            <table class="w-full border-collapse" :class="compact ? 'text-[6px]' : 'text-xs'">
                <thead>
                    <tr>
                        <th v-for="(col, ci) in (widget.columns || ['A', 'B', 'C'])" :key="ci"
                            class="border border-gray-300 bg-gray-100 font-semibold text-center"
                            :class="compact ? 'px-0.5 py-0' : 'px-2 py-1'">
                            {{ col }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in (widget.rows || 5)" :key="r">
                        <td v-for="(col, ci) in (widget.columns || ['A', 'B', 'C'])" :key="ci"
                            class="border border-gray-300" :class="compact ? 'px-0.5 py-0 h-3' : 'px-2 py-1.5 h-6'">
                        </td>
                    </tr>
                    <tr v-for="(sum, si) in (widget.summaryRows || [])" :key="'sum' + si">
                        <td :colspan="(widget.columns || ['A', 'B', 'C']).length - 1"
                            class="border border-gray-300 font-semibold text-center"
                            :class="compact ? 'px-0.5 py-0 h-3' : 'px-2 py-1.5 h-6'">
                            {{ sum }}
                        </td>
                        <td class="border border-gray-300" :class="compact ? 'px-0.5 py-0 h-3' : 'px-2 py-1.5 h-6'">
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- COLUMNS (Container / Items) -->
        <div v-else-if="widget.type === 'columns'" class="w-full flex" :style="{ gap: (widget.gap || 2) + 'mm' }">
            <!-- New Parent Format (Nested Widgets) -->
            <template v-if="widget.children">
                <div v-for="(col, ci) in (widget.colCount || 2)" :key="ci" class="flex flex-col transition-colors"
                    :class="!compact ? 'outline outline-1 outline-dashed outline-slate-200 hover:outline-slate-300 outline-offset-[-1px] print:outline-none' : ''"
                    :style="{
                        flex: (widget.colWidths && widget.colWidths[ci]) ? `${widget.colWidths[ci]} 1 0%` : '1 1 0%',
                        textAlign: widget.align || 'left',
                        gap: (widget.childGap || 1) + 'mm'
                    }">

                    <WidgetRenderer v-for="(child, chi) in (widget.children[ci] || [])" :key="chi" :widget="child"
                        :path="[...path, ci, chi]" :selectedPath="selectedPath" :compact="compact"
                        :cellIndex="cellIndex" :selectedCellIndex="selectedCellIndex" :isSynced="isSynced"
                        @select-widget="(p) => emit('select-widget', p)"
                        @update-widget="(p, val) => emit('update-widget', p, val)" />

                    <!-- Placeholder / Add Buttons -->
                    <div v-if="!compact && !widget.children[ci]?.length"
                        class="flex-1 flex flex-col items-center justify-center p-2 gap-1.5 opacity-50 hover:opacity-100 transition-opacity print:hidden">
                        <span class="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Tambah</span>
                        <div class="flex gap-0.5">
                            <button @click.stop="addChild(ci, 'text')"
                                class="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                                title="Text">
                                <Type class="w-3 h-3" />
                            </button>
                            <button @click.stop="addChild(ci, 'image')"
                                class="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                                title="Image">
                                <ImageIcon class="w-3 h-3" />
                            </button>
                            <button @click.stop="addChild(ci, 'qrcode')"
                                class="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                                title="QR Code">
                                <QrCode class="w-3 h-3" />
                            </button>
                            <button @click.stop="addChild(ci, 'barcode')"
                                class="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors"
                                title="Barcode">
                                <Barcode class="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- CHECKLIST -->
        <div v-else-if="widget.type === 'checklist'" class="w-full space-y-0.5">
            <div v-for="i in (widget.items || 10)" :key="i" class="flex items-center gap-1"
                :class="compact ? 'text-[7px]' : 'text-xs'">
                <div class="border border-gray-400 flex-shrink-0" :class="compact ? 'w-2 h-2' : 'w-3.5 h-3.5'"></div>
                <div class="flex-1" :style="{ borderBottom: '1px solid #e5e7eb' }" :class="compact ? 'h-2' : 'h-4'">
                </div>
            </div>
        </div>

        <!-- LINES -->
        <div v-else-if="widget.type === 'lines'" class="w-full">
            <div v-for="i in (widget.lineCount || 20)" :key="i" class="w-full"
                :style="{ borderBottom: '1px solid #cbd5e1', height: (compact ? 4 : (widget.lineSpacing || 8)) + 'mm' }">
            </div>
        </div>

        <!-- CALENDAR -->
        <div v-else-if="widget.type === 'calendar'" class="w-full">
            <!-- Calendar Title (Month & Year) -->
            <div v-if="widget.titleStyle?.show" class="uppercase tracking-widest" :style="{
                fontSize: (compact ? ((widget.titleStyle?.fontSize || 18) * 0.6) : (widget.titleStyle?.fontSize || 18)) + 'px',
                color: widget.titleStyle?.color || '#0f172a',
                fontWeight: widget.titleStyle?.fontWeight || 'bold',
                textAlign: widget.titleStyle?.align || 'center',
                marginBottom: (compact ? 2 : (widget.titleStyle?.marginBottom || 5)) + 'mm'
            }">
                {{ new Date(2000, (widget.month || 1) - 1).toLocaleString('id-ID', { month: 'long' }) }} {{ widget.year
                }}
            </div>

            <div class="grid grid-cols-7 border-t border-l border-gray-800">

                <!-- Days of week header -->
                <div v-for="day in weekDays" :key="day" class="text-center border-r border-b border-gray-800" :style="{
                    backgroundColor: widget.headerStyle?.bg || '#f3f4f6',
                    color: widget.headerStyle?.color || '#1f2937',
                    fontSize: (compact ? ((widget.headerStyle?.fontSize || 10) * 0.6) : (widget.headerStyle?.fontSize || 10)) + 'px',
                    fontWeight: widget.headerStyle?.fontWeight || 'bold',
                    height: (compact ? 4 : (widget.headerStyle?.height || 8)) + 'mm',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }">
                    {{ day }}
                </div>
                <!-- Dates grid -->
                <div v-for="(day, i) in calendarDays" :key="i" class="border-r border-b border-gray-800 relative"
                    :style="{
                        backgroundColor: (day && getHoliday(day)) ? (widget.holidayStyle?.bg || '#fff1f2') : (widget.dateStyle?.bg || '#ffffff'),
                        height: (compact ? 4 : (widget.dateStyle?.height || 25)) + 'mm',
                        padding: compact ? '2px' : '4px'
                    }">
                    <span v-if="widget.showDates && day" class="absolute top-1 left-1.5" :style="{
                        fontSize: (compact ? ((widget.dateStyle?.fontSize || 12) * 0.4) : (widget.dateStyle?.fontSize || 12)) + 'px',
                        fontWeight: (day && getHoliday(day)) ? 'bold' : (widget.dateStyle?.fontWeight || '600'),
                        color: (day && getHoliday(day)) ? (widget.holidayStyle?.color || '#dc2626') : (widget.dateStyle?.color || '#1e293b')
                    }">
                        {{ day }}
                    </span>

                    <!-- Holiday Name -->
                    <div v-if="!compact && getHoliday(day)"
                        class="absolute bottom-2 left-1.5 right-1 leading-none break-words" :style="{
                            fontSize: (widget.holidayStyle?.detailSize || 7) + 'px',
                            color: widget.holidayStyle?.detailColor || '#e11d48',
                            fontWeight: widget.holidayStyle?.detailWeight || 'bold'
                        }">
                        {{ getHoliday(day).name }}
                    </div>

                    <!-- Event Lines -->
                    <div v-if="!compact && day && widget.eventStyle?.show" class="mt-4 space-y-1 pr-1">
                        <hr v-for="l in 3" :key="l"
                            :style="{ border: 'none', height: '1px', backgroundColor: widget.eventStyle?.color || '#e2e8f0', marginBottom: (widget.eventStyle?.fontSize || 20) + 'px' }" />
                    </div>
                </div>
            </div>

            <!-- Holiday List Footer -->
            <div v-if="!compact && widget.holidayListStyle?.show && monthlyHolidays.length > 0"
                class="mt-3 flex flex-wrap gap-x-4 gap-y-1" :style="{
                    fontSize: (widget.holidayListStyle?.fontSize || 8) + 'px',
                    color: widget.holidayListStyle?.color || '#1e293b',
                    fontWeight: widget.holidayListStyle?.fontWeight || 'normal'
                }">
                <div v-for="h in monthlyHolidays" :key="h.date" class="flex items-center gap-1 whitespace-nowrap">
                    <span class="font-bold" :style="{ color: widget.holidayStyle?.color || '#dc2626' }">
                        {{ new Date(h.date).getDate() }}
                    </span>
                    <span>{{ h.name }}</span>
                </div>
            </div>

            <!-- Custom Event Footer (Future usage) -->
            <div v-if="!compact && widget.footerEventStyle?.show" class="mt-2" :style="{
                fontSize: (widget.footerEventStyle?.fontSize || 8) + 'px',
                color: widget.footerEventStyle?.color || '#64748b'
            }">
                <!-- Placeholder for custom events -->
            </div>
        </div>


        <!-- WEEKLY PLANNER -->
        <div v-else-if="widget.type === 'weekly_planner'" class="w-full">
            <!-- Vertical Layout -->
            <div v-if="widget.layout === 'vertical'" class="flex w-full border-t border-l border-gray-800">
                <div v-for="day in (widget.includeWeekend ? weekDays : weekDays.slice(0, 5))" :key="day"
                    class="flex-1 flex flex-col border-r border-gray-800">
                    <div class="text-center font-bold border-b border-gray-800 bg-gray-100 uppercase"
                        :class="compact ? 'text-[4px] py-0.5' : 'text-[10px] py-1.5'">
                        {{ day }}
                    </div>
                    <!-- Empty space for planning -->
                    <div class="w-full" :class="compact ? 'h-8' : 'min-h-[50mm]'"></div>
                </div>
                <div v-if="!widget.includeWeekend" class="flex-1 flex flex-col border-r border-gray-800 bg-gray-50/50">
                    <div class="text-center font-bold border-b border-gray-800 bg-gray-100 uppercase"
                        :class="compact ? 'text-[4px] py-0.5' : 'text-[10px] py-1.5'">Notes</div>
                    <div class="w-full" :class="compact ? 'h-8' : 'min-h-[50mm]'"></div>
                </div>
            </div>

            <!-- Horizontal Layout -->
            <div v-else class="flex flex-col w-full border-t border-gray-800 border-l border-r">
                <div v-for="day in (widget.includeWeekend ? weekDays : weekDays.slice(0, 5))" :key="day"
                    class="flex border-b border-gray-800">
                    <div class="font-bold border-r border-gray-800 bg-gray-50 flex items-start w-1/4"
                        :class="compact ? 'text-[5px] p-1' : 'text-xs p-2'">
                        {{ day }}
                    </div>
                    <div class="flex-1" :class="compact ? 'min-h-[6px]' : 'min-h-[25mm]'"></div>
                </div>
            </div>
        </div>

        <!-- UNKNOWN -->
        <div v-else class="p-2 text-xs text-gray-400 italic">
            Unknown widget: {{ widget.type }}
        </div>
    </div>
</template>

<style scoped>
.widget-renderer input::placeholder,
.widget-renderer textarea::placeholder {
    color: #cbd5e1;
}

/* Make text selection look more premium */
.widget-renderer textarea::selection {
    background: rgba(220, 38, 38, 0.1);
    color: inherit;
}

/* Smooth transition when selecting widgets */
.widget-renderer {
    transition: all 0.2s ease;
}
</style>
