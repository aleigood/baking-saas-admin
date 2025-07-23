import React, { useEffect, useState } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Select, Popconfirm } from "antd";
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react";
import { useAdminUserStore } from "@/store/adminUserStore";
import { useTenantStore } from "@/store/tenantStore";
import { AdminUser } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthStore } from "@/store/authStore";
import type { TableProps } from "antd";

const { Title } = Typography;
const { Option } = Select;

const UserManagementPage: React.FC = () => {
    const { users, loading: usersLoading, fetchUsers, createOwner, updateUser, updateUserStatus, total } = useAdminUserStore();
    const { tenants, fetchTenants } = useTenantStore();
    const { user: currentUser } = useAuthStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const [form] = Form.useForm();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [sorter, setSorter] = useState<{ field?: string; order?: "ascend" | "descend" }>({});

    useEffect(() => {
        const sortBy = sorter.field && sorter.order ? `${sorter.field}:${sorter.order === "ascend" ? "asc" : "desc"}` : undefined;
        fetchUsers({
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: debouncedSearchTerm,
            sortBy,
        });
    }, [fetchUsers, debouncedSearchTerm, pagination, sorter]);

    useEffect(() => {
        if (isCreateModalVisible) {
            fetchTenants({ page: 1, pageSize: 1000 });
        }
    }, [isCreateModalVisible, fetchTenants]);

    const handleTableChange: TableProps<AdminUser>["onChange"] = (pagination, _filters, sorter) => {
        setPagination({
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
        });
        if (!Array.isArray(sorter)) {
            setSorter({
                field: sorter.field as string,
                order: sorter.order || undefined,
            });
        }
    };

    // --- 创建逻辑 ---
    const showCreateModal = () => {
        form.resetFields();
        setIsCreateModalVisible(true);
    };
    const handleCreateCancel = () => setIsCreateModalVisible(false);
    const handleCreateOwner = async () => {
        try {
            const values = await form.validateFields();
            await createOwner(values);
            message.success("老板账号创建成功");
            setIsCreateModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "创建失败，请重试";
            message.error(errorMessage);
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

    // --- 状态变更逻辑 ---
    const handleStatusChange = async (userId: string, status: "ACTIVE" | "INACTIVE") => {
        try {
            await updateUserStatus(userId, status);
            message.success(`用户状态已更新为 ${status === "ACTIVE" ? "正常" : "已停用"}`);
        } catch (error) {
            message.error("操作失败");
        }
    };

    const columns: TableProps<AdminUser>["columns"] = [
        { title: "姓名", dataIndex: "name", key: "name", sorter: true },
        { title: "邮箱", dataIndex: "email", key: "email", sorter: true },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: string) => <Tag color={status === "ACTIVE" ? "green" : "red"}>{status === "ACTIVE" ? "正常" : "已停用"}</Tag>,
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
                        {record.status === "ACTIVE" ? (
                            <Popconfirm
                                title="确定要停用此用户吗？"
                                onConfirm={() => handleStatusChange(record.id, "INACTIVE")}
                                okText="确定"
                                cancelText="取消"
                                disabled={isCurrentUser}
                            >
                                <Button icon={<Trash2 size={14} />} danger disabled={isCurrentUser}>
                                    停用
                                </Button>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="确定要恢复此用户吗？"
                                onConfirm={() => handleStatusChange(record.id, "ACTIVE")}
                                okText="确定"
                                cancelText="取消"
                                disabled={isCurrentUser}
                            >
                                <Button icon={<RotateCcw size={14} />} disabled={isCurrentUser}>
                                    恢复
                                </Button>
                            </Popconfirm>
                        )}
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
                    创建老板账号
                </Button>
            </div>
            <div className="mb-4">
                <Input.Search placeholder="按姓名或邮箱搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
            </div>
            <Table
                columns={columns}
                dataSource={users}
                loading={usersLoading}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: total,
                }}
                onChange={handleTableChange}
            />
            {/* 创建模态框 */}
            <Modal title="创建老板账号" open={isCreateModalVisible} onOk={handleCreateOwner} onCancel={handleCreateCancel} confirmLoading={usersLoading}>
                <Form form={form} layout="vertical" name="create_owner_form">
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" rules={[{ required: true, message: "请输入邮箱!", type: "email" }]}>
                        <Input autoComplete="username" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: "请输入密码!" }]}>
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
