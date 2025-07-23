import React, { useEffect } from "react";
import { Typography, Row, Col, Card, Statistic, Spin } from "antd";
import { Store, Users, ShieldCheck } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { stats, loading, fetchStats } = useDashboardStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <Card>
            <Spin spinning={loading}>
                <Statistic title={title} value={value} prefix={icon} />
            </Spin>
        </Card>
    );

    return (
        <>
            <Title level={2} className="mb-6">
                系统仪表盘
            </Title>
            <Row gutter={16}>
                <Col span={8}>
                    <StatCard title="总店铺数" value={stats?.totalTenants || 0} icon={<Store className="text-blue-500" />} />
                </Col>
                <Col span={8}>
                    <StatCard title="活跃店铺数" value={stats?.activeTenants || 0} icon={<ShieldCheck className="text-green-500" />} />
                </Col>
                <Col span={8}>
                    <StatCard title="总用户数" value={stats?.totalUsers || 0} icon={<Users className="text-purple-500" />} />
                </Col>
            </Row>
        </>
    );
};

export default DashboardPage;
