<script setup>
import { Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import { CATEGORIES } from '@/Data/templates';
import { ArrowRight, RectangleHorizontal, RectangleVertical } from 'lucide-vue-next';

const props = defineProps({
    template: {
        type: Object,
        required: true,
    },
});

const category = computed(() => {
    return CATEGORIES.find(c => c.id === props.template.categoryId);
});
</script>

<template>
    <Link :href="route('templates.editor', template.slug)"
        class="glass-card-hover group cursor-pointer overflow-hidden flex flex-col bg-white border border-slate-200">
        <!-- Preview Area (Compact) -->
        <div
            class="relative aspect-[4/3] bg-slate-50 overflow-hidden flex items-center justify-center p-4 border-b border-slate-100">
            <!-- Paper preview illustration -->
            <div class="relative bg-white border border-slate-300 shadow-sm transition-transform duration-300 group-hover:scale-105"
                :style="{
                    width: template.orientation === 'landscape' ? '70%' : '50%',
                    height: template.orientation === 'landscape' ? '50%' : '70%',
                }">
                <!-- Grid lines preview -->
                <div class="absolute inset-1.5 opacity-40">
                    <div class="w-full h-full grid" :style="{
                        gridTemplateColumns: `repeat(${template.gridCols}, 1fr)`,
                        gridTemplateRows: `repeat(${template.gridRows}, 1fr)`,
                        gap: '1px',
                    }">
                        <div v-for="i in template.gridCols * template.gridRows" :key="i"
                            class="border border-dashed border-slate-300"></div>
                    </div>
                </div>
            </div>

            <!-- Orientation badge (Compact) -->
            <div
                class="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-white/90 border border-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-tighter">
                <RectangleHorizontal v-if="template.orientation === 'landscape'" class="w-3 h-3" />
                <RectangleVertical v-else class="w-3 h-3" />
                {{ template.orientation === 'landscape' ? 'Landscape' : 'Portrait' }}
            </div>

            <!-- Paper size badge (Compact) -->
            <div
                class="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-tighter">
                {{ template.paperSize }}
            </div>

            <!-- Hover overlay -->
            <div
                class="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span
                    class="px-4 py-1.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    Gunakan Template
                    <ArrowRight class="w-3.5 h-3.5" />
                </span>
            </div>
        </div>

        <!-- Info (Compact) -->
        <div class="p-3 flex flex-col bg-white">
            <div class="flex items-center gap-1.5 mb-1.5">
                <span v-if="category"
                    class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-tight">
                    {{ category.name }}
                </span>
                <span class="px-1.5 py-0.5 border border-slate-200 text-slate-400 text-[9px] font-bold">
                    {{ template.gridCols }}×{{ template.gridRows }}
                </span>
            </div>
            <h3 class="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors line-clamp-1">{{
                template.name }}</h3>
            <p class="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">{{ template.description }}</p>
        </div>
    </Link>
</template>
