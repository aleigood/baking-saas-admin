import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // [新增] 添加 server 配置来指定端口号
    server: {
        port: 5174, // 您可以在这里修改为您需要的任何端口，例如 5174
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
