/**
 * 文件路径: src/store/adminUserStore.ts
 * 文件描述: [新增] 用于管理超级后台用户列表的状态。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { AdminUser, PaginatedResponse } from "@/types";

interface AdminUserStore {
    users: AdminUser[];
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    fetchUsers: (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;
    createOwner: (data: any) => Promise<void>;
    updateUser: (id: string, data: { name: string }) => Promise<void>;
    updateUserStatus: (id: string, status: "ACTIVE" | "INACTIVE") => Promise<void>; // [新增]
}

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
    users: [],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 10,
    fetchUsers: async (params) => {
        set({ loading: true });
        try {
            const { page, pageSize, search, sortBy } = params;
            const response = await apiClient.get<PaginatedResponse<AdminUser>>("/super-admin/users", {
                params: { page, limit: pageSize, search: search || undefined, sortBy },
            });
            set({
                users: response.data.data,
                total: response.data.total,
                page: response.data.page,
                pageSize: response.data.limit,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch users:", error);
            set({ loading: false });
        }
    },
    createOwner: async (data) => {
        try {
            await apiClient.post("/super-admin/users/owner", data);
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error("Failed to create owner:", error);
            throw error;
        }
    },
    updateUser: async (id, data) => {
        try {
            await apiClient.patch(`/super-admin/users/${id}`, data);
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update user ${id}:`, error);
            throw error;
        }
    },
    // [新增] 更新用户状态
    updateUserStatus: async (id, status) => {
        try {
            await apiClient.patch(`/super-admin/users/${id}/status`, { status });
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update user status for ${id}:`, error);
            throw error;
        }
    },
}));
