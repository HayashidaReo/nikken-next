"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    imageAlt: string;
}

export function ImageModal({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) {
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

    return (
        <AnimatePresence>
            {isOpen && imageSrc && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
                        className="relative max-w-5xl w-full max-h-[90vh] aspect-[2704/1696] rounded-xl overflow-hidden bg-black shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            className="object-contain"
                            priority
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
