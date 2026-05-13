<script setup>
import { PAPER_SIZES } from '@/Composables/usePaperSize';
import { Link } from '@inertiajs/vue3';
import {
    ArrowLeft, Printer, Download, ZoomIn, ZoomOut, Maximize,
    RotateCcw, Grid3x3, Ruler, FileText, Loader2,
    Minus, Plus
} from 'lucide-vue-next';

const props = defineProps({
    paperSize: String, orientation: String,
    gridCols: Number, gridRows: Number,
    marginMm: Number, showCropMarks: Boolean, zoom: Number,
    isSynced: Boolean, lineSpacing: Number,
    template: Object, category: Object, isExporting: Boolean,
    totalPages: { type: Number, default: 1 }
});

const emit = defineEmits([
    'update:paperSize', 'update:orientation', 'update:gridCols', 'update:gridRows',
    'update:marginMm', 'update:showCropMarks', 'update:zoom', 'update:isSynced', 'update:lineSpacing', 
    'print', 'export-pdf', 'add-page', 'remove-page'
]);

const paperSizes = Object.keys(PAPER_SIZES);

function adjustZoom(delta) {
    const newZoom = Math.max(0.3, Math.min(2, props.zoom + delta));
    emit('update:zoom', newZoom);
}
</script>

<template>
    <div class="no-print bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0 z-20 shadow-sm">
        <div class="flex items-center gap-4 flex-wrap">
            <!-- Back + Title -->
            <div class="flex items-center gap-3 mr-auto border-r border-slate-200 pr-4 py-1">
                <Link :href="route('templates.index')" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <ArrowLeft class="w-5 h-5" />
                </Link>
                <div class="hidden sm:block">
                    <h2 class="text-sm font-bold text-slate-900 leading-tight">{{ template?.name || 'Editor' }}</h2>
                    <p v-if="category" class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{{ category.name }}</p>
                </div>
            </div>

            <!-- Paper Size -->
            <div class="flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-slate-400" />
                <select :value="paperSize" @change="emit('update:paperSize', $event.target.value)"
                    class="bg-white border border-slate-300 text-xs text-slate-800 px-2 py-1.5 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none">
                    <option v-for="s in paperSizes" :key="s" :value="s">{{ PAPER_SIZES[s].label }}</option>
                </select>
            </div>

            <!-- Orientation -->
            <div class="flex items-center bg-slate-100 border border-slate-300 p-0.5">
                <button @click="emit('update:orientation', 'portrait')"
                    class="px-2.5 py-1 text-xs font-medium transition-colors"
                    :class="orientation === 'portrait' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    ↕ Portrait
                </button>
                <button @click="emit('update:orientation', 'landscape')"
                    class="px-2.5 py-1 text-xs font-medium transition-colors"
                    :class="orientation === 'landscape' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    ↔ Landscape
                </button>
            </div>

            <!-- Grid -->
            <div class="hidden md:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <Grid3x3 class="w-4 h-4 text-slate-400" title="Grid Layout" />
                <input type="number" :value="gridCols" @input="emit('update:gridCols', Math.max(1, +$event.target.value))"
                    min="1" max="10" class="w-12 bg-white border border-slate-300 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 outline-none" />
                <span class="text-slate-400 text-xs font-bold">×</span>
                <input type="number" :value="gridRows" @input="emit('update:gridRows', Math.max(1, +$event.target.value))"
                    min="1" max="15" class="w-12 bg-white border border-slate-300 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 outline-none" />
            </div>

            <!-- Margin -->
            <div class="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <Ruler class="w-4 h-4 text-slate-400" title="Margin" />
                <input type="range" :value="marginMm" @input="emit('update:marginMm', +$event.target.value)"
                    min="0" max="30" class="w-20 h-1 bg-slate-200 accent-red-600 appearance-none rounded" />
                <span class="text-xs text-slate-600 w-8 font-medium">{{ marginMm }}mm</span>
            </div>

            <!-- Line Spacing -->
            <div class="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span class="text-xs font-bold text-slate-400" title="Line Spacing">↕</span>
                <select :value="lineSpacing" @change="emit('update:lineSpacing', +$event.target.value)"
                    class="bg-white border border-slate-300 text-xs text-slate-800 py-1.5 focus:border-red-600 outline-none">
                    <option :value="1.0">1.0</option>
                    <option :value="1.15">1.15</option>
                    <option :value="1.5">1.5</option>
                    <option :value="2.0">2.0</option>
                </select>
            </div>

            <!-- Crop Marks -->
            <button @click="emit('update:showCropMarks', !showCropMarks)"
                class="hidden lg:flex px-2 py-1 text-xs gap-1 font-medium border border-transparent hover:bg-slate-50"
                :class="showCropMarks ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-500'">
                <span>✂</span> Crop
            </button>

            <!-- Sync Toggle -->
            <button @click="emit('update:isSynced', !isSynced)"
                class="hidden lg:flex px-2 py-1 text-xs gap-1 font-medium border border-transparent hover:bg-slate-50"
                :class="isSynced ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-500'">
                <RotateCcw class="w-3.5 h-3.5" :class="isSynced ? 'animate-spin-slow' : ''" />
                {{ isSynced ? 'Synced' : 'Unsynced' }}
            </button>

            <!-- Page Controls -->
            <div class="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <button @click="emit('remove-page')" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-20" :disabled="totalPages <= 1">
                    <Minus class="w-4 h-4" />
                </button>
                <div class="text-[10px] font-bold text-slate-600 uppercase tracking-wider min-w-[70px] text-center">
                    {{ totalPages }} Halaman
                </div>
                <button @click="emit('add-page')" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Plus class="w-4 h-4" />
                </button>
            </div>

            <!-- Zoom -->
            <div class="flex items-center gap-1 border-l border-slate-200 pl-4">
                <button @click="adjustZoom(-0.1)" class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"><ZoomOut class="w-4 h-4" /></button>
                <span class="text-xs text-slate-700 w-10 text-center font-medium">{{ Math.round(zoom * 100) }}%</span>
                <button @click="adjustZoom(0.1)" class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"><ZoomIn class="w-4 h-4" /></button>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button @click="emit('print')" class="btn-secondary text-xs px-3 py-1.5 shadow-sm">
                    <Printer class="w-4 h-4" /> <span class="hidden sm:inline">Print</span>
                </button>
                <button @click="emit('export-pdf')" :disabled="isExporting" class="btn-primary text-xs px-3 py-1.5 shadow-sm">
                    <Loader2 v-if="isExporting" class="w-4 h-4 animate-spin" />
                    <Download v-else class="w-4 h-4" />
                    <span class="hidden sm:inline">{{ isExporting ? 'Exporting...' : 'PDF' }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
