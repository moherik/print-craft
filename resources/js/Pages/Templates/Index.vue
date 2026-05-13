<script setup>
import { Head, Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import TemplateCard from '@/Components/TemplateCard.vue';
import { ref, computed, onMounted } from 'vue';
import { CATEGORIES, TEMPLATES, searchTemplates, getTemplatesByCategory, getCategoryBySlug } from '@/Data/templates';
import { Search, Filter, X, LayoutGrid, List, SlidersHorizontal } from 'lucide-vue-next';

const props = defineProps({
    categorySlug: { type: String, default: null },
});

const searchQuery = ref('');
const selectedCategory = ref(props.categorySlug || null);
const selectedPaperSize = ref(null);
const showFilters = ref(false);

// Read search query from URL
onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) searchQuery.value = q;
});

const activeCategory = computed(() => {
    return selectedCategory.value ? getCategoryBySlug(selectedCategory.value) : null;
});

const filteredTemplates = computed(() => {
    let results = TEMPLATES;

    // Filter by search
    if (searchQuery.value.trim()) {
        results = searchTemplates(searchQuery.value);
    }

    // Filter by category
    if (selectedCategory.value) {
        results = results.filter(t => t.categoryId === selectedCategory.value);
    }

    // Filter by paper size
    if (selectedPaperSize.value) {
        results = results.filter(t => t.paperSize === selectedPaperSize.value);
    }

    return results;
});

const paperSizes = ['A4', 'A5', 'A6', 'Letter', 'F4'];

function clearFilters() {
    searchQuery.value = '';
    selectedCategory.value = null;
    selectedPaperSize.value = null;
}

const pageTitle = computed(() => {
    if (activeCategory.value) return `${activeCategory.value.name} Templates`;
    if (searchQuery.value) return `Hasil pencarian: "${searchQuery.value}"`;
    return 'Semua Template';
});
</script>

<template>
    <Head :title="pageTitle" />

    <AppLayout>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Page Header -->
            <div class="mb-8 border-b border-slate-200 pb-6">
                <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link :href="route('home')" class="hover:text-red-600 transition-colors">Home</Link>
                    <span>/</span>
                    <span class="text-slate-800">{{ pageTitle }}</span>
                </div>
                <h1 class="text-3xl font-bold text-slate-900">{{ pageTitle }}</h1>
                <p v-if="activeCategory" class="text-slate-600 mt-2 max-w-3xl">{{ activeCategory.description }}</p>
            </div>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Sidebar Filters (Desktop) -->
                <aside class="hidden lg:block w-64 flex-shrink-0">
                    <div class="bg-white border border-slate-200 p-5 sticky top-20 space-y-6">
                        <!-- Search -->
                        <div>
                            <label class="text-sm font-bold text-slate-900 mb-2 block">Pencarian</label>
                            <div class="relative">
                                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Cari template..."
                                    class="input-field pl-9 text-sm"
                                />
                            </div>
                        </div>

                        <!-- Categories -->
                        <div>
                            <label class="text-sm font-bold text-slate-900 mb-3 block">Kategori</label>
                            <div class="space-y-1">
                                <button
                                    @click="selectedCategory = null"
                                    class="w-full text-left px-3 py-2 text-sm transition-colors border-l-2"
                                    :class="!selectedCategory ? 'border-red-600 bg-red-50 text-red-700 font-medium' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                                >
                                    Semua Kategori
                                </button>
                                <button
                                    v-for="cat in CATEGORIES"
                                    :key="cat.id"
                                    @click="selectedCategory = cat.slug"
                                    class="w-full text-left px-3 py-2 text-sm transition-colors border-l-2 flex items-center gap-2"
                                    :class="selectedCategory === cat.slug ? 'border-red-600 bg-red-50 text-red-700 font-medium' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                                >
                                    <component :is="cat.iconComponent" class="w-4 h-4" />
                                    {{ cat.name }}
                                </button>
                            </div>
                        </div>

                        <!-- Paper Size -->
                        <div>
                            <label class="text-sm font-bold text-slate-900 mb-3 block">Ukuran Kertas</label>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    @click="selectedPaperSize = null"
                                    class="badge transition-colors"
                                    :class="!selectedPaperSize ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
                                >
                                    Semua
                                </button>
                                <button
                                    v-for="size in paperSizes"
                                    :key="size"
                                    @click="selectedPaperSize = size"
                                    class="badge transition-colors"
                                    :class="selectedPaperSize === size ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
                                >
                                    {{ size }}
                                </button>
                            </div>
                        </div>

                        <!-- Clear -->
                        <button
                            v-if="searchQuery || selectedCategory || selectedPaperSize"
                            @click="clearFilters"
                            class="w-full btn-ghost text-sm text-red-600 hover:bg-red-50 justify-center border border-transparent hover:border-red-100"
                        >
                            <X class="w-4 h-4" />
                            Reset Filter
                        </button>
                    </div>
                </aside>

                <!-- Mobile Filter Toggle -->
                <div class="lg:hidden">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="relative flex-1">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input v-model="searchQuery" type="text" placeholder="Cari template..." class="input-field pl-9 text-sm" />
                        </div>
                        <button @click="showFilters = !showFilters" class="btn-secondary px-3 py-2">
                            <SlidersHorizontal class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Mobile filters panel -->
                    <div v-show="showFilters" class="bg-white border border-slate-200 p-4 mb-4 space-y-4 shadow-sm">
                        <div class="flex flex-wrap gap-2">
                            <button
                                @click="selectedCategory = null"
                                class="badge transition-colors"
                                :class="!selectedCategory ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'"
                            >Semua</button>
                            <button
                                v-for="cat in CATEGORIES"
                                :key="cat.id"
                                @click="selectedCategory = cat.slug"
                                class="badge transition-colors"
                                :class="selectedCategory === cat.slug ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'"
                            >{{ cat.name }}</button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="size in paperSizes"
                                :key="size"
                                @click="selectedPaperSize = selectedPaperSize === size ? null : size"
                                class="badge transition-colors"
                                :class="selectedPaperSize === size ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300'"
                            >{{ size }}</button>
                        </div>
                    </div>
                </div>

                <!-- Template Grid -->
                <div class="flex-1">
                    <!-- Results count -->
                    <div class="flex items-center justify-between mb-5">
                        <p class="text-sm text-slate-500">
                            <span class="font-bold text-slate-900">{{ filteredTemplates.length }}</span> template ditemukan
                        </p>
                    </div>

                    <!-- Grid -->
                    <div v-if="filteredTemplates.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <TemplateCard
                            v-for="tpl in filteredTemplates"
                            :key="tpl.id"
                            :template="tpl"
                        />
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-20 bg-white border border-slate-200">
                        <div class="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Search class="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">Tidak ada template ditemukan</h3>
                        <p class="text-slate-500 text-sm mb-6">Coba kata kunci lain atau reset filter.</p>
                        <button @click="clearFilters" class="btn-primary text-sm">Reset Filter</button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>
