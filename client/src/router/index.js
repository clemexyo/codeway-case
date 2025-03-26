import { createRouter, createWebHistory } from 'vue-router'

// Import pages
import Home from '../views/Home.vue'
import Signin from '../views/Signin.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication (will implement with Firebase later)
router.beforeEach((to, from, next) => {
  // This is a placeholder for the authentication check
  // We'll implement this properly when we add Firebase authentication
  const isAuthenticated = false // Will be replaced with actual auth check
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router