import React from "react";
import { render, screen } from "@testing-library/react";
import PlayerName from "./player-name";

describe("PlayerName", () => {
  test("正常な姓名を表示する", () => {
    render(<PlayerName fullName="山田 太郎" />);

    expect(screen.getByText("姓")).toBeInTheDocument();
    expect(screen.getByText("山田")).toBeInTheDocument();
    expect(screen.getByText("名")).toBeInTheDocument();
    expect(screen.getByText("太郎")).toBeInTheDocument();
  });

  test("名前が複数部分の場合も正しく表示する", () => {
    render(<PlayerName fullName="山田 太郎 次郎" />);

    expect(screen.getByText("山田")).toBeInTheDocument();
    expect(screen.getByText("太郎 次郎")).toBeInTheDocument();
  });

  test("姓のみの場合フォールバック表示する", () => {
    render(<PlayerName fullName="単一名" />);

    expect(screen.getByText("単一名")).toBeInTheDocument();
    expect(screen.getByText("（未入力）")).toBeInTheDocument();
  });

  test("空文字の場合未入力表示する", () => {
    render(<PlayerName fullName="" />);

    expect(screen.getAllByText("（未入力）")).toHaveLength(2);
  });

  test("カスタムクラス名が適用される", () => {
    const { container } = render(
      <PlayerName fullName="山田 太郎" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  test("undefinedが渡された場合も正しく処理する", () => {
    // @ts-expect-error Testing edge case with undefined
    render(<PlayerName fullName={undefined} />);

    expect(screen.getAllByText("（未入力）")).toHaveLength(2);
  });
});
