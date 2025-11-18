/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { MatchControlPanel } from "./match-control-panel";
import { NotificationProvider } from "@/components/providers/notification-provider";

const mockStore = { isSaving: false } as { isSaving: boolean };
jest.mock("@/store/use-monitor-store", () => ({
    useMonitorStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

jest.mock("@/components/providers/notification-provider", () => ({
    ...jest.requireActual("@/components/providers/notification-provider"),
    useToast: () => ({
        showSuccess: jest.fn(),
        showError: jest.fn(),
    }),
}));

describe("MatchControlPanel", () => {
    const mockProps = {
        isPublic: false,
        onTogglePublic: jest.fn(),
        onSaveResult: jest.fn(() => Promise.resolve()),
        organizationId: "org-123",
        tournamentId: "tournament-456",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("コンポーネントがレンダリングされる（保存ボタンが表示される）", () => {
        render(
            <NotificationProvider>
                <MatchControlPanel {...mockProps} />
            </NotificationProvider>
        );

        // 保存ボタンが表示されているはず
        expect(screen.getByText("試合結果を保存")).toBeInTheDocument();
    });

    it("保存中フラグがあるとボタンが '保存中...' になる", () => {
        // simulate saving state
        mockStore.isSaving = true;

        render(
            <NotificationProvider>
                <MatchControlPanel {...mockProps} />
            </NotificationProvider>
        );

        expect(screen.getByText("保存中...")).toBeInTheDocument();
        // reset
        mockStore.isSaving = false;
    });
});
