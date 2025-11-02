"use client";

import React from "react";
import { splitPlayerName } from "@/lib/utils/player-name-utils";

interface PlayerNameProps {
    fullName: string;
    className?: string;
}

export function PlayerName({ fullName, className }: PlayerNameProps) {
    const { lastName, firstName } = splitPlayerName(fullName || "");

    return (
        <div className={className}>
            <div>
                <p className="text-xs text-gray-600">姓</p>
                <p className="font-medium">{lastName || "（未入力）"}</p>
            </div>
            <div>
                <p className="text-xs text-gray-600">名</p>
                <p className="font-medium">{firstName || "（未入力）"}</p>
            </div>
        </div>
    );
}

export default PlayerName;
