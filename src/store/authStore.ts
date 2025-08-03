import { create } from "zustand";
import { persist } from "zustand/middleware";

// [修改] 更新 User 类型，移除 name，增加 phone 和 id
interface User {
    id: string;
    phone: string;
    role: string; // 全局角色，例如 SUPER_ADMIN
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
