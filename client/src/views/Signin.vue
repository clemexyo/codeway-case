<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'signin',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref(null);

    const phase = ref('initial'); // 'initial' → 'paused' → 'signin'
    const router = useRouter();

    const signIn = async () => {
      console.log(email.value)
      console.log(password.value)
      try {
        const response = await axios.post('http://localhost:3000/api/auth/signin', {
          email: email.value,
          password: password.value,
        });

        const idToken = response.data.idToken;
        localStorage.setItem('idToken', idToken);
        router.push('/home');
      } catch (err) {
        error.value = 'Sign-in failed. Please check your credentials.';
        console.error("ERROR: " + err);

        setTimeout(() => {
          phase.value = 'initial';
        }, 1000); // 1 second delay so user sees the result
      }
    };


    const handleClick = () => {
      if (phase.value === 'initial') {
        phase.value = 'paused';
        return;
      }

      if (phase.value === 'paused') {
        phase.value = 'signin';
        setTimeout(() => {
          signIn();
        }, 300); 
      }
    };

    return {
      email,
      password,
      error,
      phase,
      handleClick
    };
  }
};
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#141728] to-[#1C2237] text-white">
    <img src="../assets/logo.png" alt="Logo" class="w-24 h-24 mb-6" />

    <div class="w-full max-w-sm px-8 py-6 bg-[#1F2335] rounded-md shadow-lg">
      <h1 class="text-center text-lg font-semibold mb-2">
        Please sign in
      </h1>

      <p v-if="error" class="text-red-400 text-sm text-center mb-4">
        {{ error }}
      </p>

      <form @submit.prevent="handleClick">
        <div class="mb-4">
          <input type="email" v-model="email" placeholder="e-mail address"
            class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]" />
        </div>

        <div class="mb-6">
          <input type="password" v-model="password" placeholder="Password"
            class="w-full p-3 rounded border border-[#2D3143] bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-[#8B50F9]" />
        </div>

        <div class="relative h-24 overflow-hidden">
          <div v-if="phase === 'paused'"
            class="absolute w-full text-center text-purple-400 font-medium top-0 transition-opacity duration-300">
            Try that again
          </div>

          <button type="submit"
            class="absolute w-full py-3 rounded bg-gradient-to-r from-[#4D5DFF] to-[#2F4BFF] text-white font-semibold transition-transform duration-300"
            :class="{
              'translate-y-12': phase === 'paused',
              'translate-y-0': phase !== 'paused'
            }">
            Sign in
          </button>
        </div>
      </form>
    </div>

    <div class="mt-4 text-sm text-gray-400">
      Codeway © 2021
    </div>
  </div>
</template>