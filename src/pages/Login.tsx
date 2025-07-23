import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";

const { Title } = Typography;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    // [修正] 从 store 中解构出 logout 方法
    const { setToken, setUser, logout } = useAuthStore();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await apiClient.post("/auth/login", {
                email: values.email,
                password: values.password,
            });

            const { access_token } = response.data;
            setToken(access_token);

            // 获取用户信息
            const userResponse = await apiClient.get("/auth/me", {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            if (userResponse.data.systemRole !== "SUPER_ADMIN") {
                message.error("您没有权限登录此后台。");
                logout(); // 现在可以正确调用
                return;
            }

            setUser(userResponse.data);
            message.success("登录成功！");
        } catch (error) {
            message.error("登录失败，请检查您的邮箱和密码。");
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
                    <Form.Item name="email" rules={[{ required: true, message: "请输入您的邮箱!", type: "email" }]}>
                        <Input prefix={<Mail className="site-form-item-icon" />} placeholder="邮箱" />
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
