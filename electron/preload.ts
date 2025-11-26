import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {
    // Add any IPC methods here if needed
});
