self.onmessage = function (e) {
    const { command, interval = 1000 } = e.data;

    if (command === 'start') {
        if (self.intervalId) clearInterval(self.intervalId);
        self.intervalId = setInterval(() => {
            self.postMessage({ type: 'tick' });
        }, interval);
    } else if (command === 'stop') {
        if (self.intervalId) clearInterval(self.intervalId);
        self.intervalId = null;
    }
};
