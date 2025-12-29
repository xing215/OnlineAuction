import { useState, useEffect } from "react";
import type { Category, CategoryTree } from "../types";
import { apiUrl } from "../config/api";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<CategoryTree[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingCategoriesTree, setIsLoadingCategoriesTree] = useState(true);

  useEffect(() => {
    // Fetch roots for flat list
    setIsLoadingCategories(true);
    fetch(apiUrl('/api/categories'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Transform _id to id for consistency and filter only active categories
          const transformedCategories = data.data
            .filter((cat: Category) => cat.is_active === true)
            .map((cat: Category) => ({
              ...cat,
              id: cat._id
            }));
          setCategories([{ id: 'all', name: 'Tất cả', is_active: true, createdAt: new Date(), updatedAt: new Date() }, ...transformedCategories]);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err))
      .finally(() => setIsLoadingCategories(false));

    // Fetch tree for nested structure
    setIsLoadingCategoriesTree(true);
    fetch(apiUrl('/api/categories/tree'))
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategoriesTree(data.data);
        }
      })
      .catch(err => console.error("Lỗi lấy cây danh mục:", err))
      .finally(() => setIsLoadingCategoriesTree(false));
  }, []);

  return { categories, categoriesTree, isLoadingCategories, isLoadingCategoriesTree };
};