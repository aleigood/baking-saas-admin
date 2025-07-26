import React, { useState, useEffect } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Popconfirm, Select } from "antd";
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react";
import { useTenantStore } from "@/store/tenantStore";
import { useAdminUserStore } from "@/store/adminUserStore";
import { Tenant, AdminUser } from "@/types";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import type { TableProps } from "antd";

const { Title } = Typography;
const { Option } = Select;

const TenantManagementPage: React.FC = () => {
    const { tenants, loading, fetchTenants, createTenant, updateTenant, deactivateTenant, reactivateTenant, total } = useTenantStore();
    const { users, fetchUsers } = useAdminUserStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [form] = Form.useForm();

    const { searchTerm, setSearchTerm, tableProps } = usePaginatedTable<Tenant>(fetchTenants, loading, total);

    // [修改] 获取所有非超级管理员用户作为潜在的老板人选
    const potentialOwners = users.filter((user) => !user.systemRole);

    // [新增] 当创建模态框打开时，获取所有用户
    useEffect(() => {
        if (isCreateModalVisible) {
            fetchUsers({ page: 1, pageSize: 1000 }); // 获取足够多的用户以供选择
        }
    }, [isCreateModalVisible, fetchUsers]);

    // --- [修改] 创建店铺逻辑 ---
    const showCreateModal = () => {
        form.resetFields();
        setIsCreateModalVisible(true);
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            await createTenant({ name: values.name, ownerId: values.ownerId });
            message.success("店铺创建成功");
            setIsCreateModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "店铺创建失败";
            message.error(errorMessage);
            console.error("Failed to create tenant:", error);
        }
    };

    // --- 编辑店铺逻辑 ---
    const showEditModal = (tenant: Tenant) => {
        setEditingTenant(tenant);
        form.setFieldsValue({ name: tenant.name });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingTenant(null);
    };

    const handleUpdate = async () => {
        if (!editingTenant) return;
        try {
            const values = await form.validateFields();
            await updateTenant(editingTenant.id, { name: values.name });
            message.success("店铺更新成功");
            handleEditCancel();
        } catch (error) {
            message.error("店铺更新失败");
        }
    };

    // --- 停用/激活逻辑 ---
    const handleDeactivate = async (tenantId: string) => {
        try {
            await deactivateTenant(tenantId);
            message.success("店铺已停用");
        } catch (error) {
            message.error("操作失败");
        }
    };

    const handleReactivate = async (tenantId: string) => {
        try {
            await reactivateTenant(tenantId);
            message.success("店铺已恢复正常");
        } catch (error) {
            message.error("操作失败");
        }
    };

    const columns: TableProps<Tenant>["columns"] = [
        {
            title: "店铺名称",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },
        // [新增] 显示老板信息的列
        {
            title: "老板",
            dataIndex: "owner",
            key: "owner",
            render: (owner: Tenant["owner"]) => (owner ? `${owner.name} (${owner.email || "N/A"})` : "未指定"),
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: string) => <Tag color={status === "ACTIVE" ? "green" : "red"}>{status === "ACTIVE" ? "正常" : "已停用"}</Tag>,
        },
        {
            title: "创建时间",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: true,
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, record: Tenant) => (
                <Space size="middle">
                    <Button icon={<Edit size={14} />} onClick={() => showEditModal(record)}>
                        编辑
                    </Button>
                    {record.status === "ACTIVE" ? (
                        <Popconfirm title="确定要停用此店铺吗？" onConfirm={() => handleDeactivate(record.id)} okText="确定" cancelText="取消">
                            <Button icon={<Trash2 size={14} />} danger>
                                停用
                            </Button>
                        </Popconfirm>
                    ) : (
                        <Popconfirm title="确定要恢复此店铺吗？" onConfirm={() => handleReactivate(record.id)} okText="确定" cancelText="取消">
                            <Button icon={<RotateCcw size={14} />}>恢复正常</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>
                    店铺管理
                </Title>
                <Button type="primary" icon={<Plus size={16} />} onClick={showCreateModal}>
                    创建店铺
                </Button>
            </div>
            <div className="mb-4">
                <Input.Search placeholder="按店铺名称搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: 300 }} />
            </div>
            <Table columns={columns} dataSource={tenants} rowKey="id" {...tableProps} />
            {/* [修改] 创建店铺的模态框 */}
            <Modal title="创建新店铺" open={isCreateModalVisible} onOk={handleCreate} onCancel={handleCreateCancel} confirmLoading={loading}>
                <Form form={form} layout="vertical" name="create_tenant_form">
                    <Form.Item name="name" label="店铺名称" rules={[{ required: true, message: "请输入店铺名称!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ownerId" label="指定老板" rules={[{ required: true, message: "请选择一位老板!" }]}>
                        <Select
                            placeholder="从用户列表中选择一位作为老板"
                            showSearch
                            filterOption={(input, option) => (option?.children?.toString() ?? "").toLowerCase().includes(input.toLowerCase())}
                        >
                            {potentialOwners.map((user: AdminUser) => (
                                <Option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            {/* 编辑模态框 */}
            <Modal title="编辑店铺" open={isEditModalVisible} onOk={handleUpdate} onCancel={handleEditCancel} confirmLoading={loading}>
                <Form form={form} layout="vertical" name="edit_tenant_form">
                    <Form.Item name="name" label="店铺名称" rules={[{ required: true, message: "请输入店铺名称!" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TenantManagementPage;
