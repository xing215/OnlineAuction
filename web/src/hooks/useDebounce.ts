import { useState, useEffect } from 'react';

// T: Kiểu dữ liệu (có thể là string, number...)
export const useDebounce = <T>(value: T, delay: number): T => {
  // 1. Lưu trữ giá trị "đã được trì hoãn"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 2. Tạo bộ đếm ngược (Timer)
    const handler = setTimeout(() => {
      setDebouncedValue(value); // Sau khi hết giờ thì mới cập nhật
    }, delay);

    // 3. Dọn dẹp (Cleanup): Nếu 'value' thay đổi trước khi hết giờ
    // thì hủy bỏ Timer cũ đi để tạo Timer mới.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chạy lại mỗi khi value thay đổi

  return debouncedValue;
};