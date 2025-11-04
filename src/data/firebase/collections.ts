import { db } from "@/lib/firebase/client";
import { adminDb } from "@/lib/firebase-admin/server";
import { collection, doc } from "firebase/firestore";

/**
 * Firestore コレクション参照の定数定義
 * パス構造を一元管理し、タイポを防ぐ
 */

// クライアントSDK用のコレクション参照
export const clientCollections = {
  /**
   * organizations コレクション
   */
  organizations: () => collection(db, "organizations"),

  /**
   * 特定の組織の tournaments サブコレクション
   */
  tournaments: (orgId: string) =>
    collection(db, "organizations", orgId, "tournaments"),

  /**
   * 特定の大会の teams サブコレクション
   */
  teams: (orgId: string, tournamentId: string) =>
    collection(
      db,
      "organizations",
      orgId,
      "tournaments",
      tournamentId,
      "teams"
    ),

  /**
   * 特定の大会の matches サブコレクション
   */
  matches: (orgId: string, tournamentId: string) =>
    collection(
      db,
      "organizations",
      orgId,
      "tournaments",
      tournamentId,
      "matches"
    ),
} as const;

// クライアントSDK用のドキュメント参照
export const clientDocs = {
  /**
   * 特定の組織のドキュメント参照
   */
  organization: (orgId: string) => doc(db, "organizations", orgId),

  /**
   * 特定の大会のドキュメント参照
   */
  tournament: (orgId: string, tournamentId: string) =>
    doc(db, "organizations", orgId, "tournaments", tournamentId),

  /**
   * 特定のチームのドキュメント参照
   */
  team: (orgId: string, tournamentId: string, teamId: string) =>
    doc(
      db,
      "organizations",
      orgId,
      "tournaments",
      tournamentId,
      "teams",
      teamId
    ),

  /**
   * 特定の試合のドキュメント参照
   */
  match: (orgId: string, tournamentId: string, matchId: string) =>
    doc(
      db,
      "organizations",
      orgId,
      "tournaments",
      tournamentId,
      "matches",
      matchId
    ),
} as const;

// Admin SDK用のコレクション参照（サーバーサイドのみ）
export const adminCollections = {
  /**
   * organizations コレクション
   */
  organizations: () => adminDb.collection("organizations"),

  /**
   * 特定の組織の tournaments サブコレクション
   */
  tournaments: (orgId: string) =>
    adminDb.collection("organizations").doc(orgId).collection("tournaments"),

  /**
   * 特定の大会の teams サブコレクション
   */
  teams: (orgId: string, tournamentId: string) =>
    adminDb
      .collection("organizations")
      .doc(orgId)
      .collection("tournaments")
      .doc(tournamentId)
      .collection("teams"),

  /**
   * 特定の大会の matches サブコレクション
   */
  matches: (orgId: string, tournamentId: string) =>
    adminDb
      .collection("organizations")
      .doc(orgId)
      .collection("tournaments")
      .doc(tournamentId)
      .collection("matches"),
} as const;

// Admin SDK用のドキュメント参照（サーバーサイドのみ）
export const adminDocs = {
  /**
   * 特定の組織のドキュメント参照
   */
  organization: (orgId: string) =>
    adminDb.collection("organizations").doc(orgId),

  /**
   * 特定の大会のドキュメント参照
   */
  tournament: (orgId: string, tournamentId: string) =>
    adminDb
      .collection("organizations")
      .doc(orgId)
      .collection("tournaments")
      .doc(tournamentId),

  /**
   * 特定のチームのドキュメント参照
   */
  team: (orgId: string, tournamentId: string, teamId: string) =>
    adminDb
      .collection("organizations")
      .doc(orgId)
      .collection("tournaments")
      .doc(tournamentId)
      .collection("teams")
      .doc(teamId),

  /**
   * 特定の試合のドキュメント参照
   */
  match: (orgId: string, tournamentId: string, matchId: string) =>
    adminDb
      .collection("organizations")
      .doc(orgId)
      .collection("tournaments")
      .doc(tournamentId)
      .collection("matches")
      .doc(matchId),
} as const;

/**
 * パスビルダーユーティリティ
 */
export const pathBuilder = {
  /**
   * 組織のパスを構築
   */
  organizationPath: (orgId: string) => `organizations/${orgId}`,

  /**
   * 大会のパスを構築
   */
  tournamentPath: (orgId: string, tournamentId: string) =>
    `organizations/${orgId}/tournaments/${tournamentId}`,

  /**
   * チームのパスを構築
   */
  teamPath: (orgId: string, tournamentId: string, teamId: string) =>
    `organizations/${orgId}/tournaments/${tournamentId}/teams/${teamId}`,

  /**
   * 試合のパスを構築
   */
  matchPath: (orgId: string, tournamentId: string, matchId: string) =>
    `organizations/${orgId}/tournaments/${tournamentId}/matches/${matchId}`,
} as const;
