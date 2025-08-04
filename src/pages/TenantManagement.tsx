import React, { useState, useEffect } from "react";
import { Typography, Button, Table, Space, Modal, Form, Input, message, Select, Switch, Popconfirm } from "antd";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useTenantStore } from "@/store/tenantStore";
import { useAdminUserStore } from "@/store/adminUserStore";
import { Tenant, AdminUser } from "@/types";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import type { TableProps } from "antd";

const { Title } = Typography;
const { Option } = Select;

const TenantManagementPage: React.FC = () => {
    const { tenants, loading, fetchTenants, createTenant, updateTenant, updateTenantStatus, deleteTenant, total } = useTenantStore();
    const { users, fetchUsers } = useAdminUserStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [form] = Form.useForm();

    const { searchTerm, setSearchTerm, tableProps } = usePaginatedTable<Tenant>(fetchTenants, loading, total);

    const potentialOwners = users;

    useEffect(() => {
        if (isCreateModalVisible) {
            fetchUsers({ page: 1, pageSize: 1000 });
        }
    }, [isCreateModalVisible, fetchUsers]);

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
        }
    };

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

    const handleStatusChange = async (tenantId: string, checked: boolean) => {
        const newStatus = checked ? "ACTIVE" : "INACTIVE";
        try {
            await updateTenantStatus(tenantId, newStatus);
            message.success(`店铺状态已更新为 ${newStatus === "ACTIVE" ? "正常" : "已停用"}`);
        } catch (error) {
            message.error("操作失败");
        }
    };

    const handleDelete = async (tenantId: string) => {
        try {
            await deleteTenant(tenantId);
            message.success("店铺已永久删除");
        } catch (error) {
            message.error("删除失败");
        }
    };

    const columns: TableProps<Tenant>["columns"] = [
        {
            title: "店铺名称",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },
        {
            title: "老板",
            dataIndex: "ownerName",
            key: "owner",
            render: (ownerName: string | null) => (ownerName ? ownerName : "未指定"),
        },
        {
            title: "配方总数",
            dataIndex: "recipeCount",
            key: "recipeCount",
            sorter: true,
            align: "center",
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status: "ACTIVE" | "INACTIVE", record: Tenant) => (
                <Switch
                    checked={status === "ACTIVE"}
                    onChange={(checked) => handleStatusChange(record.id, checked)}
                    checkedChildren="正常"
                    unCheckedChildren="停用"
                />
            ),
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
                    {/* 添加删除按钮和二次确认 */}
                    <Popconfirm
                        title="确定要永久删除此店铺吗？"
                        description="此操作不可恢复，将删除所有相关数据。"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定删除"
                        cancelText="取消"
                    >
                        <Button icon={<Trash2 size={14} />} danger>
                            删除
                        </Button>
                    </Popconfirm>
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
                <Input.Search
                    placeholder="按店铺名称或老板手机号搜索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 300 }}
                />
            </div>
            <Table columns={columns} dataSource={tenants} rowKey="id" {...tableProps} />
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
                                    {user.phone}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
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
