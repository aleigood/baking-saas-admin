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
    // [修改] 更新 updateTenant 的类型签名，后端仅支持更新名称
    updateTenant: (id: string, data: { name?: string }) => Promise<void>;
    // [修改] 将停用操作改为删除操作，以匹配后端API
    deleteTenant: (id: string) => Promise<void>;
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
            // [修改] 调用新的店铺列表API，并适配分页参数
            const response = await apiClient.get<PaginatedResponse<Tenant>>("/super-admin/tenants", {
                params: {
                    page,
                    limit: pageSize,
                    search: search || undefined, // 确保空字符串不被发送
                    sortBy,
                },
            });
            // [修改] 根据后端返回的 meta 对象更新状态
            set({
                tenants: response.data.data,
                total: response.data.meta.total,
                page: response.data.meta.page,
                pageSize: response.data.meta.limit,
                loading: false,
            });
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
            set({ loading: false });
        }
    },
    // [修改] 更新 createTenant 的实现以匹配新的API要求
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
    // [修改] 更新 updateTenant 的实现
    updateTenant: async (id, data) => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}`, data);
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update tenant ${id}:`, error);
            throw error;
        }
    },
    // [修改] 将 deactivateTenant 重构为 deleteTenant，调用新的DELETE接口
    deleteTenant: async (id: string) => {
        try {
            await apiClient.delete(`/super-admin/tenants/${id}`);
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to delete tenant ${id}:`, error);
            throw error;
        }
    },
}));
