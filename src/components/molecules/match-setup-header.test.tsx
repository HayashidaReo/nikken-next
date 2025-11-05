import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchSetupHeader } from "@/components/molecules/match-setup-header";

describe("MatchSetupHeader", () => {
    it("renders title and opens update dialog when clicked", async () => {
        const user = userEvent.setup();
        const handle = jest.fn();
        render(<MatchSetupHeader title="テストヘッダー" detectedCount={3} onOpenUpdateDialog={handle} />);

        expect(screen.getByText("テストヘッダー")).toBeInTheDocument();
        expect(screen.getByText(/他端末で 3 件の変更があります/)).toBeInTheDocument();

        const btn = screen.getByRole("button", { name: /確認する/ });
        await user.click(btn);
        expect(handle).toHaveBeenCalledTimes(1);
    });
});
