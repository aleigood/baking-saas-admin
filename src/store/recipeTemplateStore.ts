/**
 * 文件路径: src/store/recipeTemplateStore.ts
 * 文件描述: [新增] 用于管理配方模板的下载和导入功能。
 */
import { create } from "zustand";
import apiClient from "@/services/api";

interface RecipeTemplateState {
    loading: boolean; // 新增-统一的加载状态，用于导入操作
    getTemplate: () => Promise<any>;
    importRecipe: (tenantId: string, recipeData: any) => Promise<void>;
}

export const useRecipeTemplateStore = create<RecipeTemplateState>((set) => ({
    loading: false, // 初始化加载状态
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
        set({ loading: true }); // 开始导入时，设置loading为true
        try {
            await apiClient.post(`/super-admin/tenants/${tenantId}/recipes/import`, recipeData);
        } catch (error) {
            console.error("Failed to import recipe:", error);
            throw error; // 向上抛出错误，以便UI层捕获
        } finally {
            set({ loading: false }); // 无论成功或失败，结束后都设置loading为false
        }
    },
}));
