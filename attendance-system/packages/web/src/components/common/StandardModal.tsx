import React, { useEffect } from 'react';

export interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const StandardModal: React.FC<StandardModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-4xl',
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div
        className={`bg-white w-full ${width} rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="bg-primary h-[56px] px-6 flex items-center justify-between text-white shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded-full p-1 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardModal;
