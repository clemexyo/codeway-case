<script>
import axios from "../axios"
import { ref, onMounted } from 'vue';
import EditParameterModal from '../components/EditParameterModal.vue';
import ConfirmationPopup from "../components/ConfirmationPopup.vue";
import { useRouter } from 'vue-router';

export default {
  name: 'Home',
  components: {
    EditParameterModal,
    ConfirmationPopup
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
    const isLoading = ref(true);
    const showConfirmationPopup = ref(false);

    const fetchConfig = async () => {
      isLoading.value = true;
      try {
        const res = await axios.get('/api/config', {
          headers: {
            authorization: localStorage.getItem("idToken"),
          },
        });
        configData.value = res.data.parameters;
      } catch (error) {
        console.error('Error fetching config:', error);
        router.push("/signin")
      } finally {
        isLoading.value = false;
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
          `/api/config/${updatedItem.key}`,
          payload,
          {
            headers: {
              authorization: localStorage.getItem("idToken"),
            },
          }
        );

        const index = configData.value.findIndex(item => item.key === updatedItem.key);
        if (index !== -1) {
          configData.value[index] = {
            ...configData.value[index],
            ...payload
          };
        }

        console.log('Parameter updated successfully.');
      } catch (error) {
        console.error('Error updating parameter:', error);
      }
    };

    const deleteItem = async (key) => {
      try {
        const indexToRemove = configData.value.findIndex(item => item.key === key);
        if (indexToRemove !== -1) {
          const removedItem = configData.value[indexToRemove];

          configData.value = configData.value.filter(item => item.key !== key);

          try {
            await axios.delete(
              `/api/config/${key}`,
              {
                headers: {
                  authorization: localStorage.getItem("idToken"),
                },
              }
            );
            console.log('Parameter deleted successfully.');
          } catch (error) {
            // If API call fails, restore the item
            console.error('Error deleting parameter:', error);
            configData.value.splice(indexToRemove, 0, removedItem);
            // TODO: show a pop-up here
          }
        }
      } catch (error) {
        console.error('Error in delete operation:', error);
      }
    };

    const addItem = async () => {
      if (!newParameter.value.key) return;

      const createDate = new Date().toLocaleString();
      const newItem = {
        key: newParameter.value.key,
        value: newParameter.value.value,
        description: newParameter.value.description,
        createDate,
        version: 1,
        timestamp: new Date().toISOString()
      };

      const payload = {
        key: newParameter.value.key,
        value: newParameter.value.value,
        description: newParameter.value.description,
        createDate,
      };

      try {
        configData.value = [...configData.value, newItem];

        newParameter.value.key = '';
        newParameter.value.value = '';
        newParameter.value.description = '';
        showAddForm.value = false;

        await axios.post(
          '/api/config',
          payload,
          {
            headers: {
              authorization: localStorage.getItem("idToken"),
            },
          }
        );

        console.log('New parameter added successfully.');
      } catch (error) {
        console.error('Error adding parameter:', error);

        // If API call fails, remove the item from the UI
        configData.value = configData.value.filter(item => item.key !== newItem.key);
        // TODO: sohw a pop-up here
      }
    };

    const toggleAddForm = () => {
      showAddForm.value = !showAddForm.value;
    };

    const signOut = () => {
      showConfirmationPopup.value = true;
    };

    const handleConfirmSignOut = () => {
      localStorage.removeItem("idToken");
      router.push("/signin");
    };

    const handleCancelSignOut = () => {
      showConfirmationPopup.value = false;
    };

    return {
      configData,
      newParameter,
      showEditModal,
      currentEditItem,
      showAddForm,
      isLoading,
      editItem,
      updateItem,
      deleteItem,
      addItem,
      toggleAddForm,
      showConfirmationPopup,
      signOut,
      handleConfirmSignOut,
      handleCancelSignOut
    };
  },
};
</script>

<template>
  <div class="bg-[#141728] min-h-screen text-white flex flex-col">
    <nav class="flex items-center justify-between px-8 py-4 bg-[#1F2335]">
      <button
        class="w-8 h-8 rounded-full overflow-hidden hover:shadow-lg transform hover:scale-105 transition-all duration-200">
        <img src="../assets/logo.png" alt="User Icon" class="w-full h-full object-cover" />
      </button>
      <div class="flex items-center space-x-2">
        <button
          class="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5 md:hidden"
          @click="toggleAddForm">
          {{ showAddForm ? 'Cancel' : 'Add New' }}
        </button>
        <button
          class="md:hidden bg-red-700 px-2 py-1 rounded hover:bg-red-500 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          @click="signOut">
          Sign Out
        </button>
      </div>
    </nav>

    <div class="flex-1 px-4 py-6 mx-auto w-full max-w-screen-xl relative">
      <div class="hidden md:block absolute right-4 top-[-45px]">
        <button
          class="bg-red-700 px-2 py-1 rounded hover:bg-red-500 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
          @click="signOut">
          Sign Out
        </button>
      </div>
      <div v-if="showAddForm" class="md:hidden mb-6 bg-[#1C2237] rounded-md p-4 shadow-lg">
        <h2 class="text-lg font-medium mb-4">Add New Parameter</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-1">Parameter Key</label>
            <input v-model="newParameter.key"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter key" />
          </div>
          <div>
            <label class="block text-sm mb-1">Value</label>
            <input v-model="newParameter.value"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter value" />
          </div>
          <div>
            <label class="block text-sm mb-1">Description</label>
            <input v-model="newParameter.description"
              class="w-full bg-[#232942] rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="Enter description" />
          </div>
          <button
            class="w-full bg-green-600 py-2 rounded hover:bg-green-700 transition-colors duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            @click="addItem">
            Add Parameter
          </button>
        </div>
      </div>

      <!-- desktop -->
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
            <!-- skeletons -->
            <template v-if="isLoading">
              <tr v-for="i in 4" :key="`skeleton-${i}`" class="border-b border-gray-700">
                <td class="px-4 py-3">
                  <div class="h-5 bg-gray-700 rounded animate-pulse w-24"></div>
                </td>
                <td class="px-4 py-3">
                  <div class="h-5 bg-gray-700 rounded animate-pulse w-16"></div>
                </td>
                <td class="px-4 py-3">
                  <div class="h-5 bg-gray-700 rounded animate-pulse w-48"></div>
                </td>
                <td class="px-4 py-3">
                  <div class="h-5 bg-gray-700 rounded animate-pulse w-32"></div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex space-x-2">
                    <div class="h-8 bg-gray-700 rounded animate-pulse w-14"></div>
                    <div class="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
                  </div>
                </td>
              </tr>
            </template>

            <template v-else>
              <tr v-for="(item, index) in configData" :key="index" class="border-b border-gray-700 hover:bg-[#242b44]">
                <td class="px-4 py-3">{{ item.key }}</td>
                <td class="px-4 py-3">{{ item.value }}</td>
                <td class="px-4 py-3">{{ item.description }}</td>
                <td class="px-4 py-3">{{ item.createDate }}</td>
                <td class="px-4 py-3">
                  <div class="flex space-x-2">
                    <button
                      class="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                      @click="editItem(item)">
                      Edit
                    </button>
                    <button
                      class="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                      @click="deleteItem(item.key)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3">
                  <input v-model="newParameter.key"
                    class="bg-transparent border-b border-gray-500 outline-none w-full focus:border-blue-500 transition-colors duration-200"
                    placeholder="New Parameter" />
                </td>
                <td class="px-4 py-3">
                  <input v-model="newParameter.value"
                    class="bg-transparent border-b border-gray-500 outline-none w-full focus:border-blue-500 transition-colors duration-200"
                    placeholder="Value" />
                </td>
                <td class="px-4 py-3">
                  <input v-model="newParameter.description"
                    class="bg-transparent border-b border-gray-500 outline-none w-full focus:border-blue-500 transition-colors duration-200"
                    placeholder="New Description" />
                </td>
                <td class="px-4 py-3 text-center">-</td>
                <td class="px-4 py-3">
                  <button
                    class="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition-colors duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                    @click="addItem">
                    ADD
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!--movile -->
      <div class="md:hidden space-y-4">
        <!-- skeletons -->
        <template v-if="isLoading">
          <div v-for="i in 3" :key="`mobile-skeleton-${i}`" class="bg-[#1C2237] rounded-md p-4 shadow-lg">
            <div class="mb-3">
              <div class="font-medium text-gray-300">Parameter Key:</div>
              <div class="h-5 bg-gray-700 rounded animate-pulse w-3/4 mt-1"></div>
            </div>
            <div class="mb-3">
              <div class="font-medium text-gray-300">Value:</div>
              <div class="h-5 bg-gray-700 rounded animate-pulse w-1/3 mt-1"></div>
            </div>
            <div class="mb-3">
              <div class="font-medium text-gray-300">Description:</div>
              <div class="h-5 bg-gray-700 rounded animate-pulse w-5/6 mt-1"></div>
            </div>
            <div class="mb-4">
              <div class="font-medium text-gray-300">Create Date:</div>
              <div class="h-5 bg-gray-700 rounded animate-pulse w-1/2 mt-1"></div>
            </div>
            <div class="flex justify-center space-x-4">
              <div class="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
              <div class="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(item, index) in configData" :key="index" class="bg-[#1C2237] rounded-md p-4 shadow-lg">
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
                class="bg-blue-600 px-6 py-1.5 rounded hover:bg-blue-700 transition-colors duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                @click="editItem(item)">
                Edit
              </button>
              <button
                class="bg-red-600 px-6 py-1.5 rounded hover:bg-red-700 transition-colors duration-200 hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                @click="deleteItem(item.key)">
                Del
              </button>
            </div>
          </div>
        </template>

        <div v-if="!isLoading && configData.length === 0" class="bg-[#1C2237] rounded-md p-6 text-center shadow-lg">
          <div class="text-gray-400 mb-3">No parameters found</div>
          <button
            class="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            @click="toggleAddForm">
            Add Your First Parameter
          </button>
        </div>
      </div>
    </div>

    <EditParameterModal :show="showEditModal" :parameter="currentEditItem" @update="updateItem"
      @close="showEditModal = false" />

    <ConfirmationPopup :show="showConfirmationPopup" title="Confirm Sign Out"
      message="Are you sure you want to sign out?" @confirm="handleConfirmSignOut" @cancel="handleCancelSignOut" />
  </div>
</template>