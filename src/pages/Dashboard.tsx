import React from "react";
import MainLayout from "@/components/Layout";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
    return (
        <MainLayout>
            <Title level={2}>欢迎来到超级管理后台</Title>
            <Paragraph>在这里，您可以管理整个系统的店铺、用户和核心数据。</Paragraph>
        </MainLayout>
    );
};

export default Dashboard;
