import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="delete-confirm-card"
        className="bg-white max-w-md w-full p-6 border border-neutral-200 shadow-2xl rounded-none relative"
      >
        <button
          id="delete-confirm-close-btn"
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-red-50 text-red-600 rounded-none shrink-0 border border-red-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 id="delete-modal-title" className="text-lg font-serif tracking-wide text-neutral-900 font-medium">
              {title}
            </h3>
            <p id="delete-modal-msg" className="text-sm text-neutral-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            id="delete-cancel-btn"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            id="delete-confirm-btn"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
