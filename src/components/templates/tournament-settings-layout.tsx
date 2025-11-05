/**
 * 大会設定レイアウトテンプレート
 * 2カラムレイアウト（左: 一覧、右: 詳細）を共通化
 */

import { ReactNode } from "react";

interface TournamentSettingsLayoutProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    leftPanelClassName?: string;
    rightPanelClassName?: string;
}

/**
 * 大会設定ページの2カラムレイアウトを提供
 * 左側: 大会一覧、右側: 詳細フォームのレイアウト構造を統一
 */
export function TournamentSettingsLayout({
    leftPanel,
    rightPanel,
    leftPanelClassName = "w-1/3",
    rightPanelClassName = "flex-1",
}: TournamentSettingsLayoutProps) {
    return (
        <div className="mt-8 flex gap-8">
            {/* 左側: 大会一覧エリア */}
            <div className={leftPanelClassName}>
                {leftPanel}
            </div>

            {/* 右側: 大会詳細フォーム */}
            <div className={rightPanelClassName}>
                {rightPanel}
            </div>
        </div>
    );
}
