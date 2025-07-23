/**
 * 文件路径: src/hooks/usePaginatedTable.ts
 * 文件描述: [新增] 可复用的自定义Hook，用于处理表格的分页、排序和搜索逻辑。
 */
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
// [修改] 导入 TableProps 以正确键入 onChange 事件处理器
import type { TableProps } from "antd";

// 定义 fetch 函数的类型签名
type FetchFunction = (params: { page: number; pageSize: number; search?: string; sortBy?: string }) => Promise<void>;

// 定义 Hook 返回值的类型
interface UsePaginatedTableReturn<T> {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    tableProps: {
        loading: boolean;
        pagination: {
            current: number;
            pageSize: number;
            total: number;
        };
        // [修改] 明确使用泛型 T 来约束 onChange 的类型
        onChange: TableProps<T>["onChange"];
    };
}

/**
 * 一个可复用的自定义Hook，用于管理表格的分页、排序和搜索状态。
 * @param fetchFunction 从 Zustand store 传入的用于获取数据的函数。
 * @param loading 从 store 中获取的加载状态。
 * @param total 从 store 中获取的总记录数。
 * @returns 返回可以直接传递给 Ant Design Table 的 props 和搜索相关的状态。
 */
export function usePaginatedTable<T extends object>(fetchFunction: FetchFunction, loading: boolean, total: number): UsePaginatedTableReturn<T> { // [修改] 约束 T 必须是一个对象
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [sorter, setSorter] = useState<{ field?: string; order?: "ascend" | "descend" }>({});

    useEffect(() => {
        const sortBy = sorter.field && sorter.order ? `${sorter.field}:${sorter.order === "ascend" ? "asc" : "desc"}` : undefined;
        fetchFunction({
            page: pagination.current,
            pageSize: pagination.pageSize,
            search: debouncedSearchTerm,
            sortBy,
        });
    }, [fetchFunction, debouncedSearchTerm, pagination, sorter]);

    // [修改] 明确 handleTableChange 的类型，使用泛型 T
    const handleTableChange: TableProps<T>["onChange"] = (pagination, _filters, sorter) => {
        setPagination({
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
        });

        if (!Array.isArray(sorter)) {
            setSorter({
                field: sorter.field as string,
                order: sorter.order || undefined,
            });
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        tableProps: {
            loading,
            pagination: {
                ...pagination,
                total,
            },
            onChange: handleTableChange,
        },
    };
}
