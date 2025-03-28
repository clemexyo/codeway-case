<template>
  <!-- Full-page dark background -->
  <div class="bg-[#141728] min-h-screen text-white flex flex-col">
    <!-- Top Navbar -->
    <nav class="flex items-center justify-between px-8 py-4 bg-[#1F2335]">
      <!-- Logo -->
      <img
        src="../assets/logo.png"
        alt="Logo"
        class="h-8"
      />
      <!-- User Icon -->
      <button class="w-8 h-8">
        <img
          src="../assets/logo.png"
          alt="User Icon"
          class="w-full h-full object-cover"
        />
      </button>
    </nav>

    <!-- Main Content Container -->
    <div class="flex-1 px-6 py-8 mx-auto w-full max-w-screen-xl">
      <!-- Table Container -->
      <div class="bg-[#1C2237] rounded-md p-4 w-full overflow-x-auto">
        <table class="table-auto w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-600">
              <th class="px-4 py-2">Parameter Key</th>
              <th class="px-4 py-2">Value</th>
              <th class="px-4 py-2">Description</th>
              <th class="px-4 py-2">Create Date !</th>
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
                  <button
                    class="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    @click="editItem(index)"
                  >
                    Edit
                  </button>
                  <button
                    class="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    @click="deleteItem(index)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <!-- Row for adding a new parameter -->
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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  name: 'Home',
  setup() {
    const configData = ref([]);
    const newParameter = ref({
      key: '',
      value: '',
      description: '',
    });

    // Fetch configuration data from the backend on mount
    onMounted(async () => {
      try {
        const res = await axios.get('http://localhost:3000/config');
        // Convert the returned object into an array of objects for easier table rendering
        configData.value = Object.keys(res.data).map((key) => ({
          key,
          value: res.data[key],
          description: 'No description', // placeholder
          createDate: '01/01/2023 12:00', // placeholder
        }));
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    });

    // Placeholder edit function
    const editItem = (index) => {
      console.log('Edit item at index:', index);
      // Implement your edit logic here (e.g., open a modal, send a PATCH/PUT request, etc.)
    };

    // Placeholder delete function
    const deleteItem = (index) => {
      console.log('Delete item at index:', index);
      // Implement your delete logic here (e.g., send DELETE request to backend, remove from array, etc.)
    };

    // Add a new parameter row
    const addItem = () => {
      if (!newParameter.value.key) return;
      // Push the new parameter into the table
      configData.value.push({
        key: newParameter.value.key,
        value: newParameter.value.value,
        description: newParameter.value.description,
        createDate: new Date().toLocaleString(), // example
      });

      // Clear input fields
      newParameter.value.key = '';
      newParameter.value.value = '';
      newParameter.value.description = '';

      // Make a POST or PATCH request to update the config in the backend as needed
    };

    return {
      configData,
      newParameter,
      editItem,
      deleteItem,
      addItem,
    };
  },
};
</script>