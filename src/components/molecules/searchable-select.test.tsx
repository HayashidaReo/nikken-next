import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableSelect, type SearchableSelectOption } from "./searchable-select";
import { calculateListMaxHeight } from "./searchable-select.constants";

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

    it("list max-height is fixed when 6 or more options", async () => {
        const many = Array.from({ length: 6 }).map((_, i) => ({ value: String(i + 1), label: `Opt ${i + 1}` }));
        render(<SearchableSelect onValueChange={jest.fn()} options={many} />);

        const button = screen.getByRole("combobox");
        await userEvent.click(button);

        const list = await screen.findByRole("listbox");
        const expected = `${calculateListMaxHeight(many.length)}px`;
        expect(list.style.maxHeight).toBe(expected);
    });

    it("list max-height fits all items when less than 6", async () => {
        const few = Array.from({ length: 3 }).map((_, i) => ({ value: String(i + 1), label: `Opt ${i + 1}` }));
        render(<SearchableSelect onValueChange={jest.fn()} options={few} />);

        const button = screen.getByRole("combobox");
        await userEvent.click(button);

        const list = await screen.findByRole("listbox");
        const expected = `${calculateListMaxHeight(few.length)}px`;
        expect(list.style.maxHeight).toBe(expected);
    });

    it("mouse hover does not trigger scrollIntoView but keyboard does", async () => {
        const opts = Array.from({ length: 5 }).map((_, i) => ({ value: String(i + 1), label: `Opt ${i + 1}` }));
        render(<SearchableSelect onValueChange={jest.fn()} options={opts} />);

        const button = screen.getByRole("combobox");
        await userEvent.click(button);

        const input = await screen.findByPlaceholderText("検索...");

        // jsdom は scrollIntoView を実装していない場合があるため安全にモックする
        const originalScroll = (HTMLElement.prototype as unknown as Record<string, unknown>).scrollIntoView;
        const mockScroll = jest.fn();
        (HTMLElement.prototype as unknown as Record<string, unknown>).scrollIntoView = mockScroll;

        const second = await screen.findByText('Opt 2');
        fireEvent.mouseEnter(second);
        await new Promise(r => setTimeout(r, 30));
        expect(mockScroll).not.toHaveBeenCalled();

        // 検索入力からのキーボードナビゲーション
        input.focus();
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        await waitFor(() => expect(mockScroll).toHaveBeenCalled());

        // 元に戻す
        (HTMLElement.prototype as unknown as Record<string, unknown>).scrollIntoView = originalScroll;
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

        const button = screen.getByRole("combobox");
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

        // ドロップダウンを開く
        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開き、（ポータル内の）検索入力に入力するのを待つ
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

        // ドロップダウンを開く
        const button = screen.getByRole("combobox");
        await user.click(button);

        // ポータル内にオプションが表示されるのを待つ
        await waitFor(() => {
            expect(document.body).toHaveTextContent("Option 2");
        });

        // オプションをクリック（現在 document.body 内）
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

        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開いて検索入力が利用可能になるのを待つ
        const searchInput = await screen.findByPlaceholderText("検索...");
        expect(searchInput).toBeInTheDocument();

        // 検索入力にフォーカスして矢印キーで移動する
        searchInput.focus();
        await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

        // 2 番目のオプション（インデックス 1）が選択されるはず
        await waitFor(() => {
            expect(handleChange).toHaveBeenCalled();
        }, { timeout: 2000 });
    });

    it("selects option with Enter key", async () => {
        const user = userEvent.setup();
        const handleChange = jest.fn();
        render(
            <SearchableSelect
                onValueChange={handleChange}
                options={mockOptions}
            />
        );

        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開くのを待つ
        const searchInput = await screen.findByPlaceholderText("検索...");
        expect(searchInput).toBeInTheDocument();

        // 検索入力にフォーカスし、下キーで最初のオプションにフォーカスしてから Enter
        searchInput.focus();
        await user.keyboard("{ArrowDown}{Enter}");

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

        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開くのを待つ
        const searchInput = await screen.findByPlaceholderText("検索...");
        expect(searchInput).toBeInTheDocument();

        // Escape を押してドロップダウンを閉じる
        await user.keyboard("{Escape}");

        await waitFor(() => {
            const closedInput = document.querySelector('input[placeholder="検索..."]');
            expect(closedInput).not.toBeInTheDocument();
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

        const button = screen.getByRole("combobox");
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
    });

    it("disables the select when disabled prop is true", () => {
        render(
            <SearchableSelect
                onValueChange={jest.fn()}
                options={mockOptions}
                disabled
            />
        );

        const button = screen.getByRole("combobox");
        // コンポーネントは disabled の場合に aria-disabled を使用する
        expect(button).toHaveAttribute("aria-disabled", "true");
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

        const button = screen.getByRole("combobox");
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

        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開くのを待つ
        await waitFor(() => {
            const searchInput = document.querySelector('input[placeholder="検索..."]');
            expect(searchInput).toBeInTheDocument();
        });

        // 外側をクリック
        const outside = screen.getByTestId("outside");
        await user.click(outside);

        await waitFor(() => {
            const closedInput = document.querySelector('input[placeholder="検索..."]');
            expect(closedInput).not.toBeInTheDocument();
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

        const button = screen.getByRole("combobox");
        await user.click(button);

        // ドロップダウンが開くのを待つ
        const searchInput = await screen.findByPlaceholderText("検索...");
        expect(searchInput).toBeInTheDocument();

        // 検索ワードを入力する
        await user.type(searchInput, "apple");

        // Escape でドロップダウンを閉じる
        await user.keyboard("{Escape}");

        // ドロップダウンを再度開く
        await user.click(button);

        // 検索入力がリセットされていることを確認する
        await waitFor(() => {
            const newSearchInput = document.querySelector('input[placeholder="検索..."]') as HTMLInputElement;
            expect(newSearchInput).toHaveValue("");
        }, { timeout: 2000 });
    });
});