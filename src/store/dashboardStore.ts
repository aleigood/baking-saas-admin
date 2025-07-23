/**
 * 文件路径: src/store/dashboardStore.ts
 * 文件描述: [新增] 用于管理仪表盘页面数据的状态。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { DashboardStats } from "@/types";

interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    loading: false,
    fetchStats: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get<DashboardStats>("/super-admin/stats");
            set({ stats: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            set({ loading: false });
        }
    },
}));
