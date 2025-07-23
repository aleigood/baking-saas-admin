import React, { useEffect, useState } from "react";
import { Typography, Button, message, Upload, Select, Form, Space } from "antd";
import { Download, Upload as UploadIcon } from "lucide-react";
import type { UploadProps } from "antd";
import { useRecipeTemplateStore } from "@/store/recipeTemplateStore";
import { useTenantStore } from "@/store/tenantStore";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const RecipeTemplatesPage: React.FC = () => {
    const { getTemplate, importRecipe } = useRecipeTemplateStore();
    const { tenants, fetchTenants } = useTenantStore();
    const [form] = Form.useForm();
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // [修正] 为 fetchTenants 提供必要的参数，获取所有店铺用于下拉框
        fetchTenants({ page: 1, pageSize: 1000 });
    }, [fetchTenants]);

    const handleDownloadTemplate = async () => {
        try {
            const templateData = await getTemplate();
            const jsonString = JSON.stringify(templateData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "recipe_template.json";
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
        try {
            const values = await form.validateFields();
            const { tenantId, upload } = values;
            const file = upload[0].originFileObj;

            if (!file) {
                message.error("请选择要上传的文件");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result;
                    if (typeof content !== "string") {
                        throw new Error("无法读取文件内容");
                    }
                    const recipeData = JSON.parse(content);

                    setIsUploading(true);
                    await importRecipe(tenantId, recipeData);
                    message.success("配方导入成功！");
                    form.resetFields();
                } catch (parseError) {
                    message.error("文件格式错误，请确保是有效的JSON文件。");
                    console.error("File parsing error:", parseError);
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsText(file);
        } catch (formError) {
            console.log("Form validation failed:", formError);
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: () => false, // 阻止自动上传
        maxCount: 1,
        accept: ".json",
    };

    return (
        <div>
            <Title level={2}>配方模板与导入</Title>
            <Paragraph>您可以下载标准的JSON模板文件来准备配方数据，然后为指定的店铺批量导入配方。</Paragraph>

            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Button type="dashed" icon={<Download size={16} />} onClick={handleDownloadTemplate}>
                    下载配方模板
                </Button>

                <Form form={form} layout="vertical" onFinish={handleImport} style={{ maxWidth: 400 }}>
                    <Form.Item name="tenantId" label="选择目标店铺" rules={[{ required: true, message: "请选择一个店铺!" }]}>
                        <Select placeholder="请选择要导入配方的店铺">
                            {tenants.map((tenant) => (
                                <Option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                        <Button type="primary" htmlType="submit" loading={isUploading}>
                            开始导入
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </div>
    );
};

export default RecipeTemplatesPage;
