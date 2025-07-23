import React, { useEffect, useState } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Select } from "antd";
import { Plus, Edit } from "lucide-react";
import { useAdminUserStore } from "@/store/adminUserStore";
import { useTenantStore } from "@/store/tenantStore";
import { AdminUser } from "@/types";

const { Title } = Typography;
const { Option } = Select;

const UserManagementPage: React.FC = () => {
    const { users, loading: usersLoading, fetchUsers, createOwner, updateUser } = useAdminUserStore();
    const { tenants, fetchTenants } = useTenantStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
        fetchTenants(); // 获取店铺列表用于下拉选择
    }, [fetchUsers, fetchTenants]);

    // --- 创建逻辑 ---
    const showCreateModal = () => {
        form.resetFields();
        setIsCreateModalVisible(true);
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
    };

    const handleCreateOwner = async () => {
        try {
            const values = await form.validateFields();
            await createOwner(values);
            message.success("老板账号创建成功");
            setIsCreateModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "创建失败，请重试";
            message.error(errorMessage);
            console.error("Failed to create owner:", error);
        }
    };

    // --- 编辑逻辑 ---
    const showEditModal = (user: AdminUser) => {
        setEditingUser(user);
        form.setFieldsValue({ name: user.name });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingUser(null);
    };

    const handleUpdate = async () => {
        if (!editingUser) return;
        try {
            const values = await form.validateFields();
            await updateUser(editingUser.id, { name: values.name });
            message.success("用户信息更新成功");
            handleEditCancel();
        } catch (error) {
            message.error("更新失败");
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
                <Space direction="vertical">
                    {tenants.map((t, index) => (
                        <Tag key={index} color="blue">
                            {t.tenant.name} ({t.role})
                        </Tag>
                    ))}
                </Space>
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
            render: (_: any, record: AdminUser) => (
                <Space size="middle">
                    <Button icon={<Edit size={14} />} onClick={() => showEditModal(record)}>
                        编辑
                    </Button>
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
                <Button type="primary" icon={<Plus size={16} />} onClick={showCreateModal}>
                    创建老板账号
                </Button>
            </div>
            <Table columns={columns} dataSource={users} loading={usersLoading} rowKey="id" />
            {/* 创建模态框 */}
            <Modal title="创建老板账号" open={isCreateModalVisible} onOk={handleCreateOwner} onCancel={handleCreateCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="create_owner_form">
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱!", type: "email" }]}>
                        {/* [修改] 添加 autoComplete 属性 */}
                        <Input autoComplete="username" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码!" }]}>
                        {/* [修改] 添加 autoComplete 属性 */}
                        <Input.Password autoComplete="new-password" />
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
            {/* 编辑模态框 */}
            <Modal title="编辑用户" open={isEditModalVisible} onOk={handleUpdate} onCancel={handleEditCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="edit_user_form">
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
