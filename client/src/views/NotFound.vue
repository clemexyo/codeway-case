<template>
  <div class="bg-[#141728] min-h-screen text-white flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
    <div class="max-w-max mx-auto">
      <main class="flex flex-col items-center sm:flex-row">
        <p class="text-4xl font-extrabold text-blue-500 sm:text-5xl">404</p>
        <div class="sm:ml-6">
          <div class="text-center sm:text-left sm:border-l sm:border-gray-600 sm:pl-6">
            <h1 class="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Page not found</h1>
            <p class="mt-1 text-base text-gray-400">Please check the URL in the address bar and try again.</p>
          </div>
          <div class="mt-10 flex justify-center sm:justify-start space-x-3 sm:border-l sm:border-transparent sm:pl-6">
            <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Go back home
            </router-link>
          </div>
        </div>
      </main>
      <div class="flex justify-center mt-8">
        <img src="../assets/logo.png" alt="Logo" class="w-32 h-32" />
      </div>
    </div>
  </div>
</template>