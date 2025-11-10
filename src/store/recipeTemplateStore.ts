/**
 * 文件路径: src/store/recipeTemplateStore.ts
 * [G-Code-Note] [核心修改] 移除了 getTemplate 和 createRecipe 两个不再使用的方法
 */
import { create } from "zustand";
import apiClient from "@/services/api";
// [G-Code-Note] [核心修改] 移除了 CreateRecipeDto, 只保留批量导入相关的类型
import { BatchImportRecipeDto, BatchImportResultDto } from "@/types/recipe";

interface RecipeTemplateState {
    loading: boolean;
    // [G-Code-Note] [核心修改] 移除了 getTemplate
    // [G-Code-Note] [核心修改] 移除了 createRecipe
    // [G-Code-Note] [核心新增] 添加新的批量导入方法，并明确返回类型
    batchImportRecipes: (
        tenantId: string,
        recipes: BatchImportRecipeDto[],
    ) => Promise<BatchImportResultDto>;
}

export const useRecipeTemplateStore = create<RecipeTemplateState>((set) => ({
    loading: false,

    // [G-Code-Note] [核心修改] 已移除 getTemplate 和 recipeExamples 数组

    // [G-Code-Note] [核心修改] 已移除 createRecipe 方法

    // [G-Code-Note] [核心新增] 新的批量导入方法
    batchImportRecipes: async (tenantId: string, recipes: BatchImportRecipeDto[]) => {
        set({ loading: true });
        try {
            // [G-Code-Note] 调用我们新创建的批量导入接口
            // 它一次性发送整个数组
            const response = await apiClient.post(
                `/super-admin/tenants/${tenantId}/recipes/batch-import`,
                recipes,
            );
            return response.data; // 返回导入结果 (BatchImportResultDto)
        } catch (error) {
            console.error("Failed to batch import recipes:", error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },
}));