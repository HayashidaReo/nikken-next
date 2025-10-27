import type { Team } from "@/types/team.schema";
import type { Match } from "@/types/match.schema";
import type { Tournament, Organization } from "@/types/tournament.schema";

// モック組織データ
export const mockOrganization: Organization = {
  orgId: "org-1",
  orgName: "日本拳法連盟",
  representativeName: "山田 太郎",
  representativePhone: "03-1234-5678",
  representativeEmail: "yamada@nipponkenpo.jp",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// モック大会データ
export const mockTournament: Tournament = {
  tournamentName: "第50回全国日本拳法大会",
  tournamentDate: "2024-03-20",
  location: "東京体育館",
  defaultMatchTime: 180, // 3分
  courts: [
    { courtId: "court-1", courtName: "Aコート" },
    { courtId: "court-2", courtName: "Bコート" },
    { courtId: "court-3", courtName: "Cコート" },
  ],
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
};

// モックチームデータ
export const mockTeams: Team[] = [
  {
    teamId: "team-1",
    teamName: "東京大学",
    representativeName: "田中 花子",
    representativePhone: "090-1234-5678",
    representativeEmail: "tanaka@example.com",
    players: [
      {
        playerId: "player-1",
        lastName: "山田",
        firstName: "太郎",
        displayName: "山田",
      },
      {
        playerId: "player-2",
        lastName: "佐藤",
        firstName: "花子",
        displayName: "佐藤",
      },
      {
        playerId: "player-3",
        lastName: "山田",
        firstName: "次郎",
        displayName: "山田 次",
      },
    ],
    remarks: "初回参加です",
    isApproved: true,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    teamId: "team-2",
    teamName: "京都大学",
    representativeName: "鈴木 一郎",
    representativePhone: "090-9876-5432",
    representativeEmail: "suzuki@example.com",
    players: [
      {
        playerId: "player-4",
        lastName: "鈴木",
        firstName: "一郎",
        displayName: "鈴木",
      },
      {
        playerId: "player-5",
        lastName: "田中",
        firstName: "三郎",
        displayName: "田中",
      },
    ],
    remarks: "",
    isApproved: true,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-20"),
  },
  {
    teamId: "team-3",
    teamName: "大阪大学",
    representativeName: "高橋 美咲",
    representativePhone: "090-1111-2222",
    representativeEmail: "takahashi@example.com",
    players: [
      {
        playerId: "player-6",
        lastName: "高橋",
        firstName: "健太",
        displayName: "高橋",
      },
      {
        playerId: "player-7",
        lastName: "伊藤",
        firstName: "美紀",
        displayName: "伊藤",
      },
    ],
    remarks: "よろしくお願いします",
    isApproved: false, // 未承認
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
];

// モック試合データ
export const mockMatches: Match[] = [
  {
    matchId: "match-1",
    courtId: "court-1",
    round: "1回戦",
    players: {
      playerA: {
        displayName: "山田",
        playerId: "player-1",
        teamId: "team-1",
        teamName: "東京大学",
        score: 1,
        hansoku: 1, // 黄
      },
      playerB: {
        displayName: "鈴木",
        playerId: "player-4",
        teamId: "team-2",
        teamName: "京都大学",
        score: 0,
        hansoku: 0, // なし
      },
    },
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    matchId: "match-2",
    courtId: "court-2",
    round: "1回戦",
    players: {
      playerA: {
        displayName: "佐藤",
        playerId: "player-2",
        teamId: "team-1",
        teamName: "東京大学",
        score: 2,
        hansoku: 0, // なし
      },
      playerB: {
        displayName: "田中",
        playerId: "player-5",
        teamId: "team-2",
        teamName: "京都大学",
        score: 0,
        hansoku: 2, // 赤
      },
    },
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    matchId: "match-3",
    courtId: "court-3",
    round: "準決勝",
    players: {
      playerA: {
        displayName: "山田 次",
        playerId: "player-3",
        teamId: "team-1",
        teamName: "東京大学",
        score: 1,
        hansoku: 0, // なし
      },
      playerB: {
        displayName: "高橋",
        playerId: "player-6",
        teamId: "team-3",
        teamName: "大阪大学",
        score: 1,
        hansoku: 1, // 黄
      },
    },
    createdAt: new Date("2024-02-25"),
    updatedAt: new Date("2024-03-01"),
  },
];
