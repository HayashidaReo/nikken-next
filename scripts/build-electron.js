const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextDir = path.join(rootDir, ".next");
const standaloneDir = path.join(nextDir, "standalone");

console.log("Building Next.js app...");
execSync("npm run build", { stdio: "inherit", cwd: rootDir });

console.log("Copying public folder...");
const publicDir = path.join(rootDir, "public");
const destPublicDir = path.join(standaloneDir, "public");
if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, destPublicDir, { recursive: true });
}

console.log("Copying static folder...");
const staticDir = path.join(nextDir, "static");
const destStaticDir = path.join(standaloneDir, ".next", "static");
// Ensure .next directory exists in standalone
if (!fs.existsSync(path.join(standaloneDir, ".next"))) {
    fs.mkdirSync(path.join(standaloneDir, ".next"));
}
if (fs.existsSync(staticDir)) {
    fs.cpSync(staticDir, destStaticDir, { recursive: true });
}

console.log("Compiling Electron main process...");
execSync("npx tsc electron/main.ts --outDir dist --esModuleInterop --skipLibCheck", { stdio: "inherit", cwd: rootDir });
execSync("npx tsc electron/preload.ts --outDir dist --esModuleInterop --skipLibCheck", { stdio: "inherit", cwd: rootDir });

// Workaround for electron-builder excluding node_modules in extraResources
// We copy node_modules to a different name so electron-builder doesn't ignore it
console.log("Preparing standalone node_modules for packaging...");
const standaloneNodeModules = path.join(standaloneDir, "node_modules");
const standaloneModules = path.join(standaloneDir, "standalone_modules");

if (fs.existsSync(standaloneNodeModules)) {
    if (fs.existsSync(standaloneModules)) {
        fs.rmSync(standaloneModules, { recursive: true, force: true });
    }
    // Use cpSync for recursive copy (Node 16.7+)
    fs.cpSync(standaloneNodeModules, standaloneModules, { recursive: true });
    console.log("Copied .next/standalone/node_modules to standalone_modules");
}

console.log("Electron build preparation complete.");
