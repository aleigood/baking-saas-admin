import React, { useEffect, useState } from "react";
import { Typography, Button, message, Upload, Select, Form, Space, Checkbox, Tag, Modal } from "antd"; // [修改] 导入 Modal
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { Download, Upload as UploadIcon, PlusCircle } from "lucide-react";
import type { UploadProps } from "antd";
import { useRecipeTemplateStore } from "@/store/recipeTemplateStore";
import { useAdminUserStore } from "@/store/adminUserStore";
import { CreateRecipeDto } from "@/types/recipe";
import { AdminUser } from "@/types";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { CheckableTag } = Tag;

const RecipeTemplatesPage: React.FC = () => {
    const { loading, getTemplate, createRecipe } = useRecipeTemplateStore();
    const { allUsers, fetchAllUsers } = useAdminUserStore();
    const [form] = Form.useForm();
    const [isImporting, setIsImporting] = useState(false);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [recipesToImport, setRecipesToImport] = useState<CreateRecipeDto[]>([]);
    const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleUserChange = (userId: string) => {
        const user = allUsers.find((u) => u.id === userId);
        setSelectedUser(user || null);
        setSelectedTenantIds([]);
        form.setFieldsValue({ tenantIds: [] });
    };

    const handleTenantTagChange = (tenantId: string, checked: boolean) => {
        const nextSelectedTags = checked ? [...selectedTenantIds, tenantId] : selectedTenantIds.filter((t) => t !== tenantId);
        setSelectedTenantIds(nextSelectedTags);
        form.setFieldsValue({ tenantIds: nextSelectedTags });
    };

    const handleSelectAllTenants = (e: CheckboxChangeEvent) => {
        const allTenantIds = selectedUser?.tenants.map((t) => t.tenant.id) || [];
        const newSelectedIds = e.target.checked ? allTenantIds : [];
        setSelectedTenantIds(newSelectedIds);
        form.setFieldsValue({ tenantIds: newSelectedIds });
    };

    const handleDownloadTemplate = async () => {
        try {
            const templateData = await getTemplate();
            const jsonString = JSON.stringify(templateData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "recipe_examples.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            message.success("模板下载成功！");
        } catch (error) {
            message.error("模板下载失败");
        }
    };

    const handleImport = async () => {
        const successfulImports: string[] = [];
        const failedImports: { name: string; reason: string }[] = [];

        try {
            const values = await form.validateFields();
            const { tenantIds } = values;

            if (recipesToImport.length === 0) {
                message.error("请先选择并加载有效的配方文件。");
                return;
            }

            setIsImporting(true);

            // [修改] 串行导入并记录成功和失败日志
            for (const tenantId of tenantIds) {
                const tenantInfo = selectedUser?.tenants.find((t) => t.tenant.id === tenantId);
                const tenantName = tenantInfo?.tenant.name || tenantId;

                for (const recipe of recipesToImport) {
                    try {
                        await createRecipe(tenantId, recipe);
                        successfulImports.push(`配方 "${recipe.name}" 已成功导入到店铺 "${tenantName}"。`);
                    } catch (err: any) {
                        const reason = err.response?.data?.message || "未知错误";
                        failedImports.push({
                            name: `配方 "${recipe.name}" 导入到店铺 "${tenantName}" 失败`,
                            reason: reason,
                        });
                    }
                }
            }

            // [修改] 显示导入结果报告
            Modal.info({
                title: "导入完成",
                content: (
                    <div>
                        {successfulImports.length > 0 && (
                            <>
                                <p>
                                    <strong>成功:</strong>
                                </p>
                                <ul style={{ paddingLeft: 20, maxHeight: 200, overflowY: "auto" }}>
                                    {successfulImports.map((log, i) => (
                                        <li key={`succ-${i}`}>{log}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {failedImports.length > 0 && (
                            <>
                                <p style={{ marginTop: 10 }}>
                                    <strong>失败:</strong>
                                </p>
                                <ul style={{ paddingLeft: 20, maxHeight: 200, overflowY: "auto" }}>
                                    {failedImports.map((log, i) => (
                                        <li key={`fail-${i}`}>
                                            {log.name}: {log.reason}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                ),
                onOk() {},
            });

            form.resetFields();
            setRecipesToImport([]);
            setSelectedUser(null);
            setSelectedTenantIds([]);
        } catch (err: any) {
            // Handle form validation errors
            console.error("Form validation error:", err);
        } finally {
            setIsImporting(false);
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== "string") {
                        throw new Error("无法读取文件内容");
                    }
                    const data = JSON.parse(content);
                    const recipes = Array.isArray(data) ? data : [data];
                    setRecipesToImport(recipes);
                    message.success(`成功加载 ${recipes.length} 个配方，请选择店铺后点击“开始导入”。`);
                } catch (err) {
                    message.error("文件解析失败，请确保是合法的JSON格式。");
                    console.error("File parsing error:", err);
                }
            };
            reader.readAsText(file);
            return false;
        },
        maxCount: 1,
        accept: ".json",
        onRemove: () => {
            setRecipesToImport([]);
        },
    };

    return (
        <div>
            <Title level={2}>配方导入</Title>
            <Paragraph>您可以下载标准的JSON模板文件来准备配方数据，然后为指定的用户下的一个或多个店铺批量导入配方。</Paragraph>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Button type="dashed" icon={<Download size={16} />} onClick={handleDownloadTemplate}>
                    下载配方模板
                </Button>

                <Form form={form} layout="vertical" onFinish={handleImport} style={{ maxWidth: 500 }}>
                    <Form.Item name="userId" label="选择用户" rules={[{ required: true, message: "请选择一个用户!" }]}>
                        <Select
                            showSearch
                            placeholder="搜索并选择用户"
                            onChange={handleUserChange}
                            filterOption={(input, option) => (option?.children?.toString() ?? "").toLowerCase().includes(input.toLowerCase())}
                        >
                            {allUsers.map((user) => (
                                <Option key={user.id} value={user.id}>
                                    {user.phone}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedUser && (
                        <Form.Item label="选择目标店铺" required>
                            <Checkbox
                                onChange={handleSelectAllTenants}
                                checked={selectedUser.tenants.length > 0 && selectedTenantIds.length === selectedUser.tenants.length}
                                indeterminate={selectedTenantIds.length > 0 && selectedTenantIds.length < selectedUser.tenants.length}
                                style={{ marginBottom: 8 }}
                            >
                                全选
                            </Checkbox>
                            <Form.Item name="tenantIds" noStyle rules={[{ required: true, message: "请至少选择一个店铺!" }]}>
                                {/* [修复] 为 Option 添加 children 属性以解决类型错误 */}
                                <Select mode="multiple" style={{ display: "none" }}>
                                    {selectedUser.tenants.map((t) => (
                                        <Option key={t.tenant.id} value={t.tenant.id}>
                                            {t.tenant.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <div className="flex flex-wrap gap-2">
                                {selectedUser.tenants.map((t) => (
                                    // [修改] 为 CheckableTag 添加了内联样式，使其更美观
                                    <CheckableTag
                                        key={t.tenant.id}
                                        checked={selectedTenantIds.includes(t.tenant.id)}
                                        onChange={(checked) => handleTenantTagChange(t.tenant.id, checked)}
                                        style={{ padding: "4px 12px", fontSize: "14px", border: "1px solid #d9d9d9", borderRadius: "6px" }}
                                    >
                                        {t.tenant.name}
                                    </CheckableTag>
                                ))}
                            </div>
                        </Form.Item>
                    )}

                    <Form.Item
                        name="upload"
                        label="上传配方文件"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                        rules={[{ required: true, message: "请上传配方文件!" }]}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadIcon size={16} />}>选择文件</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isImporting || loading} icon={<PlusCircle size={16} />}>
                            开始导入
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </div>
    );
};

export default RecipeTemplatesPage;
