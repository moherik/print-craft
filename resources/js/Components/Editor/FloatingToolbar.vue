<script setup>
import { RotateCcw, Undo2, Redo2, Minus, Plus, ZoomOut, ZoomIn, Maximize } from 'lucide-vue-next';

const props = defineProps({
    isSynced: Boolean,
    totalPages: { type: Number, default: 1 },
    zoom: { type: Number, default: 1 },
    canUndo: Boolean,
    canRedo: Boolean,
});

const emit = defineEmits([
    'update:isSynced', 'update:zoom', 'add-page', 'remove-page', 'fit-page', 'undo', 'redo'
]);

function adjustZoom(delta) {
    const newZoom = Math.max(0.3, Math.min(2, props.zoom + delta));
    emit('update:zoom', newZoom);
}
</script>

<template>
    <div class="no-print absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-3 py-2 z-40 shadow-lg rounded-lg flex items-center gap-1 max-w-[95vw] overflow-x-auto">

        <!-- Undo / Redo -->
        <div class="hidden lg:flex items-center gap-0.5">
            <button @click="emit('undo')" :disabled="!canUndo" title="Undo (Ctrl+Z)"
                class="p-1.5 rounded transition-colors"
                :class="canUndo ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'">
                <Undo2 class="w-4 h-4" />
            </button>
            <button @click="emit('redo')" :disabled="!canRedo" title="Redo (Ctrl+Shift+Z)"
                class="p-1.5 rounded transition-colors"
                :class="canRedo ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'">
                <Redo2 class="w-4 h-4" />
            </button>
        </div>

        <div class="hidden lg:block w-px h-5 bg-slate-200 mx-1"></div>

        <!-- Sync Toggle -->
        <button @click="emit('update:isSynced', !isSynced)"
            class="hidden lg:flex px-2 py-1 text-xs gap-1.5 font-medium border border-transparent hover:bg-slate-50 rounded transition-colors"
            :class="isSynced ? 'text-red-600 bg-red-50 border-red-200' : 'text-slate-500'">
            <RotateCcw class="w-3.5 h-3.5" :class="isSynced ? 'animate-spin-slow' : ''" />
            {{ isSynced ? 'Synced' : 'Unsynced' }}
        </button>

        <div class="w-px h-5 bg-slate-200 mx-1"></div>

        <!-- Page Controls -->
        <div class="flex items-center gap-1">
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

        <div class="w-px h-5 bg-slate-200 mx-1"></div>

        <!-- Zoom -->
        <div class="flex items-center gap-0.5">
            <button @click="emit('fit-page')" title="Fit to Page (Ctrl+0)" class="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors mr-0.5">
                <Maximize class="w-4 h-4" />
            </button>
            <button @click="adjustZoom(-0.1)" class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded transition-colors"><ZoomOut class="w-4 h-4" /></button>
            <span class="text-xs text-slate-700 w-10 text-center font-medium tabular-nums">{{ Math.round(zoom * 100) }}%</span>
            <button @click="adjustZoom(0.1)" class="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded transition-colors"><ZoomIn class="w-4 h-4" /></button>
        </div>

    </div>
</template>
