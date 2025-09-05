"use client";

type CustomPopupProps = {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function CustomPopup({
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}: CustomPopupProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-100">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-2">{message}</p>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              className="px-4 py-2 bg-[#002D62] text-white rounded-lg hover:bg-blue-700"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
