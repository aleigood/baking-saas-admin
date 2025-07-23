/**
 * 文件路径: src/types/index.ts
 * 文件描述: [新增] 定义项目共享的 TypeScript 类型。
 */
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
    createdAt: string;
    tenants: UserTenantInfo[];
}

// [新增] 仪表盘统计数据类型
export interface DashboardStats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
}
