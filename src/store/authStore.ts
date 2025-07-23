import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    user: { name: string; systemRole: string } | null;
    setToken: (token: string) => void;
    setUser: (user: { name: string; systemRole: string }) => void;
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
