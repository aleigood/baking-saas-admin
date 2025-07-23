import React from "react";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
    const { token, user } = useAuthStore();

    // 根据认证状态和用户角色来决定显示哪个页面
    if (token && user?.systemRole === "SUPER_ADMIN") {
        return <Dashboard />;
    }

    return <LoginPage />;
};

export default App;
