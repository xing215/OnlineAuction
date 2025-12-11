// features/categories/components/EmptyState.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ChevronRight size={32} className="text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-medium">
        Chọn một danh mục để chỉnh sửa
      </p>
    </div>
  );
};

export default EmptyState;