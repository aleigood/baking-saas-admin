import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path"; // [新增] 导入 path 模块

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // [新增] 添加 resolve.alias 配置
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
