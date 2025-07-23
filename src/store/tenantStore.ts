import { create } from "zustand";
import apiClient from "@/services/api";
import { Tenant } from "@/types";

interface TenantState {
    tenants: Tenant[];
    loading: boolean;
    fetchTenants: () => Promise<void>;
    createTenant: (name: string) => Promise<void>;
    updateTenant: (id: string, data: { name?: string; status?: "ACTIVE" | "INACTIVE" }) => Promise<void>;
    deactivateTenant: (id: string) => Promise<void>;
    reactivateTenant: (id: string) => Promise<void>; // [新增] 激活店铺的 action
}

export const useTenantStore = create<TenantState>((set, get) => ({
    tenants: [],
    loading: false,
    fetchTenants: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get<Tenant[]>("/super-admin/tenants");
            set({ tenants: response.data, loading: false });
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
            set({ loading: false });
        }
    },
    createTenant: async (name: string) => {
        try {
            await apiClient.post("/super-admin/tenants", { name });
            await get().fetchTenants();
        } catch (error) {
            console.error("Failed to create tenant:", error);
            throw error;
        }
    },
    updateTenant: async (id, data) => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}`, data);
            await get().fetchTenants();
        } catch (error) {
            console.error(`Failed to update tenant ${id}:`, error);
            throw error;
        }
    },
    deactivateTenant: async (id: string) => {
        try {
            await apiClient.delete(`/super-admin/tenants/${id}`);
            await get().fetchTenants();
        } catch (error) {
            console.error(`Failed to deactivate tenant ${id}:`, error);
            throw error;
        }
    },
    // [新增] 激活店铺
    reactivateTenant: async (id: string) => {
        try {
            await apiClient.patch(`/super-admin/tenants/${id}/reactivate`);
            await get().fetchTenants();
        } catch (error) {
            console.error(`Failed to reactivate tenant ${id}:`, error);
            throw error;
        }
    },
}));
