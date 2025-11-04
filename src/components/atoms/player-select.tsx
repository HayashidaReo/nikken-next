"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/atoms/select";
import type { Player } from "@/types/team.schema";

interface PlayerSelectProps {
    players: Player[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function PlayerSelect({ players, value, onChange, disabled = false }: PlayerSelectProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="選手選択" />
            </SelectTrigger>
            <SelectContent>
                {players.map(player => (
                    <SelectItem key={player.playerId} value={player.playerId}>
                        {player.displayName}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
