import React from "react";
import { Layout as AntLayout, Menu, Button, Avatar, Typography } from "antd";
import type { MenuProps } from "antd";
import { Home, Store, Users, BookCopy, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore"; // [新增] 导入 UI store

const { Header, Content, Sider } = AntLayout;
const { Title } = Typography;

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { user, logout } = useAuthStore();
    const { activePage, setActivePage } = useUIStore(); // [新增] 使用 UI store

    // [新增] 菜单点击事件处理
    const handleMenuClick: MenuProps["onClick"] = (e) => {
        setActivePage(e.key as any);
    };

    return (
        <AntLayout style={{ minHeight: "100vh" }}>
            <Sider width={220} theme="light">
                <div className="p-4">
                    <Title level={4} style={{ color: "#c47d57", margin: 0 }}>
                        烘焙SaaS后台
                    </Title>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activePage]} // [修改] 使用 store 中的状态
                    onClick={handleMenuClick} // [修改] 绑定点击事件
                    style={{ borderRight: 0 }}
                    items={[
                        // [修改] 为每个菜单项指定唯一的 key
                        { key: "dashboard", icon: <Home size={16} />, label: "仪表盘" },
                        { key: "tenants", icon: <Store size={16} />, label: "店铺管理" },
                        { key: "users", icon: <Users size={16} />, label: "用户管理" },
                        { key: "recipes", icon: <BookCopy size={16} />, label: "配方模板" },
                    ]}
                />
            </Sider>
            <AntLayout>
                <Header className="bg-white border-b border-gray-200 px-6 flex justify-end items-center">
                    <div className="flex items-center gap-4">
                        <Avatar style={{ backgroundColor: "#c47d57" }}>{user?.name?.[0]?.toUpperCase() || "A"}</Avatar>
                        <span className="font-medium">{user?.name || "Admin"}</span>
                        <Button icon={<LogOut size={16} />} onClick={logout}>
                            退出登录
                        </Button>
                    </div>
                </Header>
                <Content className="m-6 bg-white p-6 rounded-lg">{children}</Content>
            </AntLayout>
        </AntLayout>
    );
};

export default MainLayout;
