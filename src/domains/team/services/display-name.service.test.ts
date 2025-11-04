import { DisplayNameService } from "./display-name.service";
import type { Player } from "@/types/team.schema";

describe("DisplayNameService", () => {
  test("generateDisplayNames uses lastName when unique", () => {
    const players: Player[] = [
      { playerId: "p1", lastName: "佐藤", firstName: "太郎", displayName: "" },
      { playerId: "p2", lastName: "山田", firstName: "一郎", displayName: "" },
    ];

    const result = DisplayNameService.generateDisplayNames(players.slice());
    expect(result.find(p => p.playerId === "p1")?.displayName).toBe("佐藤");
    expect(result.find(p => p.playerId === "p2")?.displayName).toBe("山田");
  });

  test("generateDisplayNames resolves conflicts by adding first name parts", () => {
    const players: Player[] = [
      { playerId: "p1", lastName: "佐藤", firstName: "太郎", displayName: "" },
      { playerId: "p2", lastName: "佐藤", firstName: "一郎", displayName: "" },
    ];

    const result = DisplayNameService.generateDisplayNames(players.slice());
    const p1 = result.find(p => p.playerId === "p1");
    const p2 = result.find(p => p.playerId === "p2");
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p1!.displayName).toMatch(/^佐藤\s?/);
    expect(p2!.displayName).toMatch(/^佐藤\s?/);
    // Ensure displayNames are not equal
    expect(p1!.displayName).not.toBe(p2!.displayName);
  });

  test("generateSingleDisplayName returns lastName when no conflict", () => {
    const player: Player = {
      playerId: "p1",
      lastName: "佐藤",
      firstName: "太郎",
      displayName: "",
    };
    const others: Player[] = [
      { playerId: "p2", lastName: "山田", firstName: "一郎", displayName: "" },
    ];
    const dn = DisplayNameService.generateSingleDisplayName(player, others);
    expect(dn).toBe("佐藤");
  });
});
