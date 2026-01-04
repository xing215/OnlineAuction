import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string | undefined;
  cancelText?: string | undefined;
  type?: 'danger' | 'warning' | 'info' | undefined;
  isLoading?: boolean | undefined;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'info',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
        <div
          className={`p-6 border-b ${
            type === 'danger'
              ? 'bg-red-50 border-red-100'
              : type === 'warning'
              ? 'bg-yellow-50 border-yellow-100'
              : 'bg-blue-50 border-blue-100'
          }`}
        >
          <h3
            className={`font-bold text-lg flex items-center gap-2 ${
              type === 'danger'
                ? 'text-red-600'
                : type === 'warning'
                ? 'text-yellow-600'
                : 'text-blue-600'
            }`}
          >
            <AlertTriangle size={20} />
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6 whitespace-pre-line">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg text-white font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
