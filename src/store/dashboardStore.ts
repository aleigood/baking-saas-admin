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
    error: string | null; // 新增-用于存储错误信息
    fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: null,
    loading: false,
    error: null, // 新增-初始化错误状态
    fetchStats: async () => {
        set({ loading: true, error: null }); // 开始获取数据前，重置错误状态
        try {
            const response = await apiClient.get<DashboardStats>("/super-admin/stats");
            set({ stats: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
            // 新增-定义统一的错误消息
            const errorMessage = "无法加载仪表盘数据，请稍后重试。";
            set({ loading: false, error: errorMessage });
            // 新增-向上抛出错误，以便UI层可以捕获并显示给用户
            throw new Error(errorMessage);
        }
    },
}));
