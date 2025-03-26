<template>
    <!-- Full-screen gradient background -->
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#141728] to-[#1C2237] text-white">
      <!-- Logo -->
      <img
        src="../assets/logo.png"
        alt="Logo"
        class="w-24 h-24 mb-6"
      />
  
      <!-- Sign-in form container -->
      <div class="w-full max-w-sm px-8 py-6 bg-[#1F2335] rounded-md shadow-lg">
        <h1 class="text-center text-lg font-semibold mb-6">
          Please sign in
        </h1>
        
        <form @submit.prevent="signIn">
          <!-- E-mail address field -->
          <div class="mb-4">
            <input
              type="email"
              v-model="email"
              placeholder="e-mail address"
              class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]"
            />
          </div>
          
          <!-- Password field -->
          <div class="mb-6">
            <input
              type="password"
              v-model="password"
              placeholder="Password"
              class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]"
            />
          </div>
          
          <!-- Sign In button -->
          <button
            type="submit"
            class="w-full py-3 rounded bg-gradient-to-r from-[#4D5DFF] to-[#2F4BFF] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
        </form>
      </div>
  
      <!-- Footer -->
      <div class="mt-4 text-sm text-gray-400">
        Codeway © 2021
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  
  export default {
    name: 'Signin',
    setup() {
      const email = ref('');
      const password = ref('');
      
      const signIn = () => {
        // Handle sign-in logic here (e.g., send to backend)
        console.log('Email:', email.value, 'Password:', password.value);
      };
  
      return {
        email,
        password,
        signIn,
      };
    },
  };
  </script>
  
  <!-- 
    No additional <style> block needed if you're using Tailwind 
    via your main index.css and Tailwind configuration.
  -->
  