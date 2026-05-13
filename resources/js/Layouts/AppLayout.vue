<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { Search, Menu, X, Printer, ChevronDown } from 'lucide-vue-next';
import { CATEGORIES } from '@/Data/templates';

const props = defineProps({
    hideHeader: { type: Boolean, default: false },
    hideFooter: { type: Boolean, default: false },
});

const showMobileMenu = ref(false);
const showCategoryDropdown = ref(false);
const searchQuery = ref('');

function handleSearch() {
    if (searchQuery.value.trim()) {
        window.location.href = route('templates.index') + '?q=' + encodeURIComponent(searchQuery.value);
    }
}
</script>

<template>
    <div class="min-h-screen flex flex-col bg-slate-50">
        <!-- Navbar -->
        <header v-if="!hideHeader" class="no-print sticky top-0 z-50 bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-14">
                    <!-- Logo -->
                    <Link :href="route('home')" class="flex items-center gap-2 group">
                        <div class="w-8 h-8 bg-red-600 flex items-center justify-center">
                            <Printer class="w-5 h-5 text-white" />
                        </div>
                        <span class="text-lg font-bold text-slate-900 tracking-tight">PrintCraft</span>
                    </Link>

                    <!-- Desktop Nav -->
                    <div class="hidden md:flex items-center gap-2">
                        <Link :href="route('home')" class="btn-ghost text-sm">Home</Link>

                        <!-- Category Dropdown -->
                        <div class="relative" @mouseenter="showCategoryDropdown = true" @mouseleave="showCategoryDropdown = false">
                            <button class="btn-ghost text-sm flex items-center gap-1">
                                Kategori
                                <ChevronDown class="w-4 h-4" />
                            </button>
                            <div v-show="showCategoryDropdown" class="absolute top-full left-0 w-64 bg-white border border-slate-200 shadow-lg">
                                <Link
                                    v-for="cat in CATEGORIES"
                                    :key="cat.id"
                                    :href="route('categories.show', cat.slug)"
                                    class="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                >
                                    <div class="w-8 h-8 flex items-center justify-center" :class="cat.bgClass">
                                        <component :is="cat.iconComponent" class="w-4 h-4" :class="cat.textClass" />
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-slate-800">{{ cat.name }}</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <Link :href="route('templates.index')" class="btn-ghost text-sm">Semua Template</Link>
                    </div>

                    <!-- Search Bar (Desktop) -->
                    <div class="hidden md:flex items-center">
                        <form @submit.prevent="handleSearch" class="relative">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari template..."
                                class="w-64 pl-9 pr-3 py-1.5 bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                            />
                        </form>
                    </div>

                    <!-- Mobile Menu Button -->
                    <button @click="showMobileMenu = !showMobileMenu" class="md:hidden p-2 text-slate-600 hover:text-red-600">
                        <Menu v-if="!showMobileMenu" class="w-5 h-5" />
                        <X v-else class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div v-show="showMobileMenu" class="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-md">
                <form @submit.prevent="handleSearch" class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Cari template..." class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600" />
                </form>
                <Link :href="route('home')" class="block px-3 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50">Home</Link>
                <Link :href="route('templates.index')" class="block px-3 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50">Semua Template</Link>
                <div class="pt-2 border-t border-slate-100">
                    <p class="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</p>
                    <Link
                        v-for="cat in CATEGORIES"
                        :key="cat.id"
                        :href="route('categories.show', cat.slug)"
                        class="block px-3 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50"
                        @click="showMobileMenu = false"
                    >
                        {{ cat.name }}
                    </Link>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1">
            <slot />
        </main>

        <!-- Footer -->
        <footer v-if="!hideFooter" class="no-print border-t border-slate-200 bg-white mt-auto">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <!-- Brand -->
                    <div class="md:col-span-2">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-8 h-8 bg-red-600 flex items-center justify-center">
                                <Printer class="w-4 h-4 text-white" />
                            </div>
                            <span class="text-lg font-bold text-slate-900">PrintCraft</span>
                        </div>
                        <p class="text-slate-600 text-sm max-w-md leading-relaxed">
                            Aplikasi web layouting untuk membuat layout printable yang profesional. Gratis dan langsung pakai tanpa registrasi.
                        </p>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h4 class="font-bold text-slate-900 mb-3 text-sm">Navigasi</h4>
                        <ul class="space-y-2">
                            <li><Link :href="route('home')" class="text-sm text-slate-600 hover:text-red-600 hover:underline">Home</Link></li>
                            <li><Link :href="route('templates.index')" class="text-sm text-slate-600 hover:text-red-600 hover:underline">Semua Template</Link></li>
                        </ul>
                    </div>

                    <!-- Categories -->
                    <div>
                        <h4 class="font-bold text-slate-900 mb-3 text-sm">Kategori</h4>
                        <ul class="space-y-2">
                            <li v-for="cat in CATEGORIES" :key="cat.id">
                                <Link :href="route('categories.show', cat.slug)" class="text-sm text-slate-600 hover:text-red-600 hover:underline">
                                    {{ cat.name }}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p class="text-xs text-slate-500">&copy; {{ new Date().getFullYear() }} PrintCraft. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>
