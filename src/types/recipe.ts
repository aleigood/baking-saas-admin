/**
 * @fileoverview [新增] 为配方创建功能提供前端类型定义，与后端 CreateRecipeDto 保持一致。
 * [修改] 调整了类型以支持新的配方模板数据结构。
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
    ratio?: number; // [修改] 设置为可选以兼容flourRatio
    isFlour?: boolean;
    waterContent?: number;
    flourRatio?: number; // [新增] 兼容新的配方数据
}

// [回滚] 移除 DoughDto

// 创建配方的主DTO
export interface CreateRecipeDto {
    name: string;
    type?: RecipeType;
    category?: string; // [新增] 兼容新的配方数据
    targetTemp?: number;
    lossRatio?: number;
    ingredients: DoughIngredientDto[]; // [回滚] 恢复顶层 ingredients 数组
    products?: ProductDto[];
    procedure?: string[];
}
