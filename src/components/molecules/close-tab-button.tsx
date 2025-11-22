"use client";

import { Button } from "@/components/atoms/button";
import { X } from "lucide-react";
import { useToast } from "@/components/providers/notification-provider";

export function CloseTabButton() {
    const { showInfo } = useToast();

    const handleClose = () => {
        // window.close(); はJavaScriptで開かれたウィンドウにしか機能しないため、無理な場合は手動で閉じるよう促す
        if (window.opener) {
            window.close();
        } else {
            showInfo("このタブは自動的に閉じることができません。手動でタブを閉じてください。");
        }
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
