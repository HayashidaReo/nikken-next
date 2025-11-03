"use client";

import { useTournament } from "@/queries/use-tournaments";
import { Card, CardContent } from "@/components/atoms/card";
import { CalendarIcon, MapPinIcon, TrophyIcon, InfoIcon } from "lucide-react";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import { ApiError } from "@/lib/utils/api-error";

interface TournamentInfoBannerProps {
    orgId: string;
    tournamentId: string;
}

export function TournamentInfoBanner({ orgId, tournamentId }: TournamentInfoBannerProps) {
    const { data: tournament, isLoading, error } = useTournament(orgId, tournamentId);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-4 h-16 bg-gray-200 rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        // 404エラーの場合は親コンポーネントで処理するため、何も表示しない
        if (error instanceof ApiError && error.isNotFound()) {
            return null;
        }

        return (
            <div className="max-w-4xl mx-auto mb-8">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <div className="flex items-center text-red-600">
                            <InfoIcon className="h-5 w-5 mr-2" />
                            <span>大会情報の取得に失敗しました</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!tournament) {
        return null;
    }

    // 日付の形式化（utilsを使用）
    const formatTournamentDate = (dateValue: Date) => {
        // date-utilsの関数を使用して統一的な日付処理
        return formatDateForDisplay(dateValue);
    };

    return (
        <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                    {/* 大会名 */}
                    <div className="flex items-center mb-4">
                        <TrophyIcon className="h-6 w-6 text-blue-600 mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            {tournament.tournamentName}
                        </h1>
                    </div>

                    {/* 基本情報 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-700">
                            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                            <span>{formatTournamentDate(tournament.tournamentDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPinIcon className="h-5 w-5 mr-2 text-blue-600" />
                            <span>{tournament.location}</span>
                        </div>
                    </div>

                    {/* 大会概要 */}
                    {tournament.tournamentDetail && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <InfoIcon className="h-4 w-4 mr-2 text-blue-600" />
                                大会概要
                            </h3>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {tournament.tournamentDetail}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}