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
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <!-- Page Header -->
            <div class="mb-10 text-center max-w-2xl mx-auto">
                <div
                    class="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <Link :href="route('home')" class="hover:text-red-600 transition-colors">Home</Link>
                    <span>/</span>
                    <span class="text-slate-800">{{ pageTitle }}</span>
                </div>
                <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">{{ pageTitle }}</h1>
                <p v-if="activeCategory" class="text-slate-500 mt-3 text-lg leading-relaxed">{{
                    activeCategory.description }}</p>
                <p v-else class="text-slate-500 mt-3 text-lg leading-relaxed">Pilih dari koleksi template kami yang
                    sudah dikurasi untuk membantu kebutuhan cetak Anda.</p>
            </div>

            <!-- Toolbar Filter (Compact Boxy Style) -->
            <div class="sticky top-16 z-20 bg-white border border-slate-300 p-1.5 mb-8 shadow-sm max-w-4xl mx-auto">
                <div class="flex flex-col md:flex-row items-stretch gap-1.5">
                    <!-- Search -->
                    <div class="relative flex-1">
                        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input v-model="searchQuery" type="text" placeholder="Cari desain..."
                            class="w-full bg-slate-50 border border-slate-200 pr-4 pl-9 py-2 rounded-none text-sm focus:bg-white focus:border-red-600 focus:ring-0 outline-none font-medium transition-all" />
                    </div>

                    <!-- Filters Group -->
                    <div class="flex items-stretch gap-1.5">
                        <!-- Category Select -->
                        <div class="relative min-w-[150px] flex items-stretch">
                            <SlidersHorizontal
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select v-model="selectedCategory"
                                class="w-full bg-slate-50 border border-slate-200 pr-4 pl-9 py-2 rounded-none text-sm appearance-none focus:bg-white focus:border-red-600 focus:ring-0 outline-none cursor-pointer font-medium"
                                style="-webkit-appearance: none; -moz-appearance: none; appearance: none;">
                                <option :value="null">Kategori</option>
                                <option v-for="cat in CATEGORIES" :key="cat.id" :value="cat.slug">{{ cat.name }}
                                </option>
                            </select>
                        </div>

                        <!-- Paper Size Select -->
                        <div class="relative min-w-[130px] flex items-stretch">
                            <LayoutGrid
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select v-model="selectedPaperSize"
                                class="w-full bg-slate-50 border border-slate-200 pr-4 pl-9 py-2 rounded-none text-sm appearance-none focus:bg-white focus:border-red-600 focus:ring-0 outline-none cursor-pointer font-medium"
                                style="-webkit-appearance: none; -moz-appearance: none; appearance: none;">
                                <option :value="null">Ukuran</option>
                                <option v-for="size in paperSizes" :key="size" :value="size">{{ size }}</option>
                            </select>
                        </div>

                        <!-- Clear Button -->
                        <button v-if="searchQuery || selectedCategory || selectedPaperSize" @click="clearFilters"
                            class="px-3 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors flex items-center justify-center border-none outline-none focus:ring-0"
                            title="Reset Filter">
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Masonry Grid -->
            <div v-if="filteredTemplates.length > 0">
                <div class="flex items-center justify-between mb-6">
                    <p class="text-sm font-medium text-slate-500">
                        Menampilkan <span class="text-slate-900 font-bold">{{ filteredTemplates.length }}</span> desain
                        unik
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div v-for="tpl in filteredTemplates" :key="tpl.id">
                        <TemplateCard :template="tpl" />
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <div class="w-20 h-20 bg-slate-50 flex items-center justify-center mx-auto rounded-2xl mb-6">
                    <Search class="w-10 h-10 text-slate-300" />
                </div>
                <h3 class="text-2xl font-bold text-slate-900 mb-2">Pencarian tidak membuahkan hasil</h3>
                <p class="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Maaf, kami tidak menemukan
                    template yang Anda cari. Coba gunakan kata kunci yang lebih umum.</p>
                <button @click="clearFilters" class="btn-primary px-8 py-3">Lihat Semua Template</button>
            </div>
        </div>
    </AppLayout>
</template>
