import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const RecipeTemplatesPage: React.FC = () => {
    return (
        <div>
            <Title level={2}>配方模板</Title>
            {/* 后续将在这里实现配方模板下载、导入等功能 */}
        </div>
    );
};

export default RecipeTemplatesPage;
