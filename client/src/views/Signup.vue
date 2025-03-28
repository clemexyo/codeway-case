<script>
import { ref } from 'vue';
import axios from "../axios"
import { useRouter } from 'vue-router';

export default {
  name: 'Signup',
  setup() {
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const error = ref('');
    const router = useRouter();

    const signUp = async () => {
      // Basic example logic:
      if (!email.value || !password.value || !confirmPassword.value) {
        error.value = 'All fields are required.';
        return;
      }
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.';
        return;
      }

      try {
        const response = await axios.post('/api/auth/signup', {
          email: email.value,
          password: password.value,
        });
        console.log(response)
        console.log('Sign up successful for:', email.value);
        error.value = '';
        router.push('/signin');
      } catch (err) {
        error.value = 'Sign up failed.';
        console.log(err)
      }
    };

    return {
      email,
      password,
      confirmPassword,
      error,
      signUp,
    };
  },
};
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#141728] to-[#1C2237] text-white">
      <img
        src="../assets/logo.png"
        alt="Logo"
        class="w-24 h-24 mb-6"
      />
  
      <div class="w-full max-w-sm px-8 py-6 bg-[#1F2335] rounded-md shadow-lg">
        <h1 class="text-center text-lg font-semibold mb-6">
          Please sign up
        </h1>
        
        <form @submit.prevent="signUp">
          <div class="mb-4">
            <input
              type="email"
              v-model="email"
              placeholder="e-mail address"
              class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]"
            />
          </div>
          
          <div class="mb-4">
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]"
            />
          </div>
  
          <div class="mb-6">
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Confirm password"
              class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]"
            />
          </div>
          
          <button
            type="submit"
            class="w-full py-3 rounded bg-gradient-to-r from-[#4D5DFF] to-[#2F4BFF] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Sign up
          </button>
        </form>

        <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
      </div>
  
      <div class="mt-4 text-sm text-gray-400">
        Codeway © 2021
      </div>
    </div>
  </template>
  