import React, { useEffect, useState } from "react";
import { Typography, Button, message, Upload, Select, Form, Checkbox, Tag, Modal } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
// [G-Code-Note] [核心修改] 移除了 Download 图标
import { Upload as UploadIcon, PlusCircle } from "lucide-react";
import type { UploadProps } from "antd";
import { useRecipeTemplateStore } from "@/store/recipeTemplateStore";
import { useAdminUserStore } from "@/store/adminUserStore";
// [G-Code-Note] [核心修改] 导入 BatchImportRecipeDto
import { BatchImportRecipeDto } from "@/types/recipe";
import { AdminUser } from "@/types";

const { Title } = Typography;
const { Option } = Select;
const { CheckableTag } = Tag;

const RecipeTemplatesPage: React.FC = () => {
    // [G-Code-Note] [核心修改] 移除了 getTemplate
    const { loading, batchImportRecipes } = useRecipeTemplateStore();
    const { allUsers, fetchAllUsers } = useAdminUserStore();
    const [form] = Form.useForm();
    const [isImporting, setIsImporting] = useState(false);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [recipesToImport, setRecipesToImport] = useState<BatchImportRecipeDto[]>([]);
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

    // [G-Code-Note] [核心修改] 移除了 handleDownloadTemplate 整个函数

    // [G-Code-Note] [核心重构] 重写 handleImport 方法
    const handleImport = async () => {
        let totalImported = 0;
        let totalSkipped = 0;
        const skippedRecipesLog: string[] = [];

        try {
            const values = await form.validateFields();
            const { tenantIds } = values;

            if (recipesToImport.length === 0) {
                message.error("请先选择并加载有效的配方文件。");
                return;
            }

            setIsImporting(true);

            // [G-Code-Note] [核心修改] 串行导入 *每个租户*
            // 但每个租户的配方是 *批量* 提交的
            for (const tenantId of tenantIds) {
                const tenantInfo = selectedUser?.tenants.find((t) => t.tenant.id === tenantId);
                const tenantName = tenantInfo?.tenant.name || tenantId;

                try {
                    // [G-Code-Note] [核心修改]
                    // 一次性发送所有配方到新的批量导入接口
                    // 替换掉旧的 "for (const recipe of recipesToImport)" 循环
                    const result = await batchImportRecipes(tenantId, recipesToImport);

                    // [G-Code-Note] 累加后端返回的结果
                    totalImported += result.importedCount;
                    totalSkipped += result.skippedCount;
                    if (result.skippedRecipes && result.skippedRecipes.length > 0) {
                        // [G-Code-Note] 修正 map 的类型
                        skippedRecipesLog.push(...result.skippedRecipes.map((log: string) => `(店铺: ${tenantName}) ${log}`));
                    }
                    message.success(`店铺 "${tenantName}" 导入完成。`);
                } catch (err: any) {
                    const reason = err.response?.data?.message || "未知错误";
                    message.error(`店铺 "${tenantName}" 导入失败: ${reason}`);
                    totalSkipped += recipesToImport.length; // 整个店铺失败
                }
            }

            // [G-Code-Note] [核心修改] 显示后端返回的聚合报告
            Modal.info({
                title: "导入完成",
                content: (
                    <div>
                        <p>
                            <strong>总计成功:</strong> {totalImported} 个配方族
                        </p>
                        <p>
                            <strong>总计跳过/失败:</strong> {totalSkipped} 个配方族
                        </p>
                        {skippedRecipesLog.length > 0 && (
                            <>
                                <p style={{ marginTop: 10 }}>
                                    <strong>跳过/失败详情:</strong>
                                </p>
                                <ul style={{ paddingLeft: 20, maxHeight: 200, overflowY: "auto" }}>
                                    {skippedRecipesLog.map((log, i) => (
                                        <li key={`fail-${i}`}>{log}</li>
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
                    // [G-Code-Note] [核心修改] 确保加载的数据被断言为正确的 DTO 类型
                    const recipes = (Array.isArray(data) ? data : [data]) as BatchImportRecipeDto[];
                    setRecipesToImport(recipes);
                    message.success(`成功加载 ${recipes.length} 个配方族，请选择店铺后点击“开始导入”。`);
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
            {/* [G-Code-Note] [核心修改] 标题已修改 */}
            <Title level={2}>配方管理</Title>

            {/* [G-Code-Note] [核心修改] 描述文字已移除 */}
            {/* <Paragraph>您可以下载标准的JSON模板文件来准备配方数据，然后为指定的用户下的一个或多个店铺批量导入配方。</Paragraph> */}

            {/* [G-Code-Note] [核心修改] 移除了 Space 和 下载按钮 */}
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
        </div>
    );
};

export default RecipeTemplatesPage;
