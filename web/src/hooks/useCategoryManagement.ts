import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Category } from '../types';
import { buildTree } from '../utilities/buildTree';
import { apiUrl } from "../config/api";

export const useCategoryManagement = () => {
  // --- STATE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');
  const [parentIdForCreate, setParentIdForCreate] = useState<string | undefined>(undefined);

  // --- API ACTIONS ---
  
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl('/api/categories'));
      const json = await res.json();
      
      if (json.success) {
        const normalizedData = json.data.map((item: any) => ({
          ...item,
          id: item.id || item._id,
          parent_id: (item.parent_id && item.parent_id !== "") ? item.parent_id : null
        }));
        setCategories(normalizedData);
        const rootIds = normalizedData
          .filter((c: Category) => !c.parent_id)
          .map((c: Category) => c.id);
        setExpandedIds(new Set(rootIds));
      } else {
        alert('Lỗi tải dữ liệu: ' + json.message);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (formData: Partial<Category>) => {
    try {
      const payload = {
        ...formData,
        parent_id: parentIdForCreate || null,
      };

      const res = await fetch(apiUrl('/api/categories'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setCategories(prev => [...prev, json.data]);
        
        if (parentIdForCreate) setExpandedIds(prev => new Set(prev).add(parentIdForCreate));
        setSelectedId(json.data.id);
        setMode('edit');
      } else {
        alert('Tạo thất bại: ' + json.message);
      }
    } catch (error) {
      console.error("Lỗi tạo mới:", error);
    }
  };

  const updateCategory = async (formData: Partial<Category>) => {
    if (!selectedId) return;
    try {
      const res = await fetch(apiUrl(`/api/categories/${selectedId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        setCategories(prev => prev.map(cat => cat.id === selectedId ? json.data : cat));
        alert('Đã cập nhật!');
      } else {
        alert('Cập nhật thất bại: ' + json.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  const deleteCategory = async () => {
    if (!selectedId) return;
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;

    try {
      const res = await fetch(apiUrl(`/api/categories/${selectedId}`), {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        setCategories(prev => prev.filter(c => c.id !== selectedId));
        setSelectedId(null);
        setMode('view');
      } else {
        alert('Xóa thất bại: ' + json.message);
      }
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- DERIVED STATE ---
  const treeData = useMemo(() => buildTree(categories), [categories]);
  const selectedCategory = useMemo(() => categories.find(c => c.id === selectedId), [categories, selectedId]);
  
  // Tính tên cha để hiển thị khi tạo mới
  const parentNameForCreate = useMemo(() => {
    return parentIdForCreate ? categories.find(c => c.id === parentIdForCreate)?.name : 'Gốc';
  }, [parentIdForCreate, categories]);

  // --- UI HANDLERS ---
  const handleSelectNode = (node: Category) => {
    setSelectedId(node.id);
    setMode('edit');
  };

  const handleToggleNode = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedIds(next);
  };

  const handlePrepareCreateRoot = () => {
    setSelectedId(null);
    setParentIdForCreate(undefined);
    setMode('create');
  };

  const handlePrepareCreateSub = () => {
    if (selectedId) {
      setParentIdForCreate(selectedId);
      setMode('create');
    }
  };

  const handleCancel = () => setMode('view');

  // Trả về tất cả những gì View cần
  return {
    // Data
    treeData,
    loading,
    selectedId,
    expandedIds,
    mode,
    selectedCategory,
    parentNameForCreate,
    
    // Actions (UI Handlers)
    handleSelectNode,
    handleToggleNode,
    handlePrepareCreateRoot,
    handlePrepareCreateSub,
    handleCancel,
    
    // CRUD Operations
    createCategory,
    updateCategory,
    deleteCategory,
  };
};