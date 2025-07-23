/**
 * 文件路径: src/hooks/useDebounce.ts
 * 文件描述: [新增] 一个自定义 React Hook，用于实现值的防抖。
 */
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // 设置一个定时器，在指定的延迟后更新防抖后的值
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // 在下一次 effect 运行前或组件卸载时，清除上一个定时器
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // 仅在 value 或 delay 变化时重新设置定时器

    return debouncedValue;
}
