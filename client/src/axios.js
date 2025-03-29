import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // re-direct to signin in case backend says the token as expired.
      localStorage.removeItem('idToken');
      router.push("/signin");
    }
    return Promise.reject(error);
  }
);

export default instance;
