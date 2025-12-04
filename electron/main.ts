import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import { fork, ChildProcess } from "child_process";
import fs from "fs";
import { autoUpdater } from "electron-updater";
import net from "net";

let mainWindow: BrowserWindow | null;
let serverProcess: ChildProcess | null;

const isDev = process.env.NODE_ENV === "development";

function findFreePort(startPort: number): Promise<number> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.on("error", () => {
            resolve(findFreePort(startPort + 1));
        });
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
}

import log from "electron-log";

// --- Auto Updater Configuration ---
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Configure logging
autoUpdater.logger = log;
log.transports.file.level = "info";

function setupAutoUpdater() {
    if (isDev) {
        console.log("Skipping auto-updater in development mode");
        return;
    }

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("checking-for-update", () => {
        log.info("Checking for updates...");
    });

    autoUpdater.on("update-available", (info) => {
        log.info("Update available:", info);
    });

    autoUpdater.on("update-not-available", (info) => {
        log.info("Update not available:", info);
    });

    autoUpdater.on("update-downloaded", (info) => {
        log.info("Update downloaded:", info);
        dialog.showMessageBox({
            type: "info",
            title: "アップデートあり",
            message: "新しいバージョンがダウンロードされました。再起動して適用しますか？",
            buttons: ["はい", "後で"],
        }).then((result) => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on("error", (err) => {
        log.error("Auto-updater error:", err);
    });
}

function createWindow(port: number) {
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
        mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    } else {
        // In production, we load the local server
        mainWindow.loadURL(`http://localhost:${port}`);
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

async function checkServerReady(url: string, timeout = 10000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const res = await fetch(url);
            if (res.ok) return true;
        } catch {
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return false;
}

async function startServer(port: number) {
    if (isDev) return;

    // Use app_standalone directory in Resources
    const serverPath = path.join(process.resourcesPath, "app_standalone", "server.js");
    log.info("Starting server from:", serverPath);

    if (!fs.existsSync(serverPath)) {
        const msg = `Server file not found at: ${serverPath}`;
        log.error(msg);
        dialog.showErrorBox("Error", msg);
        return;
    }

    // Debug: Check if node_modules exists (only in dev or if explicitly enabled)
    if (isDev) {
        const standaloneDir = path.dirname(serverPath);
        const nodeModulesPath = path.join(standaloneDir, "node_modules");
        if (fs.existsSync(nodeModulesPath)) {
            log.info("node_modules found in standalone directory");
        } else {
            log.error("node_modules NOT found in standalone directory!");
        }
    }

    serverProcess = fork(serverPath, [], {
        env: { ...process.env, PORT: String(port), HOSTNAME: "localhost" },
        cwd: path.dirname(serverPath),
        silent: true,
    });

    serverProcess.stdout?.on("data", (data: Buffer) => {
        const msg = data.toString();
        if (isDev || msg.toLowerCase().includes("error")) {
            log.info(`Server: ${msg}`);
        }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
        log.error(`Server Error: ${data}`);
    });

    serverProcess.on("error", (err) => {
        log.error("Failed to start server process:", err);
        dialog.showErrorBox("Server Error", `Failed to start server: ${err.message}`);
    });

    serverProcess.on("exit", (code, signal) => {
        if (code !== 0 && code !== null) {
            log.error(`Server process exited with code ${code} and signal ${signal}`);
        }
    });
}

app.whenReady().then(async () => {
    // Development mode uses hardcoded 3000 (Next.js default)
    // Production mode finds a free port starting from 3010
    const port = isDev ? 3000 : await findFreePort(3010);

    await startServer(port);

    const serverUrl = `http://localhost:${port}`;
    const isReady = isDev ? true : await checkServerReady(serverUrl);

    if (!isReady) {
        log.error("Server failed to start within timeout");
        dialog.showErrorBox("Error", "Failed to connect to the application server.");
        return;
    }

    createWindow(port);

    // Setup Auto Updater
    setupAutoUpdater();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(port);
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
