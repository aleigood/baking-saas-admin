import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// [核心修改] 从 Vite 的环境变量中读取 baseURL
// import.meta.env.VITE_API_BASE_URL 的值会根据环境自动变化
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 请求拦截器，用于在每个请求头中添加 JWT
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
