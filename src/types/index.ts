/**
 * @fileoverview 更新了所有的类型定义以匹配重构后的后端API和Prisma模型。
 * 主要变更：
 * - Tenant 类型更新，增加了 owner 字段来显示店铺所有者信息。
 * - AdminUser 类型更新，使用 'phone' 替代了原有的 'name' 和 'email' 字段。
 * - PaginatedResponse 的 'limit' 字段重命名为 'pageSize' 以与 antd 组件更好地集成，并更新了分页元数据结构。
 * - 新增了 CreateUserData 和 CreateTenantData 类型，用于创建用户和店铺，并废弃了过时的 CreateOwnerData。
 */

// 店铺信息接口
export interface Tenant {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
    ownerName: string | null;
    ownerId: string | null;
    recipeCount: number;
}

// 用户所属店铺信息接口 (用于用户详情展示)
export interface UserTenantInfo {
    role: "OWNER" | "ADMIN" | "MEMBER";
    tenant: {
        id: string;
        name: string;
    };
}

// 管理后台用户接口
export interface AdminUser {
    id: string;
    phone: string; // [修改] 使用 phone 替代 name 和 email
    role: "SUPER_ADMIN" | "OWNER" | "ADMIN" | "MEMBER" | null; // [修改] role 来自后端 User.role 和 TenantUser.role
    status: "ACTIVE" | "INACTIVE" | "PENDING";
    createdAt: string;
    tenants: UserTenantInfo[]; // 该用户所属的店铺列表
}

// 仪表盘统计数据接口
export interface DashboardStats {
    totalTenants: number;
    totalUsers: number;
    // [新增] 新增配方和生产任务总数统计
    totalRecipes: number;
    totalTasks: number;
}

// 分页响应接口
// [修改] 更新分页响应结构以匹配后端返回的 meta 对象
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
    };
}

// [新增] 创建独立用户时所需的数据类型
export interface CreateUserData {
    phone: string;
    password: string;
}

// [废弃] 此类型不再需要，由 CreateUserData 和 CreateTenantData 替代
export interface CreateOwnerData {
    name: string;
    email: string;
    password: string;
    tenantId: string;
}

// [新增] 创建店铺时所需的数据类型
export interface CreateTenantData {
    name: string;
    ownerId: string;
}

// [修改] 更新用户时所需的数据类型，以匹配后端接口
export interface UpdateUserData {
    phone?: string;
    password?: string;
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
}
