/**
 * @fileoverview [新增] 为配方创建功能提供前端类型定义，与后端 CreateRecipeDto 保持一致。
 */

// 枚举类型定义
export enum RecipeType {
    MAIN = "MAIN",
    PRE_DOUGH = "PRE_DOUGH",
    EXTRA = "EXTRA",
}

export enum ProductIngredientType {
    MIX_IN = "MIX_IN",
    FILLING = "FILLING",
    TOPPING = "TOPPING",
}

// 产品中的附加原料DTO
interface ProductIngredientDto {
    name: string;
    type: ProductIngredientType;
    ratio?: number;
    weightInGrams?: number;
}

// 最终产品DTO
interface ProductDto {
    name: string;
    weight: number; // 基础面团克重
    fillings?: ProductIngredientDto[];
    mixIn?: ProductIngredientDto[];
    toppings?: ProductIngredientDto[];
    procedure?: string[];
}

// 面团中的原料DTO
interface DoughIngredientDto {
    name: string;
    ratio: number;
    isFlour?: boolean;
    waterContent?: number;
}

// 创建配方的主DTO
export interface CreateRecipeDto {
    name: string;
    type?: RecipeType;
    targetTemp?: number;
    lossRatio?: number;
    ingredients: DoughIngredientDto[];
    products?: ProductDto[];
    procedure?: string[];
}
