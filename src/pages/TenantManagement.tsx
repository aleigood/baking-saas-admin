import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const TenantManagementPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>店铺管理</Title>
            {/* 后续将在这里实现店铺列表、创建、编辑等功能 */}
        </div>
    );
};

export default TenantManagementPage;
