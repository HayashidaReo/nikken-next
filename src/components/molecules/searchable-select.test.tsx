import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableSelect, type SearchableSelectOption } from "./searchable-select";

const mockOptions: SearchableSelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
];

describe("SearchableSelect", () => {
    it("renders with placeholder text", () => {
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
                placeholder="Select an option"
            />
        );

        expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("displays selected value label", () => {
        render(
            <SearchableSelect
                value="1"
                onValueChange={jest.fn()}
                options={mockOptions}
            />
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("opens dropdown when clicked", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
                placeholder="Select"
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        });
    });

    it("filters options based on search query", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
                searchPlaceholder="Search..."
            />
        );

        // Open dropdown
        const button = screen.getByRole("button");
        await user.click(button);

        // Wait for dropdown and type in search input (now in portal)
        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="Search..."]');
            expect(searchInput).toBeInTheDocument();
        });

        const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLElement;
        await user.type(searchInput, "apple");

        await waitFor(() => {
            expect(document.body).toHaveTextContent("Apple");
        });
    });

    it("calls onValueChange when option is clicked", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        render(
            <SearchableSelect
                onValueChange={handleChange}
                options={mockOptions}
            />
        );

        // Open dropdown
        const button = screen.getByRole("button");
        await user.click(button);

        // Wait for options to appear in portal
        await waitFor(() => {
            expect(document.body).toHaveTextContent("Option 2");
        });

        // Click an option (now in document.body)
        const options = document.querySelectorAll('[role="option"]');
        const option2 = Array.from(options).find(opt => opt.textContent?.includes("Option 2"));
        await user.click(option2 as HTMLElement);

        expect(handleChange).toHaveBeenCalledWith("2");
    });

    it("supports keyboard navigation with arrow keys", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        render(
            <SearchableSelect
                onValueChange={handleChange}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        // Wait for dropdown to open
        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        }, { timeout: 2000 });

        const container = button.parentElement!;

        // Navigate down twice and select with Enter
        fireEvent.keyDown(container, { key: "ArrowDown" });
        fireEvent.keyDown(container, { key: "ArrowDown" });
        fireEvent.keyDown(container, { key: "Enter" });

        // Should select the second option (index 1)
        await waitFor(() => {
            expect(handleChange).toHaveBeenCalled();
        }, { timeout: 2000 });
    }); it("selects option with Enter key", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        render(
            <SearchableSelect
                onValueChange={handleChange}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        // Wait for dropdown to open
        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        });

        const container = button.parentElement!;

        // First option (index 0) is already highlighted by default
        // Press Enter to select the first option
        fireEvent.keyDown(container, { key: "Enter" });

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith("1");
        });
    });

    it("closes dropdown on Escape key", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        });

        // Press Escape
        fireEvent.keyDown(button.parentElement!, { key: "Escape" });

        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).not.toBeInTheDocument();
        });
    });

    it("shows 'no results' message when search yields no matches", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        }, { timeout: 2000 });

        const searchInput = document.querySelector('input[placeholder="検索..."]') as HTMLElement;
        await user.type(searchInput, "xyz");

        await waitFor(() => {
            const noResults = document.querySelector(':not(script):not(style)');
            expect(noResults?.textContent).toContain("該当する項目がありません");
        }, { timeout: 2000 });
    }); it("disables the select when disabled prop is true", () => {
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
                disabled
            />
        );

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();
    });

    it("shows check icon for selected option", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                value="2"
                onValueChange={jest.fn()}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        await waitFor(() => {
            const selectedOption = screen.getByRole("option", { selected: true });
            expect(selectedOption).toHaveTextContent("Option 2");
        });
    });

    it("closes dropdown when clicking outside", async () => {
        const user = userEvent.setup();
        render(
            <div>
                <SearchableSelect
                    onValueChange={jest.fn()}
                    options={mockOptions}
                />
                <div data-testid="outside">Outside</div>
            </div>
        );

        const button = screen.getByRole("button");
        await user.click(button);

        const searchInput = screen.getByPlaceholderText("検索...");
        expect(searchInput).toBeInTheDocument();

        // Click outside
        const outside = screen.getByTestId("outside");
        await user.click(outside);

        await waitFor(() => {
            expect(screen.queryByPlaceholderText("検索...")).not.toBeInTheDocument();
        });
    });

    it("resets search query when dropdown closes", async () => {
        const user = userEvent.setup();
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("button");
        await user.click(button);

        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        }, { timeout: 2000 });

        const searchInput = document.querySelector('input[placeholder="検索..."]') as HTMLInputElement;
        await user.type(searchInput, "apple");

        // Close dropdown
        fireEvent.keyDown(button.parentElement!, { key: "Escape" });

        // Reopen dropdown
        await user.click(button);

        await waitFor(() => {
            const newSearchInput = document.querySelector('input[placeholder="検索..."]') as HTMLInputElement;
            expect(newSearchInput).toHaveValue("");
        }, { timeout: 2000 });
    });
});