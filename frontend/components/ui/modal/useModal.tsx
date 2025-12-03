"use client";
import { useState } from "react";
import { ModalProps } from "./Modal";

interface IUseModal {
    onClose?: () => void;
    initialStateIsOpen?: boolean;
}

export const useModal = ({ onClose, initialStateIsOpen = false }: IUseModal) => {
    const [isOpen, setIsOpen] = useState<boolean>(initialStateIsOpen);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const modalProps: Omit<ModalProps, "children" | "className" | "size"> = {
        isOpen: isOpen,
        onClose: onClose || (() => undefined),
    };

    return {
        ...modalProps,
        openModal,
        closeModal,
    };
};
