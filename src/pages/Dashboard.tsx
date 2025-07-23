import React from "react";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
    // [修改] 移除 MainLayout，因为 App.tsx 会统一处理
    return (
        <>
            <Title level={2}>欢迎来到超级管理后台</Title>
            <Paragraph>在这里，您可以管理整个系统的店铺、用户和核心数据。</Paragraph>
        </>
    );
};

export default DashboardPage;
