<template>
    <Transition name="modal-slide">
      <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="absolute inset-0 bg-black bg-opacity-50" @click="cancel"></div>
        
        <div class="bg-[#1C2237] rounded-lg shadow-lg w-full max-w-md mx-4 z-10 transform modal-content">
          <div class="p-6">
            <h3 class="text-xl font-medium mb-4">Edit Parameter</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Value</label>
                <input 
                  v-model="paramData.value" 
                  class="w-full bg-[#141728] border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  v-model="paramData.description" 
                  rows="3"
                  class="w-full bg-[#141728] border border-gray-600 rounded px-3 py-2 text-white"
                ></textarea>
              </div>
            </div>
            
            <div class="mt-6 flex space-x-3 justify-end">
              <button 
                @click="cancel" 
                class="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                @click="save" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    name: 'EditParameterModal',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      parameter: {
        type: Object,
        default: () => ({})
      }
    },
    emits: ['update', 'close'],
    setup(props, { emit }) {
      const paramData = ref({
        value: '',
        description: '',
        createDate: ''
      });

      watch(() => props.parameter, (newParam) => {
        if (newParam) {
          paramData.value = { ...newParam };
        }
      }, { immediate: true });
      
      const save = () => {
        emit('update', paramData.value);
        emit('close');
      };
      
      const cancel = () => {
        emit('close');
      };
      
      return {
        paramData,
        save,
        cancel
      };
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