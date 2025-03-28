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

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('idToken');
    if (!token) {
      return next({ name: 'Signin' });
    }
  }
  next();
});

export default router