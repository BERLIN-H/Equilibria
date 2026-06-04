import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Volver',
  variant = 'warning',
  loading = false,
}) => {
  const variantStyles = {
    danger:  { icon: 'bg-error/10 text-error',   button: 'bg-error text-white hover:bg-error/90' },
    warning: { icon: 'bg-yellow-100 text-yellow-700', button: 'bg-yellow-500 text-white hover:bg-yellow-600' },
    info:    { icon: 'bg-primary/10 text-primary', button: 'bg-primary text-white hover:bg-primary/90' },
  };
  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${styles.icon}`}>
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-on-surface">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <X size={20} className="text-on-surface-variant" />
                  </button>
                </div>
                <p className="text-on-surface-variant text-sm mt-2">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-60"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors disabled:opacity-60 ${styles.button}`}
              >
                {loading ? 'Procesando...' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
