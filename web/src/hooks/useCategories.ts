import { useState, useEffect } from 'react';
import type { Category, CategoryTree } from '../types';
import { apiUrl } from "../config/api";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTree[]>([]);

  useEffect(() => {
    // Fetch roots for flat list
    fetch(apiUrl('/api/categories/roots'))
    fetch(apiUrl('/api/categories'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories([{ _id: 'all', name: 'Tất cả' }, ...data.data]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));

    // Fetch tree for nested structure
    fetch(apiUrl('/api/categories/tree'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategoriesTree(data.data);
        }
      })
      .catch(err => console.error("Lỗi lấy cây danh mục:", err));
  }, []);

  return { categories, categoriesTree };
};