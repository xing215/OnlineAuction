import React from 'react';
import { 
  ChevronDown, ChevronRight, Folder, FolderOpen, Plus, 
  Laptop, Smartphone, Watch, Shirt, Car, Armchair, Monitor
} from 'lucide-react';
import type { CategoryTreeNode } from '../../types';

const getIcon = (iconName?: string, isActive?: boolean) => {
  const props = { size: 18, className: isActive ? "text-[#D9A52A]" : "text-gray-400" };
  
  switch (iconName) {
    case 'laptop': return <Laptop {...props} />;
    case 'phone': return <Smartphone {...props} />;
    case 'watch': return <Watch {...props} />;
    case 'fashion': return <Shirt {...props} />;
    case 'car': return <Car {...props} />;
    case 'furniture': return <Armchair {...props} />;
    case 'monitor': return <Monitor {...props} />;
    default: return isActive ? <FolderOpen {...props} /> : <Folder {...props} />;
  }
};

interface TreeItemProps {
  node: CategoryTreeNode;
  level: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (node: CategoryTreeNode) => void;
}

const CategoryTreeItem: React.FC<TreeItemProps> = ({ 
  node, level, expandedIds, selectedId, onToggle, onSelect 
}) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        className={`
          group flex items-center py-3 px-3 cursor-pointer transition-all border-b border-transparent
          ${isSelected ? 'bg-[#FFF8E1] border-[#FFE082]' : 'hover:bg-gray-50'}
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }} // Thụt lề rộng hơn
        onClick={() => onSelect(node)}
      >
        {/* Nút mũi tên mở rộng */}
        <div 
          className="mr-2 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>

        {/* Hiển thị Icon dựa theo trường node.icon */}
        <div className="mr-3">
           {getIcon(node.icon, isSelected)}
        </div>

        {/* Tên danh mục */}
        <span className={`flex-1 text-sm font-medium select-none truncate ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
          {node.name}
        </span>
        
        {/* Badge số lượng sản phẩm (Style giống ảnh) */}
        <div className="flex items-center gap-2">
            {/* Chỉ hiện nếu có số lượng > 0 */}
            {(node.product_count !== undefined && node.product_count > 0) && (
                <span className="px-2 py-0.5 bg-[#FFF8E1] text-[#B78103] text-[10px] font-bold rounded-full border border-[#FFE082]">
                    {node.product_count} SP
                </span>
            )}
            
            {/* Số lượng danh mục con (số nhỏ màu xám) */}
            {hasChildren && (
                <span className="text-xs text-gray-400 w-4 text-center">
                    {node.children.length}
                </span>
            )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
    treeData: CategoryTreeNode[];
    selectedId: string | null;
    expandedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelect: (node: CategoryTreeNode) => void;
    onAddRoot: () => void;
  }
  
  const CategorySidebar: React.FC<SidebarProps> = ({
    treeData, selectedId, expandedIds, onToggle, onSelect, onAddRoot
  }) => {
    return (
      <div className="w-full lg:w-[380px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-100px)]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-lg">Cây danh mục</h2>
        </div>
  
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {treeData.map((node) => (
            <CategoryTreeItem
              key={node.id}
              node={node}
              level={0}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
  
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onAddRoot}
            className="w-full flex items-center justify-center gap-2 bg-[#D9A52A] hover:bg-[#b88b22] text-white py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Thêm danh mục cha
          </button>
        </div>
      </div>
    );
  };
  
  export default CategorySidebar;