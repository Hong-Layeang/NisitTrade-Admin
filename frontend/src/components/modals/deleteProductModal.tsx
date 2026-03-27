import React from "react";

// Generic — works with AdminProduct, UserProduct, or any object with id + title
interface DeleteProductModalProps {
  open: boolean;
  product: { id: number; title: string } | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({ open, product, onClose, onConfirm }) => {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-sm mx-4 p-6">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 grid place-items-center">
            <i className="bi bi-trash text-red-600 dark:text-red-400 text-xl" />
          </div>
        </div>

        <h3 className="text-center text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Delete Product
        </h3>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">"{product.title}"</span>?
          <br />This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-md bg-red-600 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;