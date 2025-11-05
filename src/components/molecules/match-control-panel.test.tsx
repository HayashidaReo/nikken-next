/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { MatchControlPanel } from "./match-control-panel";
import { NotificationProvider } from "@/components/providers/notification-provider";

jest.mock("@/store/use-monitor-store", () => ({
    useMonitorStore: () => ({
        isSaving: false,
    }),
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

    it("コンポーネントがレンダリングされる", () => {
        render(
            <NotificationProvider>
                <MatchControlPanel {...mockProps} />
            </NotificationProvider>
        );

        // Cardコンポーネントがレンダリングされているはず
        expect(screen.queryByRole("switch")).toBeInTheDocument();
    });

    it("非公開状態が表示される", () => {
        render(
            <NotificationProvider>
                <MatchControlPanel {...mockProps} isPublic={false} />
            </NotificationProvider>
        );

        expect(screen.getByText("非公開")).toBeInTheDocument();
    });

    it("公開状態が表示される", () => {
        render(
            <NotificationProvider>
                <MatchControlPanel {...mockProps} isPublic={true} />
            </NotificationProvider>
        );

        expect(screen.getByText("公開中")).toBeInTheDocument();
    });
});
