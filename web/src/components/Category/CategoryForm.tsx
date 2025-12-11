import React, { useState, useEffect } from 'react';
import { Save, Trash2, CornerDownRight, X } from 'lucide-react';
import type { Category } from '../../types';

interface FormProps {
  mode: 'create' | 'edit';
  initialData?: Category | undefined;
  parentName?: string | undefined;
  onSubmit: (data: Partial<Category>) => void;
  onDelete?: () => void;
  onAddSubCategory?: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<FormProps> = ({
  mode, initialData, parentName, onSubmit, onDelete, onAddSubCategory, onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    is_active: true,
    icon: 'box',
    product_count: 0
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name,
        is_active: initialData.is_active,
        icon: initialData.icon || 'box',
        product_count: initialData.product_count || 0
      });
    } else {
      setFormData({ name: '', is_active: true, icon: 'box', product_count: 0 });
    }
  }, [mode, initialData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'edit' ? 'Chỉnh sửa' : 'Tạo mới'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'create' 
              ? `Đang thêm vào: ${parentName || 'Danh mục gốc'}` 
              : `ID: ${initialData?.id}`}
          </p>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-5 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
          <input
            type="text"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D9A52A] focus:border-transparent outline-none transition-all"
            placeholder="Nhập tên danh mục..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="status"
                className="text-[#D9A52A] focus:ring-[#D9A52A]"
                checked={formData.is_active} 
                onChange={() => setFormData({ ...formData, is_active: true })} 
              />
              <span className="text-sm text-gray-700">Hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="status"
                className="text-[#D9A52A] focus:ring-[#D9A52A]"
                checked={!formData.is_active} 
                onChange={() => setFormData({ ...formData, is_active: false })} 
              />
              <span className="text-sm text-gray-700">Tạm ẩn</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-100 flex gap-3">
          {mode === 'edit' && onDelete && (
            <button 
              type="button" 
              onClick={onDelete}
              className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          <div className="flex-1 flex gap-3 justify-end">
            <button type="button" onClick={onCancel} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
              Hủy
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-[#D9A52A] hover:bg-[#b88b22] text-white rounded-lg font-medium shadow-sm flex items-center gap-2"
            >
              <Save size={18} /> Lưu lại
            </button>
          </div>
        </div>
      </form>

      {/* Footer Actions (Create Sub) */}
      {mode === 'edit' && onAddSubCategory && (
        <div className="mt-6 pt-6 border-t border-gray-100">
           <button 
             type="button"
             onClick={onAddSubCategory}
             className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#D9A52A] hover:text-[#D9A52A] flex items-center justify-center gap-2 transition-all group"
           >
             <CornerDownRight size={18} className="group-hover:translate-x-1 transition-transform" /> 
             Thêm danh mục con vào đây
           </button>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;