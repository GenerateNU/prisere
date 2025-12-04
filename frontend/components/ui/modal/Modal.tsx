import React from "react";
import { XIcon } from "lucide-react";

// Type definitions
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
}

export const Modal = ({ isOpen, onClose, size = "md", children, className = "" }: ModalProps) => {
    if (!isOpen) return null;

    // Size styles
    const sizeStyles: Record<ModalSize, string> = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
    };

    return (
        <>
            <div
                className="fixed top-0 left-0 w-full h-full bg-black opacity-25 z-40"
                onClick={() => {
                    console.log("HERE:");
                    onClose();
                }}
            />
            <div className="fixed top-0 left-0 flex justify-center items-center z-50 w-screen h-screen pointer-events-none">
                <div
                    className={`relative p-6 bg-white rounded-2xl flex flex-col w-full pointer-events-auto ${sizeStyles[size]} ${className}`}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close modal"
                    >
                        <XIcon size={20} />
                    </button>
                    {children}
                </div>
            </div>
        </>
    );
};
