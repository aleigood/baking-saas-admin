import { create } from "zustand";
import { persist } from "zustand/middleware";

// [修改] 更新 User 类型，增加 id 字段
interface User {
    id: string;
    name: string;
    systemRole: string;
}

interface AuthState {
    token: string | null;
    user: User | null; // [修改] 使用新的 User 类型
    setToken: (token: string) => void;
    setUser: (user: User) => void; // [修改] 使用新的 User 类型
    logout: () => void;
}

// 使用 zustand 创建一个持久化的状态管理 store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: "auth-storage", // 用于 localStorage 的 key
        }
    )
);
