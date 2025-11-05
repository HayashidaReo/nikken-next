import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ShareMenu } from "./share-menu";

// toastのモック
jest.mock("@/components/providers/notification-provider", () => ({
    useToast: () => ({
        showSuccess: jest.fn(),
        showError: jest.fn(),
    }),
}));

describe("ShareMenu", () => {
    const defaultProps = {
        itemName: "テストチーム",
        sharePath: "/teams/edit/team-123",
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("ボタンをクリックするとメニューが表示される", async () => {
        render(<ShareMenu {...defaultProps} />);

        const shareButton = screen.getByRole("button", { name: "共有メニュー" });
        expect(shareButton).toBeInTheDocument();

        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText("リンクをコピー")).toBeInTheDocument();
            expect(screen.getByText("新しいタブで開く")).toBeInTheDocument();
        });
    });

    it("メニュー外をクリックすると閉じる", async () => {
        render(
            <div>
                <ShareMenu {...defaultProps} />
                <div data-testid="outside">Outside</div>
            </div>
        );

        const shareButton = screen.getByRole("button", { name: "共有メニュー" });
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText("リンクをコピー")).toBeInTheDocument();
        });

        const outside = screen.getByTestId("outside");
        fireEvent.mouseDown(outside);

        await waitFor(() => {
            expect(screen.queryByText("リンクをコピー")).not.toBeInTheDocument();
        });
    });

    it('"リンクをコピー"ボタンでURLをクリップボードにコピーできる', async () => {
        const mockClipboard = jest.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockClipboard,
            },
        });

        render(<ShareMenu {...defaultProps} />);

        const shareButton = screen.getByRole("button", { name: "共有メニュー" });
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText("リンクをコピー")).toBeInTheDocument();
        });

        const copyButton = screen.getByText("リンクをコピー");
        fireEvent.click(copyButton);

        await waitFor(() => {
            expect(mockClipboard).toHaveBeenCalled();
        });
    });

    it('"新しいタブで開く"ボタンでリンク遷移できる', async () => {
        const mockWindowOpen = jest.fn();
        global.window.open = mockWindowOpen;

        render(<ShareMenu {...defaultProps} />);

        const shareButton = screen.getByRole("button", { name: "共有メニュー" });
        fireEvent.click(shareButton);

        await waitFor(() => {
            expect(screen.getByText("新しいタブで開く")).toBeInTheDocument();
        });

        const navigateButton = screen.getByText("新しいタブで開く");
        fireEvent.click(navigateButton);

        await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalledWith(
                defaultProps.sharePath,
                "_blank"
            );
        });
    });
});
