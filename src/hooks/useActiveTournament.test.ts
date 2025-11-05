import { act, renderHook } from "@testing-library/react";
import {
  useActiveTournament,
  useActiveTournamentStore,
} from "@/store/use-active-tournament-store";

const TEST_TOURNAMENT_ID = "test-tournament-id";

describe("useActiveTournament", () => {
  // 各テストの前にlocalStorageとZustandストアの状態をクリア
  beforeEach(() => {
    localStorage.clear();
    // Zustandストアの状態をリセット
    act(() => {
      useActiveTournamentStore.getState().clearActiveTournament();
    });
  });

  describe("setActiveTournament", () => {
    it("大会IDを設定し、localStorageに保存する", () => {
      const { result } = renderHook(() => useActiveTournament());

      act(() => {
        result.current.setActiveTournament(TEST_TOURNAMENT_ID);
      });

      expect(result.current.activeTournamentId).toBe(TEST_TOURNAMENT_ID);
      const storedData = JSON.parse(
        localStorage.getItem("active-tournament-storage") || "{}"
      );
      expect(storedData.state.activeTournamentId).toBe(TEST_TOURNAMENT_ID);
    });
  });

  describe("clearActiveTournament", () => {
    it("大会IDをクリアし、localStorageから削除する", () => {
      const { result } = renderHook(() => useActiveTournament());

      // 最初にIDを設定
      act(() => {
        result.current.setActiveTournament(TEST_TOURNAMENT_ID);
      });
      expect(result.current.activeTournamentId).toBe(TEST_TOURNAMENT_ID);

      // クリアを実行
      act(() => {
        result.current.clearActiveTournament();
      });

      expect(result.current.activeTournamentId).toBeNull();
      const storedData = JSON.parse(
        localStorage.getItem("active-tournament-storage") || "{}"
      );
      expect(storedData.state.activeTournamentId).toBeNull();
    });
  });

  describe("hasTournamentSelected", () => {
    it("大会IDがある場合trueを返す", () => {
      const { result } = renderHook(() => useActiveTournament());

      act(() => {
        result.current.setActiveTournament(TEST_TOURNAMENT_ID);
      });

      expect(result.current.hasTournamentSelected).toBe(true);
    });

    it("大会IDがない場合falseを返す", () => {
      const { result } = renderHook(() => useActiveTournament());

      // 初期状態ではIDはないはず
      expect(result.current.hasTournamentSelected).toBe(false);
    });
  });

  it("初期状態でlocalStorageから値を読み込む", async () => {
    // localStorageに初期値を設定
    localStorage.setItem(
      "active-tournament-storage",
      JSON.stringify({ state: { activeTournamentId: TEST_TOURNAMENT_ID } })
    );

    // persistミドルウェアによる再水和を待つ
    await act(async () => {
      await useActiveTournamentStore.persist.rehydrate();
    });

    const { result } = renderHook(() => useActiveTournament());

    expect(result.current.activeTournamentId).toBe(TEST_TOURNAMENT_ID);
    expect(result.current.hasTournamentSelected).toBe(true);
  });
});
