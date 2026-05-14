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
    <Link
        :href="route('templates.editor', template.slug)"
        class="glass-card-hover group cursor-pointer overflow-hidden flex flex-col bg-white"
    >
        <!-- Preview Area -->
        <div class="relative aspect-[3/4] bg-slate-100 overflow-hidden flex items-center justify-center p-6 border-b border-slate-200">
            <!-- Paper preview illustration -->
            <div
                class="relative bg-white border border-slate-300 shadow-sm transition-transform duration-300 group-hover:scale-105"
                :style="{
                    width: template.orientation === 'landscape' ? '85%' : '65%',
                    height: template.orientation === 'landscape' ? '60%' : '80%',
                }"
            >
                <!-- Grid lines preview -->
                <div class="absolute inset-2 opacity-50">
                    <div class="w-full h-full grid"
                        :style="{
                            gridTemplateColumns: `repeat(${template.gridCols}, 1fr)`,
                            gridTemplateRows: `repeat(${template.gridRows}, 1fr)`,
                            gap: '2px',
                        }">
                        <div
                            v-for="i in template.gridCols * template.gridRows"
                            :key="i"
                            class="border border-dashed border-slate-300"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- Orientation badge -->
            <div class="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-medium">
                <RectangleHorizontal v-if="template.orientation === 'landscape'" class="w-3.5 h-3.5" />
                <RectangleVertical v-else class="w-3.5 h-3.5" />
                {{ template.orientation === 'landscape' ? 'Landscape' : 'Portrait' }}
            </div>

            <!-- Paper size badge -->
            <div class="absolute top-3 left-3 px-2 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-bold">
                {{ template.paperSize }}
            </div>

            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span class="px-5 py-2 bg-red-600 text-white text-sm font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    Gunakan Template
                    <ArrowRight class="w-4 h-4" />
                </span>
            </div>
        </div>

        <!-- Info -->
        <div class="p-5 flex-1 flex flex-col bg-white">
            <div class="flex items-center gap-2 mb-3">
                <span v-if="category" class="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {{ category.name }}
                </span>
                <span class="px-2 py-1 border border-slate-200 text-slate-500 text-[10px] font-bold">
                    {{ template.gridCols }}×{{ template.gridRows }}
                </span>
            </div>
            <h3 class="font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-1">{{ template.name }}</h3>
            <p class="text-sm text-slate-600 line-clamp-2 flex-1 leading-relaxed">{{ template.description }}</p>
        </div>
    </Link>
</template>
