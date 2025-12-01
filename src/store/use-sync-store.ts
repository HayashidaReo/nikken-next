import { create } from "zustand";

interface ConflictData {
    collection: string;
    id: string;
    localData: unknown;
    cloudData: unknown;
}

interface SyncState {
    isEditing: boolean;
    setEditing: (isEditing: boolean) => void;
    conflict: ConflictData | null;
    setConflict: (conflict: ConflictData | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    isEditing: false,
    setEditing: (isEditing) => set({ isEditing }),
    conflict: null,
    setConflict: (conflict) => set({ conflict }),
}));
