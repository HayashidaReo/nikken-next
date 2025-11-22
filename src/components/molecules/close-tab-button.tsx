"use client";

import { Button } from "@/components/atoms/button";
import { X } from "lucide-react";

export function CloseTabButton() {
    const handleClose = () => {
        window.close();
    };

    return (
        <Button
            variant="outline"
            onClick={handleClose}
            className="w-full h-12 text-base border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 gap-2"
        >
            <X className="w-4 h-4" />
            タブを閉じる
        </Button>
    );
}
