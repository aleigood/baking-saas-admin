/**
 * 文件路径: src/store/adminUserStore.ts
 * 文件描述: [修改] 更新了用户创建逻辑，以支持创建独立用户。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
// [修改] 导入新类型
import { AdminUser, PaginatedResponse, CreateUserData, UpdateUserData, CreateOwnerData } from "@/types";

interface AdminUserStore {
    users: AdminUser[];
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    fetchUsers: (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;
    // [新增] 创建独立用户的方法
    createUser: (data: CreateUserData) => Promise<void>;
    // [废弃] 此方法已不再使用
    createOwner: (data: CreateOwnerData) => Promise<void>;
    updateUser: (id: string, data: UpdateUserData) => Promise<void>;
    updateUserStatus: (id: string, status: "ACTIVE" | "INACTIVE") => Promise<void>;
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
    // [新增] 创建独立用户的实现
    createUser: async (data: CreateUserData) => {
        try {
            await apiClient.post("/super-admin/users", data);
            // 创建成功后刷新用户列表
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error("Failed to create user:", error);
            throw error;
        }
    },
    createOwner: async (data: CreateOwnerData) => {
        try {
            await apiClient.post("/super-admin/users/owner", data);
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error("Failed to create owner:", error);
            throw error;
        }
    },
    updateUser: async (id: string, data: UpdateUserData) => {
        try {
            await apiClient.patch(`/super-admin/users/${id}`, data);
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update user ${id}:`, error);
            throw error;
        }
    },
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
