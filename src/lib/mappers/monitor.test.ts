import { toMatchPlayerForMonitor } from "@/lib/mappers/monitor";
import type { MonitorPlayer } from "@/types/monitor.schema";

describe("toMatchPlayerForMonitor", () => {
    it("MonitorPlayer のフィールドをマッピングし、playerId と teamId を空文字で埋める", () => {
        const monitor: MonitorPlayer = {
            displayName: "Taro",
            teamName: "Team A",
            score: 1,
            hansoku: 0,
        };

        const mapped = toMatchPlayerForMonitor(monitor);

        expect(mapped.displayName).toBe("Taro");
        expect(mapped.teamName).toBe("Team A");
        expect(mapped.score).toBe(1);
        expect(mapped.hansoku).toBe(0);
        expect(mapped.playerId).toBe("");
        expect(mapped.teamId).toBe("");
    });
});
