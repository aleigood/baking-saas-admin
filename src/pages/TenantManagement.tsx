import React, { useState } from "react";
import { Typography, Button, Table, Space, Tag, Modal, Form, Input, message, Popconfirm } from "antd";
import { Plus, Edit, Trash2, RotateCcw } from "lucide-react";
import { useTenantStore } from "@/store/tenantStore";
import { Tenant } from "@/types";
import { usePaginatedTable } from "@/hooks/usePaginatedTable"; // [修改] 导入新的 Hook
import type { TableProps } from "antd"; // [新增] 导入 TableProps 类型

const { Title } = Typography;

const TenantManagementPage: React.FC = () => {
    const { tenants, loading, fetchTenants, createTenant, updateTenant, deactivateTenant, reactivateTenant, total } = useTenantStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [form] = Form.useForm();

    // --- [修改] 使用 usePaginatedTable Hook 简化状态管理 ---
    const { searchTerm, setSearchTerm, tableProps } = usePaginatedTable<Tenant>(fetchTenants, loading, total);

    // --- 创建店铺逻辑 ---
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
            await createTenant(values.name);
            message.success("店铺创建成功");
            setIsCreateModalVisible(false);
        } catch (error) {
            message.error("店铺创建失败");
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
            {/* --- [修改] 直接使用 tableProps --- */}
            <Table columns={columns} dataSource={tenants} rowKey="id" {...tableProps} />
            {/* 创建模态框 */}
            <Modal title="创建新店铺" open={isCreateModalVisible} onOk={handleCreate} onCancel={handleCreateCancel} confirmLoading={loading}>
                <Form form={form} layout="vertical" name="create_tenant_form">
                    <Form.Item name="name" label="店铺名称" rules={[{ required: true, message: "请输入店铺名称!" }]}>
                        <Input />
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
