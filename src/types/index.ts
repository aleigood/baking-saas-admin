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

// [新增] 定义用户管理页面所需的用户数据类型
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
