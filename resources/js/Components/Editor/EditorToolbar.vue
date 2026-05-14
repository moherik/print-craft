<script setup>
import { PAPER_SIZES } from '@/Composables/usePaperSize';
import { Link } from '@inertiajs/vue3';
import {
    ArrowLeft, Printer, Download, Loader2,
    Grid3x3, Ruler, FileText, AlignVerticalSpaceAround,
    RectangleVertical,
    RectangleHorizontal,
    Scan
} from 'lucide-vue-next';

const props = defineProps({
    paperSize: String, orientation: String,
    gridCols: Number, gridRows: Number,
    marginMm: Number, lineSpacing: Number,
    template: Object, category: Object, isExporting: Boolean,
    guideMode: String,
});

const emit = defineEmits([
    'update:paperSize', 'update:orientation', 'update:gridCols', 'update:gridRows',
    'update:marginMm', 'update:lineSpacing', 'print', 'export-pdf', 'update:guideMode'
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

            <!-- Grid -->
            <div class="hidden md:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <Grid3x3 class="w-4 h-4 text-slate-400" title="Grid Layout" />
                <input type="number" :value="gridCols"
                    @input="emit('update:gridCols', Math.max(1, +$event.target.value))" min="1" max="10"
                    class="w-12 bg-white border border-slate-300 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 outline-none" />
                <span class="text-slate-400 text-xs font-bold">×</span>
                <input type="number" :value="gridRows"
                    @input="emit('update:gridRows', Math.max(1, +$event.target.value))" min="1" max="15"
                    class="w-12 bg-white border border-slate-300 text-xs text-center text-slate-800 py-1.5 focus:border-red-600 outline-none" />
            </div>

            <!-- Margin & Guides -->
            <div class="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <Ruler class="w-4 h-4 text-slate-400" title="Margin & Guides" />
                <input type="range" :value="marginMm" @input="emit('update:marginMm', +$event.target.value)" min="0"
                    max="30" class="w-16 h-1 bg-slate-200 accent-red-600 appearance-none rounded" />
                <span class="text-xs text-slate-600 w-8 font-medium">{{ marginMm }}mm</span>
                
                <div class="h-4 border-l border-slate-200 mx-1"></div>

                <button @click="emit('update:guideMode', guideMode === 'none' ? 'crop' : guideMode === 'crop' ? 'full' : 'none')"
                    class="flex items-center px-1.5 py-1 text-[11px] gap-1 font-medium border border-transparent hover:bg-slate-50 transition-colors justify-center rounded"
                    :class="guideMode !== 'none' ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-500'">
                    <Scan v-if="guideMode === 'crop'" class="w-3.5 h-3.5" />
                    <Grid3x3 v-else-if="guideMode === 'full'" class="w-3.5 h-3.5" />
                    <Scan v-else class="w-3.5 h-3.5 opacity-50" />
                    <span class="w-8 text-left">{{ guideMode === 'crop' ? 'Crop' : guideMode === 'full' ? 'Full' : 'Off' }}</span>
                </button>
            </div>

            <!-- Line Spacing -->
            <div class="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <AlignVerticalSpaceAround class="w-4 h-4 text-slate-400" title="Line Spacing" />
                <select :value="lineSpacing" @change="emit('update:lineSpacing', +$event.target.value)"
                    class="bg-white border border-slate-300 text-xs text-slate-800 py-1.5 focus:border-red-600 outline-none">
                    <option :value="1.0">1.0</option>
                    <option :value="1.15">1.15</option>
                    <option :value="1.5">1.5</option>
                    <option :value="2.0">2.0</option>
                </select>
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
