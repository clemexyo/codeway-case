<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import EditParameterModal from '../components/EditParameterModal.vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Home',
  components: {
    EditParameterModal
  },
  setup() {
    const configData = ref([]);
    const newParameter = ref({
      key: '',
      value: '',
      description: '',
    });
    const showEditModal = ref(false);
    const currentEditItem = ref(null);
    const showAddForm = ref(false);
    const router = useRouter();

    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/config', {
          headers: {
            authorization: localStorage.getItem("idToken"),
          },
        });
        console.log('Config fetch:', res);
        configData.value = res.data.parameters;
      } catch (error) {
        console.error('Error fetching config:', error);
        router.push("/signin")
      }
    };

    onMounted(fetchConfig);

    const editItem = (item) => {
      currentEditItem.value = { ...item };
      showEditModal.value = true;
    };

    const updateItem = async (updatedItem) => {
      try {
        const payload = {
          key: updatedItem.key,
          value: updatedItem.value,
          description: updatedItem.description,
        };

        await axios.put(
          `http://localhost:3000/api/config/${updatedItem.key}`,
          payload,
          {
            headers: {
              authorization: localStorage.getItem("idToken"),
            },
          }
        );
        console.log('Parameter updated successfully.');
        await fetchConfig();
      } catch (error) {
        console.error('Error updating parameter:', error);
      }
    };

    const deleteItem = async (key) => {
      try {
        await axios.delete(
          `http://localhost:3000/api/config/${key}`,
          {
            headers: {
              authorization: localStorage.getItem("idToken"),
            },
          }
        );
        console.log('Parameter deleted successfully.');
        await fetchConfig();
      } catch (error) {
        console.error('Error deleting parameter:', error);
      }
    };

    const addItem = async () => {
      if (!newParameter.value.key) return;

      const payload = {
        key: newParameter.value.key,
        value: newParameter.value.value,
        description: newParameter.value.description,
        createDate: new Date().toLocaleString(),
      };

      try {
        await axios.post(
          'http://localhost:3000/api/config',
          payload,
          {
            headers: {
              authorization: localStorage.getItem("idToken"),
            },
          }
        );
        console.log('New parameter added successfully.');
        
        // Reset form and hide it
        newParameter.value.key = '';
        newParameter.value.value = '';
        newParameter.value.description = '';
        showAddForm.value = false;
        
        await fetchConfig();
      } catch (error) {
        console.error('Error updating config:', error);
      }
    };

    const toggleAddForm = () => {
      showAddForm.value = !showAddForm.value;
    };

    return {
      configData,
      newParameter,
      showEditModal,
      currentEditItem,
      showAddForm,
      editItem,
      updateItem,
      deleteItem,
      addItem,
      toggleAddForm,
    };
  },
};
</script>

<template>
  <div class="bg-[#141728] min-h-screen text-white flex flex-col">
    <nav class="flex items-center justify-between px-8 py-4 bg-[#1F2335]">
      <button class="w-8 h-8">
        <img src="../assets/logo.png" alt="User Icon" class="w-full h-full object-cover" />
      </button>
      <button 
        class="bg-green-600 px-3 py-1 rounded hover:bg-green-700 md:hidden"
        @click="toggleAddForm"
      >
        {{ showAddForm ? 'Cancel' : 'Add New' }}
      </button>
    </nav>

    <div class="flex-1 px-4 py-6 mx-auto w-full max-w-screen-xl">
      <!-- Mobile add form -->
      <div v-if="showAddForm" class="md:hidden mb-6 bg-[#1C2237] rounded-md p-4 shadow-lg">
        <h2 class="text-lg font-medium mb-4">Add New Parameter</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Parameter Key</label>
            <input
              v-model="newParameter.key"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none"
              placeholder="Enter key"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Value</label>
            <input
              v-model="newParameter.value"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none"
              placeholder="Enter value"
            />
          </div>
          <div>
            <label class="block text-sm mb-1">Description</label>
            <input
              v-model="newParameter.description"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none"
              placeholder="Enter description"
            />
          </div>
          <button
            class="w-full bg-green-600 py-2 rounded hover:bg-green-700"
            @click="addItem"
          >
            Add Parameter
          </button>
        </div>
      </div>

      <!-- Desktop table view -->
      <div class="hidden md:block bg-[#1C2237] rounded-md p-4 w-full overflow-x-auto">
        <table class="table-auto w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-600">
              <th class="px-4 py-2">Parameter Key</th>
              <th class="px-4 py-2">Value</th>
              <th class="px-4 py-2">Description</th>
              <th class="px-4 py-2">Create Date</th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Display each config parameter as a row -->
            <tr
              v-for="(item, index) in configData"
              :key="index"
              class="border-b border-gray-700 hover:bg-[#242b44]"
            >
              <td class="px-4 py-3">{{ item.key }}</td>
              <td class="px-4 py-3">{{ item.value }}</td>
              <td class="px-4 py-3">{{ item.description }}</td>
              <td class="px-4 py-3">{{ item.createDate }}</td>
              <td class="px-4 py-3">
                <div class="flex space-x-2">
                  <button class="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700" @click="editItem(item)">
                    Edit
                  </button>
                  <button class="bg-red-600 px-3 py-1 rounded hover:bg-red-700" @click="deleteItem(item.key)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3">
                <input
                  v-model="newParameter.key"
                  class="bg-transparent border-b border-gray-500 outline-none w-full"
                  placeholder="New Parameter"
                />
              </td>
              <td class="px-4 py-3">
                <input
                  v-model="newParameter.value"
                  class="bg-transparent border-b border-gray-500 outline-none w-full"
                  placeholder="Value"
                />
              </td>
              <td class="px-4 py-3">
                <input
                  v-model="newParameter.description"
                  class="bg-transparent border-b border-gray-500 outline-none w-full"
                  placeholder="New Description"
                />
              </td>
              <td class="px-4 py-3 text-center">-</td>
              <td class="px-4 py-3">
                <button
                  class="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                  @click="addItem"
                >
                  ADD
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile card view -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="(item, index) in configData" 
          :key="index"
          class="bg-[#1C2237] rounded-md p-4 shadow-lg"
        >
          <div class="mb-3">
            <div class="font-medium text-gray-300">Parameter Key:</div>
            <div>{{ item.key }}</div>
          </div>
          <div class="mb-3">
            <div class="font-medium text-gray-300">Value:</div>
            <div>{{ item.value }}</div>
          </div>
          <div class="mb-3">
            <div class="font-medium text-gray-300">Description:</div>
            <div>{{ item.description }}</div>
          </div>
          <div class="mb-4">
            <div class="font-medium text-gray-300">Create Date:</div>
            <div>{{ item.createDate }}</div>
          </div>
          <div class="flex justify-center space-x-4">
            <button 
              class="bg-blue-600 px-6 py-1.5 rounded hover:bg-blue-700 text-sm" 
              @click="editItem(item)"
            >
              Edit
            </button>
            <button 
              class="bg-red-600 px-6 py-1.5 rounded hover:bg-red-700 text-sm" 
              @click="deleteItem(item.key)"
            >
              Del
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <EditParameterModal 
      :show="showEditModal" 
      :parameter="currentEditItem" 
      @update="updateItem" 
      @close="showEditModal.value = false" 
    />
  </div>
</template>