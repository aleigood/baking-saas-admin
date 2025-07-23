import { create } from "zustand";

type Page = "dashboard" | "tenants" | "users" | "recipes";

interface UIState {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

// 创建一个用于管理 UI 状态的 store
export const useUIStore = create<UIState>((set) => ({
    activePage: "dashboard",
    setActivePage: (page) => set({ activePage: page }),
}));
