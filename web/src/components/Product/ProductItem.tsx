import React from 'react';
import { Trash2, Clock, Tag, User, CheckCircle, XCircle } from 'lucide-react';
import type { Product } from '../../types';

interface ProductItemProps {
  product: Product;
  onDelete: (id: string) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onDelete }) => {
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getRelativeTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  const renderStatusBadge = () => {
    switch (product.status) {
      case 'active':
        return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><CheckCircle size={12}/> Đang bán</span>;
      case 'sold':
        return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full"><User size={12}/> Đã bán</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full"><XCircle size={12}/> Hết hạn</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-all hover:shadow-md group">
      
      {/* Ảnh */}
      <div className="shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
        <img src={product.images[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Thông tin */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{product.name}</h3>
            {/* Badge */}
            <div className="hidden sm:block">{renderStatusBadge()}</div>
        </div>
        
        <div className="mt-1 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <User size={14} className="mr-1.5" />
            <span className="truncate">Người bán: <span className="font-medium text-gray-800">{typeof product.seller === 'object' && product.seller ? product.seller.full_name : (product.seller || 'Ẩn danh')}</span></span>
          </div>

          <div className="flex items-center text-sm">
            <Tag size={14} className="mr-1.5 text-[#D9A52A]" />
            <span className="text-gray-500 mr-1">Giá:</span>
            <span className="font-bold text-[#D9A52A]">{formatCurrency(product.start_price)}</span>
          </div>

          <div className="flex items-center text-xs text-gray-400">
            <Clock size={12} className="mr-1.5" />
            <span>{getRelativeTime(product.posted_at)}</span>
            <span className="mx-2">•</span>
            <span>{product.category_name}</span>
            {/* Mobile Badge */}
            <span className="sm:hidden ml-2">{renderStatusBadge()}</span> 
          </div>
        </div>
      </div>

      {/* Nút Xóa */}
      <div className="shrink-0 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Xóa sản phẩm"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductItem;