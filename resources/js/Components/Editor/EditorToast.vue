<script setup>
import { ref, watch } from 'vue';
import { Check, Copy, Undo2, Redo2, Trash2, ClipboardPaste, Save } from 'lucide-vue-next';

const toasts = ref([]);
let idCounter = 0;

const ICONS = {
    copy: Copy,
    paste: ClipboardPaste,
    undo: Undo2,
    redo: Redo2,
    delete: Trash2,
    save: Save,
    success: Check,
};

function show(message, type = 'success', duration = 1800) {
    const id = ++idCounter;
    toasts.value.push({ id, message, type, leaving: false });
    setTimeout(() => dismiss(id), duration);
}

function dismiss(id) {
    const t = toasts.value.find(t => t.id === id);
    if (t) t.leaving = true;
    setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }, 300);
}

defineExpose({ show });
</script>

<template>
    <Teleport to="body">
        <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
            <TransitionGroup name="toast">
                <div v-for="toast in toasts" :key="toast.id"
                    class="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl backdrop-blur-sm"
                    :class="{ 'opacity-0 translate-y-2': toast.leaving }">
                    <component :is="ICONS[toast.type] || ICONS.success" class="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{{ toast.message }}</span>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.toast-enter-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
    transition: all 0.25s ease-in;
}
.toast-enter-from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
}
.toast-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
}
</style>
