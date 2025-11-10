import { render, screen } from "@testing-library/react";
import { PenaltyDisplay } from "./penalty-display";

describe("PenaltyDisplay", () => {
    describe("with no penalties", () => {
        it("renders a hyphen when hansokuCount is 0", () => {
            render(<PenaltyDisplay hansokuCount={0} />);
            expect(screen.getByText("-")).toBeInTheDocument();
        });

        it("applies text-gray-400 class to the hyphen", () => {
            const hyphen = screen.getByText("-");
            expect(hyphen).toHaveClass("text-gray-400");
        });

        it("centers the hyphen vertically", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={0} />);
            const wrapper = container.querySelector(".h-6.flex.items-center.justify-center");
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe("with yellow card", () => {
        it("renders one yellow card for hansokuCount 1", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={1} />);
            const yellowCards = container.querySelectorAll(".bg-yellow-400");
            expect(yellowCards).toHaveLength(1);
        });

        it("renders yellow card with compact size by default", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={1} />);
            const card = container.querySelector(".bg-yellow-400");
            expect(card).toHaveClass("w-3", "h-4");
        });

        it("renders yellow card with normal size when variant is normal", () => {
            const { container } = render(
                <PenaltyDisplay hansokuCount={1} variant="normal" />
            );
            const card = container.querySelector(".bg-yellow-400");
            expect(card).toHaveClass("w-16", "h-24");
        });
    });

    describe("with red cards", () => {
        it("renders one red card for hansokuCount 2", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={2} />);
            const redCards = container.querySelectorAll(".bg-red-600");
            expect(redCards).toHaveLength(1);
        });

        it("renders red and yellow for hansokuCount 3 (red + yellow)", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={3} />);
            const redCards = container.querySelectorAll(".bg-red-600");
            const yellowCards = container.querySelectorAll(".bg-yellow-400");
            expect(redCards).toHaveLength(1);
            expect(yellowCards).toHaveLength(1);
        });

        it("renders two red cards for hansokuCount 4 (red + red)", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={4} />);
            const redCards = container.querySelectorAll(".bg-red-600");
            expect(redCards).toHaveLength(2);
        });
    });

    describe("styling", () => {
        it("applies custom className", () => {
            const { container } = render(
                <PenaltyDisplay hansokuCount={0} className="custom-class" />
            );
            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass("custom-class");
        });

        it("renders cards with border and shadow", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={1} />);
            const card = container.querySelector(".bg-yellow-400");
            expect(card).toHaveClass("border", "border-white", "shadow-sm");
        });
    });

    describe("layout", () => {
        it("centers cards horizontally and vertically", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={1} />);
            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
        });

        it("uses flex gap for spacing between cards", () => {
            const { container } = render(<PenaltyDisplay hansokuCount={3} />);
            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass("gap-1");
        });
    });
});
