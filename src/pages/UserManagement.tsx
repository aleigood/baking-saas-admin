import React, { useState } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Switch } from "antd";
import { Plus, Edit } from "lucide-react";
import { useAdminUserStore } from "@/store/adminUserStore";
import { AdminUser } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import type { TableProps } from "antd";

const { Title, Text } = Typography;

const UserManagementPage: React.FC = () => {
    const { users, loading: usersLoading, fetchUsers, createUser, updateUser, total } = useAdminUserStore();
    const { user: currentUser } = useAuthStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const [form] = Form.useForm();

    const { searchTerm, setSearchTerm, tableProps } = usePaginatedTable<AdminUser>(fetchUsers, usersLoading, total);

    const showCreateModal = () => {
        form.resetFields();
        setIsCreateModalVisible(true);
    };
    const handleCreateCancel = () => setIsCreateModalVisible(false);
    const handleCreateUser = async () => {
        try {
            const values = await form.validateFields();
            await createUser(values);
            message.success("用户账号创建成功");
            setIsCreateModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "创建失败，请重试";
            message.error(errorMessage);
        }
    };

    // --- [修改] 编辑逻辑，现在只允许更新姓名 ---
    const showEditModal = (user: AdminUser) => {
        setEditingUser(user);
        form.setFieldsValue({ name: user.name }); // [修改] 设置表单姓名字段的初始值
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
            await updateUser(editingUser.id, { name: values.name }); // [修改] 只更新姓名
            message.success("用户信息更新成功");
            handleEditCancel();
        } catch (error) {
            message.error("更新失败");
        }
    };

    const handleStatusChange = async (userId: string, status: "ACTIVE" | "INACTIVE") => {
        try {
            await updateUser(userId, { status });
            message.success(`用户状态已更新为 ${status === "ACTIVE" ? "正常" : "已停用"}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "操作失败";
            message.error(errorMessage);
        }
    };

    const columns: TableProps<AdminUser>["columns"] = [
        // [新增] 显示用户姓名
        { title: "姓名", dataIndex: "name", key: "name", sorter: true },
        { title: "手机号", dataIndex: "phone", key: "phone", sorter: true },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: "ACTIVE" | "INACTIVE", record: AdminUser) => (
                <Switch
                    checked={status === "ACTIVE"}
                    onChange={(checked) => handleStatusChange(record.id, checked ? "ACTIVE" : "INACTIVE")}
                    checkedChildren="正常"
                    unCheckedChildren="停用"
                    disabled={record.id === currentUser?.id}
                />
            ),
        },
        {
            title: "系统角色",
            dataIndex: "role",
            key: "role",
            render: (role: string | null) => (role === "SUPER_ADMIN" ? <Tag color="gold">超级管理员</Tag> : <Tag>普通用户</Tag>),
        },
        {
            title: "所属店铺及角色",
            dataIndex: "tenants",
            key: "tenants",
            render: (tenants: AdminUser["tenants"]) => (
                <Space direction="vertical">
                    {tenants && tenants.length > 0 ? (
                        tenants.map((t, index) => (
                            <Tag key={index} color="blue">
                                {t.tenant.name} ({t.role})
                            </Tag>
                        ))
                    ) : (
                        <Tag>未分配</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "注册时间",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: true,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, record: AdminUser) => {
                const isCurrentUser = record.id === currentUser?.id;
                return (
                    <Space size="middle">
                        <Button icon={<Edit size={14} />} onClick={() => showEditModal(record)} disabled={isCurrentUser}>
                            编辑
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>
                    用户管理
                </Title>
                <Button type="primary" icon={<Plus size={16} />} onClick={showCreateModal}>
                    创建用户
                </Button>
            </div>
            <div className="mb-4">
                <Input.Search placeholder="按手机号搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
            </div>
            <Table columns={columns} dataSource={users} rowKey="id" {...tableProps} />
            <Modal title="创建新用户" open={isCreateModalVisible} onOk={handleCreateUser} onCancel={handleCreateCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="create_user_form">
                    <Form.Item name="name" label="用户姓名" rules={[{ required: true, message: "请输入用户姓名!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="手机号" rules={[{ required: true, message: "请输入手机号!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码!" }]}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                </Form>
            </Modal>
            {/* [修改] 编辑用户的模态框，现在只编辑姓名 */}
            <Modal title="编辑用户" open={isEditModalVisible} onOk={handleUpdate} onCancel={handleEditCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="edit_user_form">
                    <Form.Item label="手机号">
                        <Text type="secondary">{editingUser?.phone}</Text>
                    </Form.Item>
                    <Form.Item name="name" label="用户姓名" rules={[{ required: true, message: "请输入用户姓名!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
