import { db } from "@/lib/firebase/client";
import { adminDb } from "@/lib/firebase-admin/server";
import { collection, doc } from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";

/**
 * Firestore コレクション参照の定数定義
 * パス構造を一元管理し、タイポを防ぐ
 */

// クライアントSDK用のコレクション参照
export const clientCollections = {
  /**
   * organizations コレクション
   */
  organizations: () => collection(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS),

  /**
   * 特定の組織の tournaments サブコレクション
   */
  tournaments: (orgId: string) =>
    collection(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS, orgId, FIRESTORE_COLLECTIONS.TOURNAMENTS),

  /**
   * 特定の大会の teams サブコレクション
   */
  teams: (orgId: string, tournamentId: string) =>
    collection(
      db,
      FIRESTORE_COLLECTIONS.ORGANIZATIONS,
      orgId,
      FIRESTORE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      FIRESTORE_COLLECTIONS.TEAMS
    ),

  /**
   * 特定の大会の matches サブコレクション
   */
  matches: (orgId: string, tournamentId: string) =>
    collection(
      db,
      FIRESTORE_COLLECTIONS.ORGANIZATIONS,
      orgId,
      FIRESTORE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      FIRESTORE_COLLECTIONS.MATCHES
    ),
} as const;

// クライアントSDK用のドキュメント参照
export const clientDocs = {
  /**
   * 特定の組織のドキュメント参照
   */
  organization: (orgId: string) => doc(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS, orgId),

  /**
   * 特定の大会のドキュメント参照
   */
  tournament: (orgId: string, tournamentId: string) =>
    doc(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS, orgId, FIRESTORE_COLLECTIONS.TOURNAMENTS, tournamentId),

  /**
   * 特定のチームのドキュメント参照
   */
  team: (orgId: string, tournamentId: string, teamId: string) =>
    doc(
      db,
      FIRESTORE_COLLECTIONS.ORGANIZATIONS,
      orgId,
      FIRESTORE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      FIRESTORE_COLLECTIONS.TEAMS,
      teamId
    ),

  /**
   * 特定の試合のドキュメント参照
   */
  match: (orgId: string, tournamentId: string, matchId: string) =>
    doc(
      db,
      FIRESTORE_COLLECTIONS.ORGANIZATIONS,
      orgId,
      FIRESTORE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      FIRESTORE_COLLECTIONS.MATCHES,
      matchId
    ),
} as const;

// Admin SDK用のコレクション参照（サーバーサイドのみ）
export const adminCollections = {
  /**
   * organizations コレクション
   */
  organizations: () => adminDb.collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS),

  /**
   * 特定の組織の tournaments サブコレクション
   */
  tournaments: (orgId: string) =>
    adminDb.collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS).doc(orgId).collection(FIRESTORE_COLLECTIONS.TOURNAMENTS),

  /**
   * 特定の大会の teams サブコレクション
   */
  teams: (orgId: string, tournamentId: string) =>
    adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .collection(FIRESTORE_COLLECTIONS.TEAMS),

  /**
   * 特定の大会の matches サブコレクション
   */
  matches: (orgId: string, tournamentId: string) =>
    adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .collection(FIRESTORE_COLLECTIONS.MATCHES),
} as const;

// Admin SDK用のドキュメント参照（サーバーサイドのみ）
export const adminDocs = {
  /**
   * 特定の組織のドキュメント参照
   */
  organization: (orgId: string) =>
    adminDb.collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS).doc(orgId),

  /**
   * 特定の大会のドキュメント参照
   */
  tournament: (orgId: string, tournamentId: string) =>
    adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId),

  /**
   * 特定のチームのドキュメント参照
   */
  team: (orgId: string, tournamentId: string, teamId: string) =>
    adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .collection(FIRESTORE_COLLECTIONS.TEAMS)
      .doc(teamId),

  /**
   * 特定の試合のドキュメント参照
   */
  match: (orgId: string, tournamentId: string, matchId: string) =>
    adminDb
      .collection(FIRESTORE_COLLECTIONS.ORGANIZATIONS)
      .doc(orgId)
      .collection(FIRESTORE_COLLECTIONS.TOURNAMENTS)
      .doc(tournamentId)
      .collection(FIRESTORE_COLLECTIONS.MATCHES)
      .doc(matchId),
} as const;

/**
 * パスビルダーユーティリティ
 */
export const pathBuilder = {
  /**
   * 組織のパスを構築
   */
  organizationPath: (orgId: string) => `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}`,

  /**
   * 大会のパスを構築
   */
  tournamentPath: (orgId: string, tournamentId: string) =>
    `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}`,

  /**
   * チームのパスを構築
   */
  teamPath: (orgId: string, tournamentId: string, teamId: string) =>
    `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.TEAMS}/${teamId}`,

  /**
   * 試合のパスを構築
   */
  matchPath: (orgId: string, tournamentId: string, matchId: string) =>
    `${FIRESTORE_COLLECTIONS.ORGANIZATIONS}/${orgId}/${FIRESTORE_COLLECTIONS.TOURNAMENTS}/${tournamentId}/${FIRESTORE_COLLECTIONS.MATCHES}/${matchId}`,
} as const;
