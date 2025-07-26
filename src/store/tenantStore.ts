import { create } from "zustand";
import apiClient from "@/services/api";
// [修改] 导入 CreateTenantData 类型
import { Tenant, PaginatedResponse, CreateTenantData } from "@/types";

interface TenantState {
    tenants: Tenant[];
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    fetchTenants: (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;
    // [修改] 更新 createTenant 的类型签名
    createTenant: (data: CreateTenantData) => Promise<void>;
    updateTenant: (id: string, data: { name?: string; status?: "ACTIVE" | "INACTIVE" }) => Promise<void>;
    deactivateTenant: (id: string) => Promise<void>;
    reactivateTenant: (id: string) => Promise<void>;
}

export const useTenantStore = create<TenantState>((set, get) => ({
    tenants: [],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 10,
    fetchTenants: async (params) => {
        set({ loading: true });
        try {
            const { page, pageSize, search, sortBy } = params;
            const response = await apiClient.get<PaginatedResponse<Tenant>>("/super-admin/tenants", {
                params: {
                    page,
                    limit: pageSize,
                    search: search || undefined, // 确保空字符串不被发送
                    sortBy,
                },
            });
            set({
                tenants: response.data.data,
                total: response.data.total,
                page: response.data.page,
                pageSize: response.data.limit,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
            set({ loading: false });
        }
    },
    // [修改] 更新 createTenant 的实现
    createTenant: async (data: CreateTenantData) => {
        try {
            await apiClient.post("/super-admin/tenants", data);
            // 创建成功后，刷新当前页的列表
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error("Failed to create tenant:", error);
            throw error;
        }
    },
    updateTenant: async (id, data) => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}`, data);
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update tenant ${id}:`, error);
            throw error;
        }
    },
    deactivateTenant: async (id: string) => {
        try {
            await apiClient.delete(`/super-admin/tenants/${id}`);
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to deactivate tenant ${id}:`, error);
            throw error;
        }
    },
    reactivateTenant: async (id: string) => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}/reactivate`);
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to reactivate tenant ${id}:`, error);
            throw error;
        }
    },
}));
