import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    variant?: 'default' | 'danger';
}

export const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    children, 
    confirmText, 
    cancelText, 
    onConfirm,
    variant = 'default'
}: ModalProps) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-purple-900 border-4 border-purple-200"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-black uppercase text-purple-800 tracking-tight leading-none">
                                        {title}
                                    </h2>
                                    <button onClick={onClose} className="text-purple-400 hover:text-purple-600 transition">
                                        <X size={24} />
                                    </button>
                                </div>
                                
                                {description && (
                                    <p className="text-gray-600 mb-6 font-medium">
                                        {description}
                                    </p>
                                )}
                                
                                {children}

                                <div className="flex gap-3 justify-end mt-2">
                                    {cancelText && (
                                        <Button 
                                            variant="ghost" 
                                            onClick={onClose} 
                                            className="text-gray-500 hover:bg-gray-100 px-4 py-2"
                                            size="sm"
                                        >
                                            {cancelText}
                                        </Button>
                                    )}
                                    {confirmText && onConfirm && (
                                        <Button 
                                            variant={variant === 'danger' ? 'danger' : 'primary'}
                                            onClick={() => {
                                                onConfirm();
                                                onClose();
                                            }}
                                            size="sm"
                                        >
                                            {confirmText}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
