/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    // 这里可以添加更多你在 .env 文件中定义的环境变量
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
