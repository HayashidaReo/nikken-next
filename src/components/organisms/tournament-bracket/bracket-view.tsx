"use client";

import React, { useMemo } from "react";
import { MatchGroup } from "@/types/match.schema";
import { Tournament } from "@/types/tournament.schema";
import { Team } from "@/types/team.schema";
import { cn } from "@/lib/utils";
import { User, Trophy } from "lucide-react";

interface BracketViewProps {
    tournament: Tournament;
    matchGroups: MatchGroup[];
    teams: Team[];
}

// レイアウト定数
const ITEM_HEIGHT = 80; // 各チーム/ノードのベース高さ
const LEVEL_WIDTH = 200; // 各ラウンド間の幅
const NODE_WIDTH = 180; // チームカードの幅
const MATCH_LABEL_SIZE = 30; // W1等のラベルサイズ

export const BracketView: React.FC<BracketViewProps> = ({ tournament, matchGroups, teams }) => {
    // チームIDからチーム情報を取得するマップ
    const teamsMap = useMemo(() => {
        return new Map(teams.map(t => [t.teamId, t]));
    }, [teams]);

    // 試合をラウンドIDごとにマップ
    // sortOrderは 1-based index と仮定
    const matchLookup = useMemo(() => {
        const map = new Map<string, MatchGroup>(); // key: roundId-sortOrder
        matchGroups.forEach(m => {
            map.set(`${m.roundId}-${m.sortOrder}`, m);
        });
        return map;
    }, [matchGroups]);

    const rounds = tournament.rounds;
    // チーム数から必要なラウンド数を計算（最低でもlog2(teams)）
    // 例: 8チーム -> 3ラウンド, 5チーム -> 3ラウンド
    const neededRounds = Math.ceil(Math.log2(Math.max(teams.length, 2)));
    const totalRounds = Math.max(rounds.length, neededRounds);
    const roundOffset = totalRounds - rounds.length;

    // 仮想的なツリー構造を生成
    // 各ラウンドの必要スロット数 = 2^(totalRounds - 1 - rIndex)
    // 構造は totalRounds に基づいて完全なツリーを作る
    const virtualStructure = useMemo(() => {
        // 全ラウンド分（仮想含む）ループ
        const structure = Array.from({ length: totalRounds }).map((_, rIndex) => {
            const matchCount = Math.pow(2, totalRounds - 1 - rIndex);

            // 実際のラウンドデータとのマッピング
            // rIndex < roundOffset の場合、まだ実際のラウンドが存在しない（仮想ラウンド）
            const realRoundIndex = rIndex - roundOffset;
            const roundData = realRoundIndex >= 0 ? rounds[realRoundIndex] : undefined;
            const roundId = roundData?.roundId;

            // 各スロット（試合）のデータを生成
            const slots = Array.from({ length: matchCount }).map((_, i) => {
                const sortOrder = i; // 0-based
                // roundIdが無い場合はマッチ検索できない
                const match = roundId ? matchLookup.get(`${roundId}-${sortOrder}`) : undefined;

                const key = match?.matchGroupId || `virtual-${rIndex}-${sortOrder}`;

                return {
                    roundId,
                    roundIndex: rIndex,
                    sortOrder,
                    match,
                    key
                };
            });
            return { round: roundData, slots };
        });
        return structure;
    }, [rounds, totalRounds, matchLookup, roundOffset]);

    // 最初のラウンドの試合数（=チームペア数）
    const firstRoundSlotCount = virtualStructure[0]?.slots.length || 0;

    // Y座標計算用マップ
    // key -> { x, y }
    const posMap = useMemo(() => {
        const map = new Map<string, { x: number, y: number }>();

        virtualStructure.forEach((level) => {
            level.slots.forEach((slot, index) => {
                const rIndex = level.slots[0].roundIndex;
                // X座標: ラウンドに応じて右へずらす
                const setX = rIndex * LEVEL_WIDTH + NODE_WIDTH + 40;

                // Y座標: 2つのチーム（または前段の試合）の中央に配置
                const slotSpan = Math.pow(2, rIndex + 1);

                // チームカードの中心を考慮した中央位置
                // 例: index=0, rIndex=0 の場合
                //   - slot 0 (team A) の中心: 0.5 * ITEM_HEIGHT  
                //   - slot 1 (team B) の中心: 1.5 * ITEM_HEIGHT
                //   - その中間: 1.0 * ITEM_HEIGHT
                const centerSlot = index * slotSpan + slotSpan / 2;
                const y = centerSlot * ITEM_HEIGHT;

                map.set(slot.key, { x: setX, y });
            });
        });
        return map;
    }, [virtualStructure]);

    // チーム検索（シード対応）
    const traceTeamForLeaf = (leafIndex: number): Team | undefined => {
        let rIndex = 0;
        let mIndex = Math.floor(leafIndex / 2);
        let side: "teamA" | "teamB" = leafIndex % 2 === 0 ? "teamA" : "teamB";

        while (rIndex < totalRounds) {
            // realRoundIndexを確認
            const realRoundIndex = rIndex - roundOffset;
            const roundData = realRoundIndex >= 0 ? rounds[realRoundIndex] : undefined;

            if (!roundData) {
                // ラウンドがない場合（仮想）
                // マッチがないのでBye扱いとして上に登るか？
                // しかし仮想ラウンドは「未定」なのでByeではない。
                // データがないため追跡不能。
                // ただし、もしここが「1回戦」なら、ここにあるはずのチームは「その枠」にいるチーム。
                // データ不足のため追跡終了
                return undefined;
            }

            const sortOrder = mIndex;
            const match = matchLookup.get(`${roundData.roundId}-${sortOrder}`);

            if (match) {
                const teamId = side === "teamA" ? match.teamAId : match.teamBId;
                if (teamId) return teamsMap.get(teamId);
                return undefined;
            }

            // Bye logic (only valid if match structure implies it, but here we just trace up)
            if (side === "teamB") return undefined;

            const nextMIndex = Math.floor(mIndex / 2);
            const nextSide = mIndex % 2 === 0 ? "teamA" : "teamB";

            rIndex++;
            mIndex = nextMIndex;
            side = nextSide;
        }
        return undefined;
    };

    const totalHeight = (firstRoundSlotCount * 2) * ITEM_HEIGHT;
    const totalWidth = totalRounds * LEVEL_WIDTH + NODE_WIDTH + 100;

    return (
        <div className="w-full overflow-auto bg-white min-h-screen p-8">
            <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                    {/* Connections */}
                    {virtualStructure.map((level, rIndex) => {
                        const nextLevel = virtualStructure[rIndex + 1];
                        if (!nextLevel) return null;

                        return level.slots.map((slot, sIndex) => {
                            const currentPos = posMap.get(slot.key);

                            const parentIndex = Math.floor(sIndex / 2);
                            const parentSlot = nextLevel.slots[parentIndex];

                            if (currentPos && parentSlot) {
                                const nextPos = posMap.get(parentSlot.key);
                                if (nextPos) {
                                    const isCompleted = slot.match?.isCompleted;
                                    const strokeColor = isCompleted ? "#0F172A" : "#CBD5E1";
                                    const strokeWidth = isCompleted ? "3" : "2";

                                    const bracketX = nextPos.x - 30;

                                    return (
                                        <path
                                            key={`conn-${slot.key}`}
                                            d={`M ${currentPos.x} ${currentPos.y} 
                                               H ${bracketX} 
                                               V ${nextPos.y} 
                                               H ${nextPos.x}`}
                                            fill="none"
                                            stroke={strokeColor}
                                            strokeWidth={strokeWidth}
                                        />
                                    );
                                }
                            }
                            return null;
                        });
                    })}

                    {/* Final Winner Line */}
                    {(() => {
                        const finalLevel = virtualStructure[virtualStructure.length - 1];
                        const finalSlot = finalLevel?.slots[0];
                        if (finalSlot) {
                            const pos = posMap.get(finalSlot.key);
                            if (pos) {
                                const isCompleted = finalSlot.match?.isCompleted;
                                const strokeColor = isCompleted ? "#0F172A" : "#CBD5E1";
                                const strokeWidth = isCompleted ? "3" : "2";
                                return (
                                    <path
                                        d={`M ${pos.x} ${pos.y} H ${pos.x + 60}`}
                                        fill="none"
                                        stroke={strokeColor}
                                        strokeWidth={strokeWidth}
                                    />
                                );
                            }
                        }
                    })()}
                </svg>

                {/* Teams (Left Column) - Render all leaf slots */}
                <div className="absolute left-0 top-0 flex flex-col gap-0">
                    {/* firstRoundSlotCount * 2 creates the leaf count.
                        virtualStructure[0] contains matches. Each match has 2 leaves. 
                        Iterate virtualStructure[0].slots (matches) -> render 2 leaves per match.
                    */}
                    {virtualStructure[0]?.slots.map((slot, index) => {
                        const leafIndexA = index * 2;
                        const leafIndexB = index * 2 + 1;

                        const teamA = traceTeamForLeaf(leafIndexA) || teams[leafIndexA];
                        const teamB = traceTeamForLeaf(leafIndexB) || teams[leafIndexB];

                        const slotY_A = leafIndexA * ITEM_HEIGHT;
                        const slotY_B = leafIndexB * ITEM_HEIGHT;

                        // Winner check needs careful logic for byes
                        // For display purposed in left column, we highlight if they won the specific round 1 match?
                        // Or highlight if they are still in tournament...
                        // Simple logic: If match exists, check winner. If inferred from Bye, maybe don't highlight or highlight as winner?
                        // Let's stick to match result if exists.
                        const isWinnerA = slot.match?.winnerTeam === "teamA";
                        const isWinnerB = slot.match?.winnerTeam === "teamB";

                        return (
                            <React.Fragment key={`teams-wrapper-${slot.key}`}>
                                {/* Team A Slot */}
                                <div style={{ position: 'absolute', top: slotY_A, left: 0, height: ITEM_HEIGHT }} className="flex items-center">
                                    <TeamCard team={teamA} isWinner={isWinnerA} />
                                </div>

                                {/* Team B Slot */}
                                <div style={{ position: 'absolute', top: slotY_B, left: 0, height: ITEM_HEIGHT }} className="flex items-center">
                                    <TeamCard team={teamB} isWinner={isWinnerB} />
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Team connection lines - drawn in main SVG */}
                <svg className="absolute left-0 top-0 w-full h-full pointer-events-none z-10">
                    {virtualStructure[0]?.slots.map((slot, index) => {
                        const matchPos = posMap.get(slot.key);
                        if (!matchPos) return null;

                        const leafIndexA = index * 2;
                        const leafIndexB = index * 2 + 1;

                        const slotY_A = leafIndexA * ITEM_HEIGHT;
                        const slotY_B = leafIndexB * ITEM_HEIGHT;

                        const isWinnerA = slot.match?.winnerTeam === "teamA";
                        const isWinnerB = slot.match?.winnerTeam === "teamB";

                        return (
                            <React.Fragment key={`team-lines-${slot.key}`}>
                                <path
                                    d={`M ${NODE_WIDTH} ${slotY_A + ITEM_HEIGHT / 2} H ${matchPos.x - 30} V ${matchPos.y} H ${matchPos.x}`}
                                    fill="none"
                                    stroke={isWinnerA ? "#0F172A" : "#CBD5E1"}
                                    strokeWidth={isWinnerA ? "3" : "2"}
                                />
                                <path
                                    d={`M ${NODE_WIDTH} ${slotY_B + ITEM_HEIGHT / 2} H ${matchPos.x - 30} V ${matchPos.y} H ${matchPos.x}`}
                                    fill="none"
                                    stroke={isWinnerB ? "#0F172A" : "#CBD5E1"}
                                    strokeWidth={isWinnerB ? "3" : "2"}
                                />
                            </React.Fragment>
                        );
                    })}
                </svg>

                {/* Match Nodes (W Labels) */}
                {virtualStructure.map((level) => {
                    return level.slots.map((slot) => {
                        const pos = posMap.get(slot.key);
                        if (!pos) return null;

                        const isFinished = slot.match?.isCompleted;
                        const labelText = slot.match ? `W${slot.match.sortOrder}` : `M${slot.sortOrder}`;
                        // Show M(index) if no match data, or W(sortOrder) if match exists
                        // Keeping it simple: just sortOrder for virtual?
                        // User asked for "First match place".

                        // If we are in "Real" rounds, use W.
                        // If in Virtual rounds...
                        // Let's just use `W{sortOrder}` if match exists, else hide?
                        // But for structure verification, let's keep it minimal.

                        const displayText = slot.match ? `W${slot.match.sortOrder}` : '';

                        return (
                            <div
                                key={`node-${slot.key}`}
                                className={cn(
                                    "absolute flex items-center justify-center text-xs font-bold text-white rounded-sm cursor-pointer hover:scale-110 transition-transform",
                                    isFinished ? "bg-slate-800" : "bg-slate-400"
                                )}
                                style={{
                                    left: pos.x - MATCH_LABEL_SIZE / 2,
                                    top: pos.y,
                                    width: MATCH_LABEL_SIZE,
                                    height: MATCH_LABEL_SIZE,
                                    transform: `translateY(${MATCH_LABEL_SIZE / 2}px)`
                                }}
                            >
                                {slot.match ? `W${slot.match.sortOrder}` : ''}
                            </div>
                        );
                    });
                })}

                {/* Trophy */}
                {(() => {
                    const finalLevel = virtualStructure[virtualStructure.length - 1];
                    const finalSlot = finalLevel?.slots[0];
                    if (finalSlot) {
                        const pos = posMap.get(finalSlot.key);
                        // show trophy if final match has winner
                        if (pos && finalSlot.match?.winnerTeam) {
                            return (
                                <div
                                    className="absolute text-yellow-500"
                                    style={{
                                        left: pos.x + 60,
                                        top: pos.y + MATCH_LABEL_SIZE / 2 - 16,
                                    }}
                                >
                                    <Trophy size={32} />
                                </div>
                            );
                        }
                    }
                })()}
            </div>
        </div>
    );
};

const TeamCard = ({ team, isWinner }: { team: Team | undefined, isWinner: boolean }) => {
    return (
        <div className={cn(
            "w-[180px] h-[50px] border rounded-md flex items-center px-3 gap-2 bg-white transition-all",
            isWinner ? "border-slate-800 shadow-sm" : "border-slate-300 text-slate-500"
        )}>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <User size={14} className="text-slate-400" />
            </div>
            <span className={cn("text-sm truncate font-medium", isWinner ? "text-slate-900" : "")}>
                {team?.teamName || "TBD"}
            </span>
        </div>
    );
};

