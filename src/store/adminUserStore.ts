/**
 * 文件路径: src/store/adminUserStore.ts
 * 文件描述: [修改] 新增 allUsers 状态和 fetchAllUsers 方法，以支持在其他页面获取完整的用户列表。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { AdminUser, PaginatedResponse, CreateUserData, UpdateUserData } from "@/types";

interface AdminUserStore {
    users: AdminUser[];
    allUsers: AdminUser[]; // [新增] 用于存储所有用户列表，供下拉选择使用
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    fetchUsers: (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;
    fetchAllUsers: () => Promise<void>; // [新增] 获取所有用户的方法
    createUser: (data: CreateUserData) => Promise<void>;
    updateUser: (id: string, data: UpdateUserData) => Promise<void>;
}

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
    users: [],
    allUsers: [], // [新增] 初始化状态
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
                total: response.data.meta.total,
                page: response.data.meta.page,
                pageSize: response.data.meta.limit,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch users:", error);
            set({ loading: false });
        }
    },
    // [新增] 实现获取所有用户的方法
    fetchAllUsers: async () => {
        set({ loading: true });
        try {
            // 请求一个非常大的数量来模拟获取所有用户
            const response = await apiClient.get<PaginatedResponse<AdminUser>>("/super-admin/users", {
                params: { page: 1, limit: 9999 },
            });
            set({
                allUsers: response.data.data,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch all users:", error);
            set({ loading: false });
        }
    },
    createUser: async (data: CreateUserData) => {
        try {
            await apiClient.post("/super-admin/users", data);
            await get().fetchUsers({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error("Failed to create user:", error);
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
}));
