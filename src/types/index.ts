export interface Tenant {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
}

export interface UserTenantInfo {
    role: "OWNER" | "MANAGER" | "BAKER";
    tenant: {
        id: string;
        name: string;
    };
}

export interface AdminUser {
    id: string;
    name: string;
    email: string | null;
    systemRole: "SUPER_ADMIN" | null;
    status: "ACTIVE" | "INACTIVE"; // [新增] 用户状态
    createdAt: string;
    tenants: UserTenantInfo[];
}

export interface DashboardStats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
}

// [新增] 定义分页响应的数据结构
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// [修改] 创建老板账号时所需的数据类型，修复了之前的语法错误
export interface CreateOwnerData {
    name: string;
    email: string;
    password: string; // 修正了此处的类型定义
    tenantId: string;
}

// [新增] 更新用户信息时所需的数据类型
export interface UpdateUserData {
    name: string;
}
