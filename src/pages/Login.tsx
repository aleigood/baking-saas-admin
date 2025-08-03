import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
// [修改] 导入 Phone 图标替换 Mail 图标
import { Phone, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";

const { Title } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { setToken, setUser, logout } = useAuthStore();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // [修改] 调用新的登录接口，使用 phone 字段
            const response = await apiClient.post("/auth/login", {
                phone: values.phone,
                password: values.password,
            });

            // [修改] 后端直接返回 accessToken
            const { accessToken } = response.data;
            setToken(accessToken);

            // [修改] 获取用户信息接口变为 /auth/profile
            const userResponse = await apiClient.get("/auth/profile", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // [修复] 后端返回的用户角色字段为 role，而不是 systemRole
            if (userResponse.data.role !== "SUPER_ADMIN") {
                message.error("您没有权限登录此后台。");
                logout();
                return;
            }

            setUser(userResponse.data);
            message.success("登录成功！");
        } catch (error) {
            // [修改] 提供更通用的错误提示
            message.error("登录失败，请检查您的手机号和密码。");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <Title level={2}>超级管理后台</Title>
                </div>
                <Form name="login" initialValues={{ remember: true }} onFinish={onFinish}>
                    {/* [修改] 将邮箱输入框改为手机号输入框 */}
                    <Form.Item name="phone" rules={[{ required: true, message: "请输入您的手机号!" }]}>
                        <Input prefix={<Phone className="site-form-item-icon" />} placeholder="手机号" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: "请输入您的密码!" }]}>
                        <Input.Password prefix={<Lock className="site-form-item-icon" />} type="password" placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            登 录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
