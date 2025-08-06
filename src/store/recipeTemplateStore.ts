/**
 * 文件路径: src/store/recipeTemplateStore.ts
 * 文件描述: [修改] getTemplate 现在返回用户提供的、使用百分比配方的示例。
 * [新增] createRecipe 方法在发送数据前，会自动将百分比配方转换为小数。
 */
import { create } from "zustand";
import apiClient from "@/services/api";
import { CreateRecipeDto, RecipeType, ProductIngredientType } from "@/types/recipe"; // [新增] 引入配方类型

interface RecipeTemplateState {
    loading: boolean;
    getTemplate: () => Promise<any>;
    createRecipe: (tenantId: string, recipeData: CreateRecipeDto) => Promise<void>;
}

export const useRecipeTemplateStore = create<RecipeTemplateState>(() => ({
    loading: false,
    // [修改] getTemplate 现在返回一个包含三个详细配方案例的数组，使用用户友好的百分比格式。
    getTemplate: async () => {
        // [回滚] 恢复到原始的、符合您需求的 recipeExamples 结构
        const recipeExamples: CreateRecipeDto[] = [
            // 1. 预制面团 (PRE_DOUGH) 示例：烫种
            {
                name: "烫种",
                type: RecipeType.PRE_DOUGH,
                lossRatio: 0.1,
                ingredients: [
                    { name: "高筋粉", ratio: 100, isFlour: true },
                    { name: "水", ratio: 200, waterContent: 1 },
                    { name: "糖", ratio: 20 },
                    { name: "盐", ratio: 2 },
                ],
                procedure: ["在室温放置冷却后放入冰箱第二天使用"],
            },
            // 2. 附加项 (EXTRA) 示例：卡仕达酱
            {
                name: "卡仕达酱",
                type: RecipeType.EXTRA,
                lossRatio: 0.05,
                ingredients: [
                    { name: "低筋粉", ratio: 12, isFlour: true },
                    { name: "牛奶", ratio: 100, waterContent: 0.87 },
                    { name: "蛋黄", ratio: 20 },
                    { name: "糖", ratio: 20 },
                    { name: "黄油", ratio: 5 },
                ],
                procedure: ["牛奶温度达到90度后搅拌"],
            },
            // 3. 主配方 (MAIN) 示例：甜面团
            {
                name: "甜面团",
                type: RecipeType.MAIN,
                targetTemp: 26,
                ingredients: [
                    { name: "高筋粉", ratio: 92, isFlour: true },
                    { name: "烫种", ratio: 25.76 },
                    { name: "水", ratio: 40, waterContent: 1 },
                    { name: "盐", ratio: 0.84 },
                    { name: "糖", ratio: 18.4 },
                    { name: "半干酵母", ratio: 1.3 },
                    { name: "黄油", ratio: 8 },
                    { name: "奶粉", ratio: 2 },
                    { name: "全蛋", ratio: 20, waterContent: 0.75 },
                    { name: "麦芽精", ratio: 1 },
                ],
                products: [
                    {
                        name: "熊掌卡仕达",
                        weight: 50,
                        fillings: [{ name: "卡仕达酱", type: ProductIngredientType.FILLING, weightInGrams: 30 }],
                        mixIn: [{ name: "香草籽", type: ProductIngredientType.MIX_IN, ratio: 1 }],
                        procedure: ["烘烤：烤前刷过筛蛋液，一盘10个 上火210 下火180 烤10分钟"],
                    },
                    {
                        name: "小吐司",
                        weight: 250,
                        procedure: ["烘烤：一盘6个 上火210 下火180 烤20分钟"],
                    },
                ],
                procedure: [
                    "搅拌：采用后糖法，搅拌至完全扩展，出缸温度26度",
                    "发酵：二发温度35度50分钟",
                    "烘烤：烤前刷过筛蛋液，两个杏仁片 一盘10个 上火210 下火180 烤10分钟",
                ],
            },
        ];
        return Promise.resolve(recipeExamples);
    },
    // [修改] 实现配方创建逻辑，并移除 ratio / 100 的转换
    createRecipe: async (tenantId: string, recipeData: CreateRecipeDto) => {
        try {
            // [修改] 不再对 ratio 进行任何转换，直接将 recipeData 发送到后端
            await apiClient.post(`/super-admin/tenants/${tenantId}/recipes`, recipeData);
        } catch (error) {
            console.error("Failed to create recipe:", error);
            throw error; // 向上抛出错误，以便UI层捕获
        }
    },
}));
