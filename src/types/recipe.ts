/**
 * @fileoverview [新增] 为配方创建功能提供前端类型定义，与后端 CreateRecipeDto 保持一致。
 * [修改] 调整了类型以支持新的配方模板数据结构。
 * [G-Code-Note] [核心修改] 新增了批量导入所需的全部类型 (BatchImportRecipeDto 等)。
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

// ===================================================================
// 1. 单个配方创建 (CreateRecipeDto) 相关的类型
// ===================================================================

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

// ===================================================================
// 2. 批量导入 (BatchImport) 相关的类型
// [G-Code-Note] 以下是新增的类型，用于匹配后端批量导入的 DTO 结构
// ===================================================================

export interface BatchProductIngredientDto {
    name: string;
    ratio?: number;
    weightInGrams?: number;
}

export interface BatchProductDto {
    name: string;
    weight: number;
    fillings?: BatchProductIngredientDto[];
    mixIn?: BatchProductIngredientDto[];
    toppings?: BatchProductIngredientDto[];
    procedure?: string[];
}

export interface BatchComponentIngredientDto {
    name: string;
    ratio?: number;
    flourRatio?: number;
    isFlour?: boolean;
    waterContent?: number;
}

export interface BatchImportVersionDto {
    notes: string;
    targetTemp?: number;
    lossRatio?: number;
    divisionLoss?: number;
    ingredients: BatchComponentIngredientDto[];
    products?: BatchProductDto[];
    procedure?: string[];
}

export interface BatchImportRecipeDto {
    name: string;
    type: RecipeType;
    category: string; // [G-Code-Note] 对应后端的 RecipeCategory 枚举
    versions: BatchImportVersionDto[];
}

// 后端返回的导入结果
export interface BatchImportResultDto {
    totalCount: number;
    importedCount: number;
    skippedCount: number;
    skippedRecipes: string[];
}