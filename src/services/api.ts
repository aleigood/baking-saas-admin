import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const apiClient = axios.create({
    baseURL: "http://localhost:3000", // 您的后端 API 地址
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
