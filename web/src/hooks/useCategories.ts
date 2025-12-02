import { useState, useEffect } from 'react';
import type { Category } from '../types';
import { apiUrl } from "../config/api";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/categories'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories([{ _id: 'all', name: 'Tất cả' }, ...data.data]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  return { categories };
};