import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { useMonitorKeyboardShortcuts } from "./useMonitorKeyboardShortcuts";
import { useMonitorStore } from "@/store/use-monitor-store";

function TestHarness() {
  useMonitorKeyboardShortcuts();
  return null;
}

describe("useKeyboardShortcuts", () => {
  afterEach(() => {
    cleanup();
    // reset store to defaults
    useMonitorStore.setState({
      selectedPlayer: null,
      playerA: { displayName: "A", teamName: "TeamA", score: 0, hansoku: 0 },
      playerB: { displayName: "B", teamName: "TeamB", score: 0, hansoku: 0 },
      isTimerRunning: false,
    });
  });

  test("single 'a' toggles selection and pressing again deselects", async () => {
    render(<TestHarness />);
    // allow useEffect to run and attach event listeners
    await new Promise((r) => setTimeout(r, 0));

    // initially no selection
    expect(useMonitorStore.getState().selectedPlayer).toBeNull();

    fireEvent.keyDown(window, { key: "a" });
    expect(useMonitorStore.getState().selectedPlayer).toBe("playerA");

    // press 'a' again to deselect
    fireEvent.keyDown(window, { key: "a" });
    expect(useMonitorStore.getState().selectedPlayer).toBeNull();
  });

  test("double 's' increments score for selected player", async () => {
    render(<TestHarness />);
    await new Promise((r) => setTimeout(r, 0));

    // select player A
    fireEvent.keyDown(window, { key: "a" });
    expect(useMonitorStore.getState().selectedPlayer).toBe("playerA");

    // double tap 's'
    fireEvent.keyDown(window, { key: "s" });
    fireEvent.keyDown(window, { key: "s" });

    expect(useMonitorStore.getState().playerA.score).toBe(1);
  });

  test("double space toggles timer", async () => {
    render(<TestHarness />);
    await new Promise((r) => setTimeout(r, 0));

    expect(useMonitorStore.getState().isTimerRunning).toBe(false);

    fireEvent.keyDown(window, { key: " " });
    fireEvent.keyDown(window, { key: " " });

    expect(useMonitorStore.getState().isTimerRunning).toBe(true);
  });

  test("double 'z' increments hansoku for selected player", async () => {
    render(<TestHarness />);
    await new Promise((r) => setTimeout(r, 0));

    // select player B
    fireEvent.keyDown(window, { key: "b" });
    expect(useMonitorStore.getState().selectedPlayer).toBe("playerB");

    fireEvent.keyDown(window, { key: "z" });
    fireEvent.keyDown(window, { key: "z" });

    expect(useMonitorStore.getState().playerB.hansoku).toBe(1);
  });
});
