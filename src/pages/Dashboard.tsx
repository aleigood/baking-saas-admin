import React, { useEffect } from "react";
import { Typography, Row, Col, Card, Statistic, Spin, message } from "antd";
// [修改] 引入更多图标用于展示新增的统计项
import { Store, Users, BookCopy, ClipboardList } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    // [修改] 从 store 中获取新的 stats 字段
    const { stats, loading, fetchStats } = useDashboardStore();

    useEffect(() => {
        const loadStats = async () => {
            try {
                await fetchStats();
            } catch (error) {
                message.error((error as Error).message);
            }
        };
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
            {/* [修改] 调整布局以容纳更多统计卡片 */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={12} lg={6}>
                    <StatCard title="总店铺数" value={stats?.totalTenants || 0} icon={<Store className="text-blue-500" />} />
                </Col>
                {/* [备注] 后端当前未提供活跃店铺数，暂时移除该卡片，如需显示可取消注释并更新store
                <Col xs={24} sm={12} md={12} lg={6}>
                    <StatCard title="活跃店铺数" value={stats?.activeTenants || 0} icon={<ShieldCheck className="text-green-500" />} />
                </Col>
                */}
                <Col xs={24} sm={12} md={12} lg={6}>
                    <StatCard title="总用户数" value={stats?.totalUsers || 0} icon={<Users className="text-purple-500" />} />
                </Col>
                {/* [新增] 显示配方总数 */}
                <Col xs={24} sm={12} md={12} lg={6}>
                    <StatCard title="配方总数" value={stats?.totalRecipes || 0} icon={<BookCopy className="text-orange-500" />} />
                </Col>
                {/* [新增] 显示生产任务总数 */}
                <Col xs={24} sm={12} md={12} lg={6}>
                    <StatCard title="生产任务总数" value={stats?.totalTasks || 0} icon={<ClipboardList className="text-indigo-500" />} />
                </Col>
            </Row>
        </>
    );
};

export default DashboardPage;
