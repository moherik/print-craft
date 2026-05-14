<script setup>
import { PAPER_SIZES } from '@/Composables/usePaperSize';
import { Link } from '@inertiajs/vue3';
import {
    ArrowLeft, Printer, Download, Loader2,
    Grid3x3, Ruler, FileText, AlignVerticalSpaceAround,
    RectangleVertical,
    RectangleHorizontal,
    Scan, Layers
} from 'lucide-vue-next';

const props = defineProps({
    paperSize: String, orientation: String,
    gridCols: Number, gridRows: Number,
    marginMm: Number, lineSpacing: Number,
    template: Object, category: Object, isExporting: Boolean,
    guideMode: String, printQuantity: Number, isSynced: Boolean,
});

const emit = defineEmits([
    'update:paperSize', 'update:orientation', 'update:gridCols', 'update:gridRows',
    'update:marginMm', 'update:lineSpacing', 'print', 'export-pdf', 'update:guideMode', 'update:printQuantity'
]);

const paperSizes = Object.keys(PAPER_SIZES);
</script>

<template>
    <div class="no-print bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0 z-20 shadow-sm">
        <div class="flex items-center gap-4 flex-wrap">
            <!-- Back + Title -->
            <div class="flex items-center gap-3 mr-auto border-r border-slate-200 pr-4 py-1">
                <Link :href="route('templates.index')"
                    class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <ArrowLeft class="w-5 h-5" />
                </Link>
                <div class="hidden sm:block">
                    <h2 class="text-sm font-bold text-slate-900 leading-tight">{{ template?.name || 'Editor' }}</h2>
                    <p v-if="category" class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{{
                        category.name }}</p>
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
                    class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors"
                    :class="orientation === 'portrait' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    <RectangleVertical class="w-3.5 h-3.5" /> Portrait
                </button>
                <button @click="emit('update:orientation', 'landscape')"
                    class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors"
                    :class="orientation === 'landscape' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'">
                    <RectangleHorizontal class="w-3.5 h-3.5" /> Landscape
                </button>
            </div>





            <!-- Actions -->
            <div class="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button @click="emit('print')" class="btn-secondary text-xs px-3 py-1.5 shadow-sm">
                    <Printer class="w-4 h-4" /> <span class="hidden sm:inline">Print</span>
                </button>
                <button @click="emit('export-pdf')" :disabled="isExporting"
                    class="btn-primary text-xs px-3 py-1.5 shadow-sm">
                    <Loader2 v-if="isExporting" class="w-4 h-4 animate-spin" />
                    <Download v-else class="w-4 h-4" />
                    <span class="hidden sm:inline">{{ isExporting ? 'Exporting...' : 'PDF' }}</span>
                </button>
            </div>
        </div>
    </div>
</template>
