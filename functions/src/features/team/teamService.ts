import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { FIRESTORE_COLLECTIONS } from "../../constants";
import { DisplayNameHelper } from "./helpers/displayNameHelper";

export interface TeamFormData {
    teamName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    players: {
        fullName: string;
        grade: string;
    }[];
    remarks?: string;
}

export interface TeamRegistrationResult {
    success: boolean;
    team: {
        id: string;
        name: string;
        representativeName: string;
        playersCount: number;
        isApproved: boolean;
        createdAt: string;
    };
}

const db = admin.firestore();

export class TeamService {
    /**
     * チームを登録する
     * @param orgId 組織ID
     * @param tournamentId 大会ID
     * @param formData フォームデータ
     */
    static async registerTeam(
        orgId: string,
        tournamentId: string,
        formData: TeamFormData
    ): Promise<TeamRegistrationResult> {

        // データの変換 (FormData -> TeamCreate)
        const players = formData.players.map(player => {
            const nameResult = DisplayNameHelper.splitPlayerName(player.fullName);
            return {
                playerId: `player_${uuidv4()}`,
                lastName: nameResult.lastName,
                firstName: nameResult.firstName,
                displayName: "", // 後で生成
                grade: player.grade,
            };
        });

        // displayName生成
        const playersWithDisplayNames = DisplayNameHelper.generateDisplayNames(players);

        const now = admin.firestore.Timestamp.now();
        const teamId = uuidv4();

        const teamData = {
            teamId: teamId,
            teamName: formData.teamName,
            representativeName: formData.representativeName,
            representativePhone: formData.representativePhone,
            representativeEmail: formData.representativeEmail,
            players: playersWithDisplayNames,
            remarks: formData.remarks,
            isApproved: false,
            createdAt: now,
            updatedAt: now,
        };

        // Firestoreへの保存
        // パス: organizations/{orgId}/tournaments/{tournamentId}/teams/{teamId}
        const teamRef = db
            .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
            .doc(orgId)
            .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
            .doc(tournamentId)
            .collection(FIRESTORE_COLLECTIONS.TEAMS)
            .doc(teamId);

        await teamRef.set(teamData);

        return {
            success: true,
            team: {
                id: teamData.teamId,
                name: teamData.teamName,
                representativeName: teamData.representativeName,
                playersCount: teamData.players.length,
                isApproved: teamData.isApproved,
                createdAt: now.toDate().toISOString(),
            },
        };
    }
}
