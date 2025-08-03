import React from "react";
import { useAuthStore } from "./store/authStore";
import { useUIStore } from "./store/uiStore";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import TenantManagementPage from "./pages/TenantManagement";
import UserManagementPage from "./pages/UserManagement";
import RecipeTemplatesPage from "./pages/RecipeTemplates";
import MainLayout from "./components/Layout";

const App: React.FC = () => {
    const { token, user } = useAuthStore();
    const { activePage } = useUIStore();

    // 渲染当前活动页面的函数
    const renderActivePage = () => {
        switch (activePage) {
            case "dashboard":
                return <DashboardPage />;
            case "tenants":
                return <TenantManagementPage />;
            case "users":
                return <UserManagementPage />;
            case "recipes":
                return <RecipeTemplatesPage />;
            default:
                return <DashboardPage />;
        }
    };

    // [修复] 根据认证状态和用户角色来决定显示哪个页面
    // 将 user?.systemRole 修改为 user?.role 以匹配后端返回的数据结构
    if (token && user?.role === "SUPER_ADMIN") {
        return <MainLayout>{renderActivePage()}</MainLayout>;
    }

    return <LoginPage />;
};

export default App;
