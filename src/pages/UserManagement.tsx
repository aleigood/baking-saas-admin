import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const UserManagementPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>用户管理</Title>
            {/* 后续将在这里实现用户列表、创建老板等功能 */}
        </div>
    );
};

export default UserManagementPage;
