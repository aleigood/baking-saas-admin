import React, { useEffect } from "react";
import { Typography, Row, Col, Card, Statistic, Spin, message } from "antd";
import { Store, Users, ShieldCheck } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { stats, loading, fetchStats } = useDashboardStore();

    useEffect(() => {
        // 新增-定义一个异步函数来加载数据并处理错误
        const loadStats = async () => {
            try {
                await fetchStats();
            } catch (error) {
                // 新增-如果store中抛出错误，在这里捕获并用message组件提示用户
                message.error((error as Error).message);
            }
        };
        // 调用异步函数
        void loadStats();
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
