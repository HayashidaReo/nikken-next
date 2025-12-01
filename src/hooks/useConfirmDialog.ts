import { useState, useCallback } from "react";

interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "default" | "destructive";
    action: () => Promise<void>;
}

interface OpenDialogOptions {
    title: string;
    message: string;
    variant?: "default" | "destructive";
    action: () => Promise<void>;
}

export function useConfirmDialog() {
    const [state, setState] = useState<ConfirmDialogState>({
        isOpen: false,
        title: "",
        message: "",
        variant: "default",
        action: async () => { },
    });

    const openDialog = useCallback(({ title, message, variant = "default", action }: OpenDialogOptions) => {
        const wrappedAction = async () => {
            try {
                await action();
            } finally {
                setState((prev) => ({ ...prev, isOpen: false }));
            }
        };

        setState({
            isOpen: true,
            title,
            message,
            variant,
            action: wrappedAction,
        });
    }, []);

    const closeDialog = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return {
        isOpen: state.isOpen,
        title: state.title,
        message: state.message,
        variant: state.variant,
        action: state.action,
        openDialog,
        closeDialog,
    };
}
