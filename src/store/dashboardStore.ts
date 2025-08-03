/**
 * 文件路径: src/store/dashboardStore.ts
 * 文件描述: [修改] 更新了API端点以匹配新的后台路由。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { DashboardStats } from "@/types";

interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
    fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    loading: false,
    error: null,
    fetchStats: async () => {
        set({ loading: true, error: null });
        try {
            // [修改] API端点从 /super-admin/stats 更新为 /super-admin/dashboard-stats
            const response = await apiClient.get<DashboardStats>("/super-admin/dashboard-stats");
            set({ stats: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            const errorMessage = "无法加载仪表盘数据，请稍后重试。";
            set({ loading: false, error: errorMessage });
            throw new Error(errorMessage);
        }
    },
}));
