export class TimerController {
    private worker: Worker | null = null;
    private onTick: (() => void) | null = null;

    private init() {
        if (typeof window !== "undefined" && typeof Worker !== "undefined" && !this.worker) {
            const workerScript = "/timer-worker.js";
            this.worker = new Worker(workerScript);
            this.worker.onmessage = (e) => {
                if (e.data.type === "tick") {
                    if (this.onTick) this.onTick();
                }
            };
        }
    }

    setTickHandler(handler: () => void) {
        this.onTick = handler;
        this.init();
    }

    start() {
        this.init();
        this.worker?.postMessage({ command: "start" });
    }

    stop() {
        this.worker?.postMessage({ command: "stop" });
    }
}

export const timerController = new TimerController();
