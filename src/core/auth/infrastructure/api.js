import axios from 'axios';
import { API_BASE_URL} from '../../../config/constants';

const api = axios.create({
   baseURL: API_BASE_URL, 
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!error.config?.url?.includes('/auth/login')) {
                window.location.href = '/';
            }
        }
        console.error('Error en petición API:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export default api;