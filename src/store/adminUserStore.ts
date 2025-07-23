/**
 * 文件路径: src/store/adminUserStore.ts
 * 文件描述: [新增] 用于管理超级后台用户列表的状态。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { AdminUser } from "@/types";

interface AdminUserStore {
    users: AdminUser[];
    loading: boolean;
    fetchUsers: () => Promise<void>;
    createOwner: (data: any) => Promise<void>;
    updateUser: (id: string, data: { name: string }) => Promise<void>; // [新增] 更新用户的 action
}

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
    users: [],
    loading: false,
    fetchUsers: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get<AdminUser[]>("/super-admin/users");
            set({ users: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch users:", error);
            set({ loading: false });
        }
    },
    createOwner: async (data) => {
        try {
            await apiClient.post("/super-admin/users/owner", data);
            await get().fetchUsers(); // 成功后刷新列表
        } catch (error) {
            console.error("Failed to create owner:", error);
            throw error;
        }
    },
    // [新增] 更新用户
    updateUser: async (id, data) => {
        try {
            await apiClient.patch(`/super-admin/users/${id}`, data);
            await get().fetchUsers(); // 成功后刷新列表
        } catch (error) {
            console.error(`Failed to update user ${id}:`, error);
            throw error;
        }
    },
}));
