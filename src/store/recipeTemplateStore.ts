/**
 * 文件路径: src/store/recipeTemplateStore.ts
 * 文件描述: [修改] getTemplate 现在返回用户提供的、使用小数配方的示例。
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
    // [修改] getTemplate 现在返回一个新的包含三个配方案例的数组。
    getTemplate: async () => {
        const recipeExamples: CreateRecipeDto[] = [
            {
                name: "烫种",
                type: RecipeType.PRE_DOUGH,
                lossRatio: 0.1,
                category: "OTHER",
                ingredients: [
                    {
                        name: "高筋粉",
                        ratio: 1,
                        isFlour: true,
                    },
                    {
                        name: "水",
                        ratio: 2,
                        waterContent: 1,
                    },
                    {
                        name: "糖",
                        ratio: 0.2,
                    },
                    {
                        name: "盐",
                        ratio: 0.02,
                    },
                ],
                procedure: [],
                products: [],
            },
            {
                name: "卡仕达酱",
                type: RecipeType.EXTRA,
                lossRatio: 0.05,
                category: "OTHER",
                ingredients: [
                    {
                        name: "牛奶",
                        ratio: 1,
                        waterContent: 0.87,
                    },
                    {
                        name: "蛋黄",
                        ratio: 0.2,
                        waterContent: 0.5,
                    },
                    {
                        name: "糖",
                        ratio: 0.2,
                    },
                    {
                        name: "低筋粉",
                        ratio: 0.12,
                    },
                    {
                        name: "黄油",
                        ratio: 0.05,
                    },
                ],
                procedure: [],
                products: [],
            },
            {
                name: "甜面团",
                type: RecipeType.MAIN,
                category: "BREAD",
                targetTemp: 26,
                lossRatio: 0.03,
                procedure: ["搅拌：采用后糖法，搅拌至完全扩展"],
                ingredients: [
                    {
                        name: "烫种",
                        flourRatio: 0.08,
                    },
                    {
                        name: "高筋粉",
                        ratio: 0.92,
                        isFlour: true,
                    },
                    {
                        name: "水",
                        ratio: 0.4,
                        waterContent: 1,
                    },
                    {
                        name: "盐",
                        ratio: 0.0084,
                    },
                    {
                        name: "糖",
                        ratio: 0.184,
                    },
                    {
                        name: "半干酵母",
                        ratio: 0.013,
                    },
                    {
                        name: "黄油",
                        ratio: 0.08,
                    },
                    {
                        name: "奶粉",
                        ratio: 0.02,
                    },
                    {
                        name: "全蛋",
                        ratio: 0.2,
                        waterContent: 0.75,
                    },
                    {
                        name: "麦芽精",
                        ratio: 0.01,
                    },
                ],
                products: [
                    {
                        name: "熊掌卡仕达",
                        weight: 50,
                        procedure: ["发酵：二发温度35度50分钟", "烘烤：烤前刷过筛蛋液，两个杏仁片 一盘11个 上火210 下火180 烤10分钟"],
                        mixIn: [],
                        fillings: [
                            {
                                name: "卡仕达酱",
                                type: ProductIngredientType.FILLING,
                                weightInGrams: 30,
                            },
                        ],
                        toppings: [],
                    },
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
