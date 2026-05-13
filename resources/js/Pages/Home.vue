<script setup>
import { Head, Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import { ref, computed } from 'vue';
import { CATEGORIES, getFeaturedTemplates } from '@/Data/templates';
import TemplateCard from '@/Components/TemplateCard.vue';
import { ArrowRight, FileText, CheckCircle, Search, Printer } from 'lucide-vue-next';

const featuredTemplates = computed(() => getFeaturedTemplates());
const searchQuery = ref('');

function handleSearch() {
    if (searchQuery.value.trim()) {
        window.location.href = route('templates.index') + '?q=' + encodeURIComponent(searchQuery.value);
    }
}

const steps = [
    {
        icon: FileText,
        title: 'Pilih Template',
        description: 'Pilih dari berbagai template siap pakai — label, invoice, planner, dan lainnya.',
    },
    {
        icon: CheckCircle,
        title: 'Edit & Kustomisasi',
        description: 'Ubah teks, upload foto, atur grid, dan sesuaikan layout sesuai kebutuhan Anda.',
    },
    {
        icon: Printer,
        title: 'Print / Download',
        description: 'Langsung cetak dari browser atau download sebagai PDF berkualitas tinggi.',
    },
];
</script>

<template>
    <Head title="Buat Layout Printable Profesional" />

    <AppLayout>
        <!-- Hero Section -->
        <section class="bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
                <div class="max-w-3xl mx-auto">
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 animate-slide-up">
                        Layout Printable Profesional
                        <br />
                        <span class="text-red-600">Mudah & Cepat</span>
                    </h1>

                    <p class="text-lg text-slate-600 mb-10 leading-relaxed" style="animation: slideUp 0.4s ease-out 0.1s forwards; opacity: 0;">
                        Buat label pengiriman, invoice, kartu nama, planner, dan foto dokumen langsung dari browser. Tanpa perlu software desain yang rumit.
                    </p>

                    <!-- CTA Button -->
                    <div class="flex justify-center mb-8" style="animation: slideUp 0.4s ease-out 0.2s forwards; opacity: 0;">
                        <Link :href="route('templates.index')" class="btn-primary py-4 px-10 text-lg">
                            Lihat Semua Template
                            <ArrowRight class="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>


        <!-- How It Works -->
        <section class="py-16 bg-red-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="section-heading">Cara Penggunaan</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        class="text-center"
                    >
                        <div class="w-16 h-16 mx-auto bg-white border border-slate-200 flex items-center justify-center shadow-sm mb-4">
                            <component :is="step.icon" class="w-7 h-7 text-red-600" />
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">{{ index + 1 }}. {{ step.title }}</h3>
                        <p class="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Categories Grid -->
        <section class="py-16 bg-slate-50 border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-end justify-between mb-8">
                    <div>
                        <h2 class="section-heading">Kategori Template</h2>
                        <p class="section-subheading">Temukan layout yang sesuai dengan kebutuhan Anda.</p>
                    </div>
                    <Link :href="route('templates.index')" class="hidden sm:inline-flex btn-ghost text-sm">
                        Lihat Semua Kategori
                        <ArrowRight class="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link
                        v-for="cat in CATEGORIES"
                        :key="cat.id"
                        :href="route('categories.show', cat.slug)"
                        class="glass-card-hover p-6 group cursor-pointer block"
                    >
                        <div class="w-10 h-10 flex items-center justify-center mb-4 bg-slate-100 group-hover:bg-red-50 transition-colors">
                            <component :is="cat.iconComponent" class="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors" />
                        </div>
                        <h3 class="font-bold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">{{ cat.name }}</h3>
                        <p class="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">{{ cat.description }}</p>
                        
                        <div class="flex flex-wrap gap-2">
                            <span v-for="sub in cat.subcategories.slice(0, 2)" :key="sub.id" class="badge bg-slate-100 text-slate-600 border-slate-200">
                                {{ sub.name }}
                            </span>
                            <span v-if="cat.subcategories.length > 2" class="badge bg-slate-100 text-slate-500 border-slate-200">
                                +{{ cat.subcategories.length - 2 }}
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>

        <!-- Featured Templates -->
        <section class="py-16 bg-white border-b border-slate-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-end justify-between mb-8">
                    <div>
                        <h2 class="section-heading">Template Populer</h2>
                        <p class="section-subheading">Template yang paling banyak digunakan.</p>
                    </div>
                    <Link :href="route('templates.index')" class="hidden sm:inline-flex btn-ghost text-sm">
                        Lihat Semua Template
                        <ArrowRight class="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <TemplateCard
                        v-for="tpl in featuredTemplates"
                        :key="tpl.id"
                        :template="tpl"
                    />
                </div>
            </div>
        </section>
    </AppLayout>
</template>
