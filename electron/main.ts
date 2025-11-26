import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";

let mainWindow: BrowserWindow | null;
let serverProcess: ChildProcess | null;

const isDev = process.env.NODE_ENV === "development";
const PORT = 3000; // In production, you might want to find a free port dynamically

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (isDev) {
        mainWindow.loadURL(`http://localhost:${PORT}`);
        mainWindow.webContents.openDevTools();
    } else {
        // In production, we load the local server
        mainWindow.loadURL(`http://localhost:${PORT}`);
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

async function startServer() {
    if (isDev) return; // In dev, we assume the user runs `next dev` separately or via concurrently

    const serverPath = path.join(process.resourcesPath, ".next/standalone/server.js");

    // Check if server file exists (for debugging)
    if (!fs.existsSync(serverPath)) {
        console.error("Server file not found at:", serverPath);
        // Fallback for development testing of the build
        const localServerPath = path.join(__dirname, "../.next/standalone/server.js");
        if (fs.existsSync(localServerPath)) {
            console.log("Found server at local path:", localServerPath);
            serverProcess = spawn("node", [localServerPath], {
                env: { ...process.env, PORT: String(PORT), HOSTNAME: "localhost" },
                cwd: path.dirname(localServerPath)
            });
            return;
        }
        return;
    }

    serverProcess = spawn("node", [serverPath], {
        env: { ...process.env, PORT: String(PORT), HOSTNAME: "localhost" },
        cwd: path.dirname(serverPath)
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
        console.log(`Server: ${data}`);
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
        console.error(`Server Error: ${data}`);
    });
}

app.whenReady().then(async () => {
    await startServer();
    // Give the server a moment to start
    setTimeout(createWindow, 1000);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("will-quit", () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});
