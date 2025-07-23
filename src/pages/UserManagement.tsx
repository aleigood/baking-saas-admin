import React, { useEffect, useState } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Select } from "antd";
import { Plus } from "lucide-react";
import { useAdminUserStore } from "@/store/adminUserStore";
import { useTenantStore } from "@/store/tenantStore";
import { AdminUser } from "@/types";

const { Title } = Typography;
const { Option } = Select;

const UserManagementPage: React.FC = () => {
    const { users, loading: usersLoading, fetchUsers, createOwner } = useAdminUserStore();
    const { tenants, fetchTenants } = useTenantStore();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
        fetchTenants(); // 获取店铺列表用于下拉选择
    }, [fetchUsers, fetchTenants]);

    const showModal = () => {
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleCreateOwner = async () => {
        try {
            const values = await form.validateFields();
            await createOwner(values);
            message.success("老板账号创建成功");
            setIsModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "创建失败，请重试";
            message.error(errorMessage);
            console.error("Failed to create owner:", error);
        }
    };

    const columns = [
        {
            title: "姓名",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "邮箱",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "系统角色",
            dataIndex: "systemRole",
            key: "systemRole",
            render: (systemRole: string | null) => (systemRole ? <Tag color="gold">超级管理员</Tag> : <Tag>普通用户</Tag>),
        },
        {
            title: "所属店铺及角色",
            dataIndex: "tenants",
            key: "tenants",
            render: (tenants: AdminUser["tenants"]) => (
                <>
                    {tenants.map((t, index) => (
                        <Tag key={index} color="blue">
                            {t.tenant.name} ({t.role})
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "注册时间",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: "操作",
            key: "action",
            render: () => (
                <Space size="middle">
                    <a>编辑</a>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>
                    用户管理
                </Title>
                <Button type="primary" icon={<Plus size={16} />} onClick={showModal}>
                    创建老板账号
                </Button>
            </div>
            <Table columns={columns} dataSource={users} loading={usersLoading} rowKey="id" />
            <Modal title="创建老板账号" open={isModalVisible} onOk={handleCreateOwner} onCancel={handleCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="create_owner_form">
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱!", type: "email" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码!" }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="tenantId" label="所属店铺" rules={[{ required: true, message: "请选择一个店铺!" }]}>
                        <Select placeholder="请选择店铺">
                            {tenants.map((tenant) => (
                                <Option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
