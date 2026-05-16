<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import {
    X, Check, RotateCw, ZoomIn,
    FlipHorizontal, FlipVertical, Sun, Contrast
} from 'lucide-vue-next';

const props = defineProps({
    isOpen: Boolean,
    imageSrc: String,
    aspectRatio: {
        type: Number,
        default: null
    }
});

const emit = defineEmits(['close', 'save']);

const cropperRef = ref(null);

// Editing state
const brightness = ref(100);
const contrast = ref(100);
const rotation = ref(0);
const zoom = ref(1);
const applyToAll = ref(false);

const currentImageSrc = ref(props.imageSrc);

// Reset state when opening a new image
watch(() => props.isOpen, (val) => {
    if (val) {
        currentImageSrc.value = props.imageSrc;
        brightness.value = 100;
        contrast.value = 100;
        rotation.value = 0;
        zoom.value = 1;
        applyToAll.value = false;
    }
});

watch(() => props.imageSrc, (newVal) => {
    if (props.isOpen) {
        currentImageSrc.value = newVal;
    }
});

// Watch rotation to apply it to cropper natively
watch(rotation, (newVal, oldVal) => {
    if (cropperRef.value) {
        cropperRef.value.rotate(newVal - oldVal);
    }
});

// Watch zoom to apply it to cropper natively (relative factor)
watch(zoom, (newVal, oldVal) => {
    if (cropperRef.value && oldVal > 0) {
        cropperRef.value.zoom(newVal / oldVal);
    }
});

// We pass image-style to the Cropper to show real-time brightness/contrast
const customImageStyle = computed(() => {
    return {
        filter: `brightness(${brightness.value}%) contrast(${contrast.value}%)`
    };
});

function handleChangePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        currentImageSrc.value = ev.target.result;
        brightness.value = 100;
        contrast.value = 100;
        rotation.value = 0;
        zoom.value = 1;
        e.target.value = ''; // reset
    };
    reader.readAsDataURL(file);
}

function flip(horizontal, vertical) {
    if (cropperRef.value) {
        cropperRef.value.flip(horizontal, vertical);
    }
}

async function applyChanges() {
    if (!cropperRef.value) return;

    const { canvas } = cropperRef.value.getResult();
    if (!canvas) return;

    // Apply brightness and contrast to the final canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const ctx = finalCanvas.getContext('2d');

    // Draw with filters
    ctx.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%)`;
    ctx.drawImage(canvas, 0, 0);

    const base64 = finalCanvas.toDataURL('image/png', 1.0);
    emit('save', {
        src: base64,
        originalSrc: currentImageSrc.value,
        applyToAll: applyToAll.value
    });
    close();
}

function close() {
    emit('close');
}
</script>

<template>
    <div v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
        <div
            class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-bold text-slate-900">Edit Foto</h3>
                <button @click="close"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Content Area (Cropper + Controls) -->
            <div class="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[400px]">

                <!-- Cropper Preview -->
                <div class="flex-1 bg-slate-100 flex items-center justify-center p-4 min-h-[300px] overflow-hidden">
                    <Cropper ref="cropperRef" class="cropper" :src="currentImageSrc" :stencil-props="{
                        aspectRatio: aspectRatio
                    }" :image-style="customImageStyle" image-restriction="fit-area" />
                </div>

                <!-- Controls Sidebar -->
                <div
                    class="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white p-6 overflow-y-auto flex flex-col gap-6">

                    <!-- Quick Actions -->
                    <div class="flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Orientasi</h4>

                            <!-- Change Photo Button -->
                            <label
                                class="text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors">
                                Ganti Foto
                                <input type="file" accept="image/*" @change="handleChangePhoto" class="hidden" />
                            </label>
                        </div>
                        <div class="flex gap-2">
                            <button @click="flip(true, false)"
                                class="flex-1 py-2 bg-slate-50 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors flex justify-center"
                                title="Flip Horizontal">
                                <FlipHorizontal class="w-4 h-4" />
                            </button>
                            <button @click="flip(false, true)"
                                class="flex-1 py-2 bg-slate-50 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors flex justify-center"
                                title="Flip Vertikal">
                                <FlipVertical class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Sliders -->
                    <div class="space-y-5">
                        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Penyesuaian</h4>

                        <!-- Brightness -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Sun class="w-3.5 h-3.5 text-slate-400" /> Kecerahan
                                </label>
                                <span class="text-xs text-slate-500 font-mono">{{ brightness }}%</span>
                            </div>
                            <input type="range" v-model="brightness" min="0" max="200" class="w-full accent-red-600">
                        </div>

                        <!-- Contrast -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <Contrast class="w-3.5 h-3.5 text-slate-400" /> Kontras
                                </label>
                                <span class="text-xs text-slate-500 font-mono">{{ contrast }}%</span>
                            </div>
                            <input type="range" v-model="contrast" min="0" max="200" class="w-full accent-red-600">
                        </div>

                        <!-- Rotation -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <RotateCw class="w-3.5 h-3.5 text-slate-400" /> Putar
                                </label>
                                <span class="text-xs text-slate-500 font-mono">{{ rotation }}°</span>
                            </div>
                            <input type="range" v-model="rotation" min="-180" max="180" class="w-full accent-red-600">
                        </div>

                        <!-- Zoom -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label class="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    <ZoomIn class="w-3.5 h-3.5 text-slate-400" /> Skala (Zoom)
                                </label>
                                <span class="text-xs text-slate-500 font-mono">{{ zoom }}x</span>
                            </div>
                            <input type="range" v-model="zoom" min="0.5" max="3" step="0.1"
                                class="w-full accent-red-600">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <label class="flex items-center gap-2 cursor-pointer group">
                    <div class="relative flex items-center justify-center">
                        <input type="checkbox" v-model="applyToAll"
                            class="peer h-5 w-5 appearance-none rounded border border-slate-300 bg-white checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer" />
                        <Check
                            class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Terapkan
                        ke semua grid</span>
                </label>
                <div class="flex items-center gap-3">
                    <button @click="close"
                        class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Batal
                    </button>
                    <button @click="applyChanges" class="btn-primary py-2 px-6 shadow-sm flex items-center gap-2">
                        <Check class="w-4 h-4" /> Terapkan Foto
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.cropper {
    max-height: 500px;
    width: 100%;
}
</style>
