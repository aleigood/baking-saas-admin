/**
 * 文件路径: src/store/recipeTemplateStore.ts
 * 文件描述: [新增] 用于管理配方模板的下载和导入功能。
 */
import { create } from "zustand";
import apiClient from "@/services/api";

interface RecipeTemplateState {
    loading: boolean;
    getTemplate: () => Promise<any>;
    importRecipe: (tenantId: string, recipeData: any) => Promise<void>;
}

export const useRecipeTemplateStore = create<RecipeTemplateState>(() => ({
    loading: false,
    getTemplate: async () => {
        try {
            const response = await apiClient.get("/super-admin/recipes/template");
            return response.data;
        } catch (error) {
            console.error("Failed to get recipe template:", error);
            throw error;
        }
    },
    importRecipe: async (tenantId: string, recipeData: any) => {
        try {
            await apiClient.post(`/super-admin/tenants/${tenantId}/recipes/import`, recipeData);
        } catch (error) {
            console.error("Failed to import recipe:", error);
            throw error;
        }
    },
}));
