import type { Category, CategoryTreeNode } from '../types';

export const buildTree = (categories: Category[]): CategoryTreeNode[] => {
  const map: Record<string, CategoryTreeNode> = {};
  const roots: CategoryTreeNode[] = [];

  // 1. Tạo Map để tra cứu nhanh
  categories.forEach((cat) => {
    // Ép kiểu sang TreeNode và thêm mảng children rỗng
    map[cat.id] = { ...cat, children: [] };
  });

  // 2. Xếp cha con
  categories.forEach((cat) => {
    // Nếu có parent_id và parent đó có trong danh sách
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.id]);
    } else {
      // Nếu không có cha (hoặc cha không tồn tại), nó là Root
      roots.push(map[cat.id]);
    }
  });

  return roots;
};