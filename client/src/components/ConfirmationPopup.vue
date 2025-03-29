<template>
    <Transition name="modal-slide">
        <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
            <div class="absolute inset-0 bg-[#2A3047] bg-opacity-30" @click="$emit('cancel')"></div>

            <div class="bg-[#1C2237] rounded-lg shadow-lg w-full max-w-md mx-4 z-10 transform modal-content">
                <div class="p-6">
                    <h3 class="text-xl font-medium mb-4">{{ title }}</h3>

                    <div class="mb-6">
                        <p class="text-gray-300">{{ message }}</p>
                    </div>

                    <div class="mt-6 flex space-x-3 justify-end">
                        <button @click="$emit('cancel')"
                            class="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors duration-200">
                            Cancel
                        </button>
                        <button @click="$emit('confirm')"
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script>
export default {
    name: 'ConfirmationPopup',
    props: {
        show: Boolean,
        title: {
            type: String,
            default: 'Are you sure?'
        },
        message: {
            type: String,
            default: ''
        }
    }
};
</script>

<style scoped>
.modal-slide-enter-active,
.modal-slide-leave-active {
    transition: all 0.5s ease;
}

.modal-slide-enter-from {
    opacity: 0;
    transform: translateY(-50px);
}

.modal-slide-leave-to {
    opacity: 0;
    transform: translateY(-50px);
}

.modal-content {
    transition: transform 0.3s ease;
}
</style>