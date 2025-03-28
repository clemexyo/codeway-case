import { createRouter, createWebHistory } from 'vue-router'

// Import pages
import Home from '../views/Home.vue'
import Signin from '../views/Signin.vue'
import NotFound from '../views/NotFound.vue'
import Signup from '../views/Signup.vue'

const routes = [
  {
    path: '/',
    name: '',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/signin',
    name: 'signin',
    component: Signin
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup
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
      return next({ name: 'signin' });
    }
  }
  next();
});

export default router