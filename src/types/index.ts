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
