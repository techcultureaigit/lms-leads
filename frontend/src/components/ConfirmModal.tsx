"use client";

import React, { useEffect } from "react";
import { FaTimes, FaExclamationTriangle, FaTrash, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconConfig = () => {
    switch (type) {
      case "danger":
        return {
          icon: FaTrash,
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          titleColor: "text-red-700",
        };
      case "warning":
        return {
          icon: FaExclamationTriangle,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-700",
        };
      case "info":
        return {
          icon: FaInfoCircle,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          titleColor: "text-blue-700",
        };
      default:
        return {
          icon: FaExclamationCircle,
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          titleColor: "text-gray-700",
        };
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50";
      case "warning":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/50";
      case "info":
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg shadow-gray-500/50";
    }
  };

  const iconConfig = getIconConfig();
  const IconComponent = iconConfig.icon;

  return (
    <>
      {/* Overlay with backdrop blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${iconConfig.iconBg} flex items-center justify-center shadow-md`}>
                <IconComponent className={`w-6 h-6 ${iconConfig.iconColor}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${iconConfig.titleColor}`}>{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Please confirm your action</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:rotate-90 duration-200"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-base leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50/50">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold text-gray-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-5 py-3 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${getConfirmButtonColor()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ConfirmModal;