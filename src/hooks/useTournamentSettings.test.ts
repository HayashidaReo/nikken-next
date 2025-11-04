import { renderHook } from "@testing-library/react";
import { useTournamentSettings } from "./useTournamentSettings";

// 必要なモックを設定
jest.mock("@/components/providers/notification-provider", () => ({
  useToast: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
    showWarning: jest.fn(),
  }),
}));

jest.mock("./useAuth", () => ({
  useAuth: () => ({
    user: { uid: "test-user" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

jest.mock("./useActiveTournament", () => ({
  useActiveTournament: () => ({
    activeTournamentId: null,
    setActiveTournament: jest.fn(),
    clearActiveTournament: jest.fn(),
    hasTournamentSelected: false,
    isLoading: false,
  }),
}));

jest.mock("../queries/use-tournaments", () => ({
  useTournamentsByOrganization: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateTournament: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useUpdateTournamentByOrganization: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));



describe("useTournamentSettings", () => {
  it("フックが正常に初期化される", () => {
    const { result } = renderHook(() => useTournamentSettings());

    expect(result.current).toBeDefined();
    expect(typeof result.current.handleSelectTournament).toBe("function");
    expect(result.current.tournaments).toBeDefined();
    expect(result.current.isLoading).toBeDefined();
  });
});
