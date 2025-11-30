import { useState, useEffect } from 'react';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Thêm mục "Tất cả" có _id là 'all'
          setCategories([{ _id: 'all', name: 'Tất cả' }, ...data.data]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  return { categories };
};