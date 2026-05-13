<script setup>
import {
    Type, Image, Table2, QrCode, Barcode, Square,
    CheckSquare, Minus, ListOrdered, Plus,
    Calendar, CalendarDays
} from 'lucide-vue-next';
import draggable from 'vuedraggable';
import { WIDGET_DEFAULTS } from '@/Data/widgets';

const emit = defineEmits(['add-widget']);

const widgetTypes = [
    { type: 'text', label: 'Text', icon: Type, desc: 'Teks yang bisa diedit' },
    { type: 'image', label: 'Gambar', icon: Image, desc: 'Upload gambar' },
    { type: 'table', label: 'Tabel', icon: Table2, desc: 'Tabel dinamis' },
    { type: 'qrcode', label: 'QR Code', icon: QrCode, desc: 'Generate QR code' },
    { type: 'barcode', label: 'Barcode', icon: Barcode, desc: 'Generate barcode' },
    { type: 'divider', label: 'Divider', icon: Minus, desc: 'Garis pemisah' },
    { type: 'checklist', label: 'Checklist', icon: CheckSquare, desc: 'Daftar centang' },
    { type: 'lines', label: 'Garis Tulis', icon: ListOrdered, desc: 'Garis untuk menulis' },
    { type: 'columns', label: 'Kolom', icon: Square, desc: 'Layout kolom sejajar' },
    { type: 'calendar', label: 'Kalender', icon: Calendar, desc: 'Kalender bulanan' },
    { type: 'weekly_planner', label: 'Weekly Planner', icon: CalendarDays, desc: 'Jadwal mingguan' },
];

function cloneWidget(w) {
    return JSON.parse(JSON.stringify(WIDGET_DEFAULTS[w.type]));
}
</script>

<template>
    <div class="w-56 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
        <div class="p-4">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Komponen</h3>
            <draggable
                :list="widgetTypes"
                :group="{ name: 'widgets', pull: 'clone', put: false }"
                :clone="cloneWidget"
                item-key="type"
                class="space-y-1"
            >
                <template #item="{ element: w }">
                    <button
                        @click="emit('add-widget', w.type)"
                        class="w-full flex items-center gap-3 px-3 py-2.5 border border-transparent text-left text-sm text-slate-700 hover:text-red-700 hover:bg-red-50 hover:border-red-100 transition-all duration-200 group cursor-grab active:cursor-grabbing"
                    >
                        <div class="w-8 h-8 bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-colors">
                            <component :is="w.icon" class="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-colors" />
                        </div>
                        <div>
                            <div class="font-bold text-xs text-slate-800 group-hover:text-red-700">{{ w.label }}</div>
                            <div class="text-[10px] text-slate-500 group-hover:text-red-500">{{ w.desc }}</div>
                        </div>
                        <Plus class="w-3.5 h-3.5 text-red-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </template>
            </draggable>
        </div>
    </div>
</template>
