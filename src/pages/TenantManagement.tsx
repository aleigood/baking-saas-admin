import React, { useState, useEffect } from "react";
import { Typography, Button, Table, Space, Modal, Form, Input, message, Popconfirm, Select } from "antd";
// [修改] 移除 RotateCcw 图标，因为它对应的“恢复”功能已不存在
import { Plus, Edit, Trash2 } from "lucide-react";
import { useTenantStore } from "@/store/tenantStore";
import { useAdminUserStore } from "@/store/adminUserStore";
import { Tenant, AdminUser } from "@/types";
import { usePaginatedTable } from "@/hooks/usePaginatedTable";
import type { TableProps } from "antd";

const { Title } = Typography;
const { Option } = Select;

const TenantManagementPage: React.FC = () => {
    // [修改] 替换 deactivateTenant 和 reactivateTenant 为 deleteTenant
    const { tenants, loading, fetchTenants, createTenant, updateTenant, deleteTenant, total } = useTenantStore();
    const { users, fetchUsers } = useAdminUserStore();

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [form] = Form.useForm();

    const { searchTerm, setSearchTerm, tableProps } = usePaginatedTable<Tenant>(fetchTenants, loading, total);

    // [修改] 获取所有用户作为潜在的老板人选
    const potentialOwners = users;

    // [新增] 当创建模态框打开时，获取所有用户
    useEffect(() => {
        if (isCreateModalVisible) {
            // [修改] 获取所有用户以填充下拉列表
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
            // [修改] 调用新的 createTenant 方法，传入 name 和 ownerId
            await createTenant({ name: values.name, ownerId: values.ownerId });
            message.success("店铺创建成功");
            setIsCreateModalVisible(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "店铺创建失败";
            message.error(errorMessage);
            console.error("Failed to create tenant:", error);
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

    // --- [修改] 删除店铺逻辑 ---
    const handleDelete = async (tenantId: string) => {
        try {
            await deleteTenant(tenantId);
            message.success("店铺已删除");
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
        // [修改] 显示老板手机号的列
        {
            title: "老板",
            dataIndex: "ownerName",
            key: "owner",
            render: (ownerName: string | null) => (ownerName ? ownerName : "未指定"),
        },
        // [修改] 移除状态列，因为后端模型已无此字段
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
                    {/* [修改] 将“停用”改为“删除”，并移除恢复功能 */}
                    <Popconfirm title="确定要永久删除此店铺吗？此操作不可恢复。" onConfirm={() => handleDelete(record.id)} okText="确定删除" cancelText="取消">
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
                            // [修改] 筛选逻辑基于用户手机号
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
