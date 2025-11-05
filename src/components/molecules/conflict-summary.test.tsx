import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConflictSummary } from "@/components/molecules/conflict-summary";

describe("ConflictSummary", () => {
    it("renders nothing when count is 0", () => {
        const { container } = render(<ConflictSummary count={0} onOpenUpdateDialog={() => { }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("shows count and calls handler when button clicked", async () => {
        const user = userEvent.setup();
        const handle = jest.fn();
        render(<ConflictSummary count={2} onOpenUpdateDialog={handle} />);

        expect(screen.getByText(/他端末で 2 件の変更があります/)).toBeInTheDocument();

        const button = screen.getByRole("button", { name: /確認する/ });
        await user.click(button);
        expect(handle).toHaveBeenCalledTimes(1);
    });
});
