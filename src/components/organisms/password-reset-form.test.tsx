/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PasswordResetForm } from "./password-reset-form";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { AuthService } from "@/lib/auth/service";
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();

jest.mock("@/lib/auth/service", () => ({
    AuthService: {
        sendPasswordResetEmail: jest.fn(),
    },
}));

jest.mock("@/components/providers/notification-provider", () => ({
    ...jest.requireActual("@/components/providers/notification-provider"),
    useToast: () => ({
        showSuccess: mockShowSuccess,
        showError: mockShowError,
    }),
}));

describe("PasswordResetForm", () => {
    // Import mocked AuthService

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("送信成功時に完了画面を表示する", async () => {
        mockAuthService.sendPasswordResetEmail.mockResolvedValueOnce(undefined);

        render(
            <NotificationProvider>
                <PasswordResetForm />
            </NotificationProvider>
        );

        const input = screen.getByLabelText(/メールアドレス/);
        fireEvent.change(input, { target: { value: "user@example.com" } });

        const button = screen.getByRole("button", { name: /再設定メールを送信/i });
        fireEvent.click(button);

        // 送信完了タイトルが表示されること
        expect(await screen.findByText("送信完了")).toBeInTheDocument();
        expect(screen.getByText("user@example.com")).toBeInTheDocument();
    });

    it("送信エラー時にエラートーストを呼び出す", async () => {
        mockAuthService.sendPasswordResetEmail.mockRejectedValueOnce(new Error("ネットワークエラー"));


        render(
            <NotificationProvider>
                <PasswordResetForm />
            </NotificationProvider>
        );

        const input = screen.getByLabelText(/メールアドレス/);
        fireEvent.change(input, { target: { value: "user@example.com" } });

        const button = screen.getByRole("button", { name: /再設定メールを送信/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockShowError).toHaveBeenCalled();
        });
    });
});
