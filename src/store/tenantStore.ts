import { create } from "zustand";
import apiClient from "@/services/api";
import { Tenant, PaginatedResponse, CreateTenantData } from "@/types";

interface TenantState {
    tenants: Tenant[];
    loading: boolean;
    total: number;
    page: number;
    pageSize: number;
    fetchTenants: (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;
    createTenant: (data: CreateTenantData) => Promise<void>;
    updateTenant: (id: string, data: { name?: string }) => Promise<void>;
    updateTenantStatus: (id: string, status: "ACTIVE" | "INACTIVE") => Promise<void>;
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
                    search: search || undefined,
                    sortBy,
                },
            });
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
    createTenant: async (data: CreateTenantData) => {
        try {
            await apiClient.post("/super-admin/tenants", data);
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
    updateTenantStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}/status`, { status });
            await get().fetchTenants({ page: get().page, pageSize: get().pageSize });
        } catch (error) {
            console.error(`Failed to update tenant status for ${id}:`, error);
            throw error;
        }
    },
}));
