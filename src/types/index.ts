export interface Tenant {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    updatedAt: string;
    // [新增] 为店铺信息添加老板字段
    owner?: {
        name: string;
        email: string | null;
    } | null;
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
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    tenants: UserTenantInfo[];
}

export interface DashboardStats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// [新增] 创建独立用户时所需的数据类型
export interface CreateUserData {
    name: string;
    email: string;
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

export interface UpdateUserData {
    name: string;
}
