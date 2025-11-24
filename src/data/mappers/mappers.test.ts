import { Timestamp } from "firebase/firestore";
import {
  TeamMapper,
  FirestoreTeamDoc,
} from "./team-mapper";
import {
  TournamentMapper,
  FirestoreTournamentDoc,
} from "./tournament-mapper";
import type { Team, Player } from "@/types/team.schema";

describe("TeamMapper", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-01T00:00:00Z"));
  const mockPlayer: Player = {
    playerId: "player-001",
    lastName: "田中",
    firstName: "太郎",
    displayName: "田中 太郎",
  };

  const mockTeam: Team = {
    teamId: "team-001",
    teamName: "テストチーム",
    representativeName: "代表者名",
    representativePhone: "090-1234-5678",
    representativeEmail: "test@example.com",
    players: [mockPlayer],
    remarks: "テスト用チーム",
    isApproved: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  const mockFirestoreTeam: FirestoreTeamDoc = {
    teamId: "team-001",
    teamName: "テストチーム",
    representativeName: "代表者名",
    representativePhone: "090-1234-5678",
    representativeEmail: "test@example.com",
    remarks: "テスト用チーム",
    isApproved: true,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    players: [
      {
        playerId: "player-001",
        lastName: "田中",
        firstName: "太郎",
        displayName: "田中 太郎",
      },
    ],
  };

  describe("toDomain", () => {
    it("正常なFirestoreドキュメントからドメインエンティティに変換する", () => {
      const result = TeamMapper.toDomain({ ...mockFirestoreTeam });
      expect(result.teamId).toBe("team-001");
      expect(result.teamName).toBe("テストチーム");
      expect(result.players).toHaveLength(1);
      expect(result.isApproved).toBe(true);
    });

    it("id フィールドが優先されて使用される", () => {
      const result = TeamMapper.toDomain({
        ...mockFirestoreTeam,
        id: "id-from-doc",
        teamId: "teamId-fallback",
      });
      expect(result.teamId).toBe("id-from-doc");
    });

    it("id フィールドがない場合は teamId フィールドを使用する", () => {
      const result = TeamMapper.toDomain(mockFirestoreTeam);
      expect(result.teamId).toBe("team-001");
    });

    it("id も teamId もない場合はエラーを投げる", () => {
      const docWithoutId: Partial<FirestoreTeamDoc & { id?: string }> = {
        ...mockFirestoreTeam,
      };
      delete docWithoutId.teamId;
      expect(() => TeamMapper.toDomain(docWithoutId as FirestoreTeamDoc & { id?: string })).toThrow(
        "Team ID is required for domain conversion"
      );
    });

    it("createdAt が存在しない場合はエラーを投げる", () => {
      const docWithoutCreatedAt = { ...mockFirestoreTeam };
      delete (docWithoutCreatedAt as Partial<FirestoreTeamDoc>).createdAt;
      expect(() => TeamMapper.toDomain(docWithoutCreatedAt)).toThrow(
        "CreatedAt and UpdatedAt timestamps are required for domain conversion"
      );
    });

    it("updatedAt が存在しない場合はエラーを投げる", () => {
      const docWithoutUpdatedAt = { ...mockFirestoreTeam };
      delete (docWithoutUpdatedAt as Partial<FirestoreTeamDoc>).updatedAt;
      expect(() => TeamMapper.toDomain(docWithoutUpdatedAt)).toThrow(
        "CreatedAt and UpdatedAt timestamps are required for domain conversion"
      );
    });

    it("プレイヤー配列が空の場合はバリデーションエラーを投げる", () => {
      expect(() =>
        TeamMapper.toDomain({
          ...mockFirestoreTeam,
          players: [],
        })
      ).toThrow();
    });

    it("複数のプレイヤーを持つドキュメントを正常に変換する", () => {
      const result = TeamMapper.toDomain({
        ...mockFirestoreTeam,
        players: [
          {
            playerId: "p1",
            lastName: "田中",
            firstName: "太郎",
            displayName: "田中 太郎",
          },
          {
            playerId: "p2",
            lastName: "鈴木",
            firstName: "花子",
            displayName: "鈴木 花子",
          },
        ],
      });
      expect(result.players).toHaveLength(2);
      expect(result.players[1].playerId).toBe("p2");
    });

    it("remarks が空文字列の場合もデフォルト値に変換される", () => {
      const result = TeamMapper.toDomain({
        ...mockFirestoreTeam,
        remarks: "",
      });
      expect(result.remarks).toBe("");
    });

    it("無効な teamName（空文字列）の場合はバリデーションエラーを投げる", () => {
      expect(() =>
        TeamMapper.toDomain({
          ...mockFirestoreTeam,
          teamName: "",
        })
      ).toThrow();
    });

    it("無効な representativeEmail（不正なメールアドレス）の場合はエラーを投げる", () => {
      expect(() =>
        TeamMapper.toDomain({
          ...mockFirestoreTeam,
          representativeEmail: "invalid-email",
        })
      ).toThrow();
    });

    it("Timestamp を正しく Date に変換する", () => {
      const specificDate = new Date("2024-06-15T12:30:45Z");
      const timestamp = Timestamp.fromDate(specificDate);
      const result = TeamMapper.toDomain({
        ...mockFirestoreTeam,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      expect(result.createdAt).toEqual(specificDate);
      expect(result.updatedAt).toEqual(specificDate);
    });

    it("isApproved が false の場合も正常に変換される", () => {
      const result = TeamMapper.toDomain({
        ...mockFirestoreTeam,
        isApproved: false,
      });
      expect(result.isApproved).toBe(false);
    });

    it("無効なプレイヤーデータ（lastName が空文字列）の場合はエラーを投げる", () => {
      expect(() =>
        TeamMapper.toDomain({
          ...mockFirestoreTeam,
          players: [
            {
              playerId: "p1",
              lastName: "",
              firstName: "太郎",
              displayName: "太郎",
            },
          ],
        })
      ).toThrow();
    });
  });

  describe("toFirestore", () => {
    it("ドメインエンティティをFirestoreドキュメントに変換する", () => {
      const result = TeamMapper.toFirestore(mockTeam);
      expect(result.teamName).toBe("テストチーム");
      expect(result.representativeName).toBe("代表者名");
      expect(result.isApproved).toBe(true);
      expect(result.players).toHaveLength(1);
    });

    it("Date を Timestamp に変換する", () => {
      const result = TeamMapper.toFirestore(mockTeam);
      expect(result.createdAt).toHaveProperty("seconds");
      expect(result.createdAt).toHaveProperty("nanoseconds");
      expect(result.updatedAt).toHaveProperty("seconds");
      expect(result.updatedAt).toHaveProperty("nanoseconds");
    });

    it("プレイヤー配列が正しく変換される", () => {
      const result = TeamMapper.toFirestore(mockTeam);
      expect(result.players[0].playerId).toBe("player-001");
      expect(result.players[0].displayName).toBe("田中 太郎");
    });

    it("teamId は返却されないことを確認", () => {
      const result = TeamMapper.toFirestore(mockTeam);
      expect("teamId" in result).toBe(false);
    });

    it("プレイヤーが空配列の場合も正常に処理される", () => {
      const result = TeamMapper.toFirestore({
        ...mockTeam,
        players: [],
      });
      expect(result.players).toEqual([]);
    });
  });

  describe("toFirestoreForCreate", () => {
    it("新規作成用ドキュメントを生成する", () => {
      const partialTeam = {
        id: "new-team-001",
        teamName: "新規チーム",
        representativeName: "新規代表",
        representativePhone: "080-9999-8888",
        representativeEmail: "new@example.com",
        players: [mockPlayer],
        remarks: "新規",
        isApproved: false,
      } as Parameters<typeof TeamMapper.toFirestoreForCreate>[0];

      const result = TeamMapper.toFirestoreForCreate(partialTeam);
      expect(result.teamId).toBe("new-team-001");
      expect(result.teamName).toBe("新規チーム");
      expect(result.isApproved).toBe(false);
      expect(result.createdAt).toHaveProperty("seconds");
      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("createdAt と updatedAt が自動的に設定される", () => {
      const beforeTime = Timestamp.now();
      const partialTeam = {
        id: "team-002",
        teamName: "自動タイムスタンプテスト",
        representativeName: "代表",
        representativePhone: "090-0000-0000",
        representativeEmail: "auto@example.com",
        players: [],
      } as Parameters<typeof TeamMapper.toFirestoreForCreate>[0];

      const result = TeamMapper.toFirestoreForCreate(partialTeam);
      const afterTime = Timestamp.now();

      // タイムスタンプが現在時刻の前後に存在することを確認
      expect(result.createdAt.seconds).toBeGreaterThanOrEqual(
        beforeTime.seconds
      );
      expect(result.updatedAt.seconds).toBeLessThanOrEqual(afterTime.seconds);
    });

    it("players が未定義の場合は空配列になる", () => {
      const partialTeam = {
        id: "team-003",
        teamName: "プレイヤーなし",
        representativeName: "代表",
        representativePhone: "090-1111-1111",
        representativeEmail: "nopl@example.com",
      } as Partial<Team> & { id: string };

      const result = TeamMapper.toFirestoreForCreate(partialTeam);
      expect(result.players).toEqual([]);
    });

    it("remarks が未定義の場合は空文字列になる", () => {
      const partialTeam = {
        id: "team-004",
        teamName: "備考なし",
        representativeName: "代表",
        representativePhone: "090-2222-2222",
        representativeEmail: "norem@example.com",
        players: [],
      } as Partial<Team> & { id: string };

      const result = TeamMapper.toFirestoreForCreate(partialTeam);
      expect(result.remarks).toBe("");
    });

    it("isApproved が未定義の場合は false になる", () => {
      const partialTeam = {
        id: "team-005",
        teamName: "未承認",
        representativeName: "代表",
        representativePhone: "090-3333-3333",
        representativeEmail: "noapp@example.com",
        players: [],
      } as Partial<Team> & { id: string };

      const result = TeamMapper.toFirestoreForCreate(partialTeam);
      expect(result.isApproved).toBe(false);
    });
  });

  describe("toFirestoreForUpdate", () => {
    it("部分更新ドキュメントを生成する", () => {
      const partialTeam = {
        teamName: "更新されたチーム名",
        isApproved: true,
      };

      const result = TeamMapper.toFirestoreForUpdate(partialTeam);
      expect(result.teamName).toBe("更新されたチーム名");
      expect(result.isApproved).toBe(true);
      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("更新されていないフィールドは undefined になる", () => {
      const partialTeam = { teamName: "新しい名前" };
      const result = TeamMapper.toFirestoreForUpdate(partialTeam);

      expect(result.teamName).toBe("新しい名前");
      expect(result.representativeName).toBeUndefined();
      expect(result.remarks).toBeUndefined();
    });

    it("preserveTimestamps が true の場合 updatedAt は undefined になる", () => {
      const partialTeam = { teamName: "タイムスタンプ保持" };
      const result = TeamMapper.toFirestoreForUpdate(partialTeam, true);

      expect(result.teamName).toBe("タイムスタンプ保持");
      expect(result.updatedAt).toBeUndefined();
    });

    it("preserveTimestamps が false（デフォルト）の場合 updatedAt が設定される", () => {
      const partialTeam = { teamName: "更新テスト" };
      const result = TeamMapper.toFirestoreForUpdate(partialTeam, false);

      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("プレイヤー配列の更新も正しく処理される", () => {
      const newPlayers = [
        {
          playerId: "p-new",
          lastName: "新",
          firstName: "プレイヤー",
          displayName: "新 プレイヤー",
        },
      ];
      const partialTeam = { players: newPlayers };

      const result = TeamMapper.toFirestoreForUpdate(partialTeam);
      expect(result.players).toHaveLength(1);
      expect(result.players![0].playerId).toBe("p-new");
    });

    it("複数フィールドの部分更新", () => {
      const partialTeam = {
        teamName: "新チーム名",
        remarks: "新しい備考",
        isApproved: true,
      };

      const result = TeamMapper.toFirestoreForUpdate(partialTeam);
      expect(result.teamName).toBe("新チーム名");
      expect(result.remarks).toBe("新しい備考");
      expect(result.isApproved).toBe(true);
      expect(result.representativeName).toBeUndefined();
    });

    it("空の部分更新の場合 updatedAt のみ設定される", () => {
      const partialTeam = {};
      const result = TeamMapper.toFirestoreForUpdate(partialTeam);

      expect(result.updatedAt).toHaveProperty("seconds");
      expect(Object.keys(result).length).toBe(1); // updatedAt のみ
    });
  });

  describe("toDomainsFromQuerySnapshot", () => {
    it("複数のドキュメントから配列に変換する", () => {
      const mockDocs = [
        {
          id: "team-001",
          data: () => mockFirestoreTeam,
        },
        {
          id: "team-002",
          data: () => ({
            ...mockFirestoreTeam,
            teamName: "チーム2",
            teamId: "team-002",
          }),
        },
      ] as Array<{ id: string; data(): FirestoreTeamDoc }>;

      const result = TeamMapper.toDomainsFromQuerySnapshot(mockDocs);
      expect(result).toHaveLength(2);
      expect(result[0].teamId).toBe("team-001");
      expect(result[1].teamId).toBe("team-002");
      expect(result[1].teamName).toBe("チーム2");
    });

    it("空の配列の場合は空の配列を返す", () => {
      const result = TeamMapper.toDomainsFromQuerySnapshot([]);
      expect(result).toEqual([]);
    });

    it("単一ドキュメントの配列も正常に処理される", () => {
      const mockDocs = [
        {
          id: "team-001",
          data: () => mockFirestoreTeam,
        },
      ] as Array<{ id: string; data(): FirestoreTeamDoc }>;

      const result = TeamMapper.toDomainsFromQuerySnapshot(mockDocs);
      expect(result).toHaveLength(1);
      expect(result[0].teamId).toBe("team-001");
    });

    it("無効なドキュメントが含まれている場合はエラーを投げる", () => {
      const mockDocs = [
        {
          id: "team-001",
          data: () => ({
            ...mockFirestoreTeam,
            teamName: "", // 無効
          }),
        },
      ] as Array<{ id: string; data(): FirestoreTeamDoc }>;

      expect(() =>
        TeamMapper.toDomainsFromQuerySnapshot(mockDocs)
      ).toThrow();
    });
  });

  describe("validateAndConvert", () => {
    it("正常なドキュメントの場合は成功を返す", () => {
      const result = TeamMapper.validateAndConvert(mockFirestoreTeam);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.teamId).toBe("team-001");
      }
    });

    it("無効なドキュメントの場合は失敗を返す", () => {
      const invalidDoc = {
        ...mockFirestoreTeam,
        teamName: "", // 無効
      };

      const result = TeamMapper.validateAndConvert(invalidDoc);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
        expect(result.error.length).toBeGreaterThan(0);
      }
    });

    it("エラーメッセージが文字列で返される", () => {
      const invalidDoc = {
        ...mockFirestoreTeam,
        representativeEmail: "invalid-email",
      };

      const result = TeamMapper.validateAndConvert(invalidDoc);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(typeof result.error).toBe("string");
      }
    });

    it("複数の無効フィールドがある場合でもエラーを返す", () => {
      const invalidDoc = {
        ...mockFirestoreTeam,
        teamName: "",
        representativePhone: "invalid",
      };

      const result = TeamMapper.validateAndConvert(invalidDoc);
      expect(result.success).toBe(false);
    });
  });
});

describe("TournamentMapper", () => {
  const mockTimestamp = Timestamp.fromDate(new Date("2024-01-01T00:00:00Z"));
  const mockCourt = {
    courtId: "court-001",
    courtName: "Aコート",
  };

  const mockFirestoreTournament: FirestoreTournamentDoc = {
    tournamentId: "tournament-001",
    tournamentName: "第1回テスト大会",
    tournamentDate: new Date("2024-01-15"),
    tournamentDetail: "テスト大会の詳細情報",
    location: "テスト会場",
    defaultMatchTime: 180,
    courts: [mockCourt],
    rounds: [{ roundId: "round-001", roundName: "1回戦" }],
    tournamentType: "individual",
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  describe("toDomain", () => {
    it("正常なFirestoreドキュメントからドメインエンティティに変換する", () => {
      const result = TournamentMapper.toDomain(mockFirestoreTournament);
      expect(result.tournamentId).toBe("tournament-001");
      expect(result.tournamentName).toBe("第1回テスト大会");
      expect(result.defaultMatchTime).toBe(180);
      expect(result.courts).toHaveLength(1);
    });

    it("id フィールドが優先されて使用される", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        id: "id-from-doc",
        tournamentId: "tournamentId-fallback",
      });
      expect(result.tournamentId).toBe("id-from-doc");
    });

    it("id フィールドがない場合は tournamentId フィールドを使用する", () => {
      const result = TournamentMapper.toDomain(mockFirestoreTournament);
      expect(result.tournamentId).toBe("tournament-001");
    });

    it("id も tournamentId もない場合はエラーを投げる", () => {
      const docWithoutId: Partial<FirestoreTournamentDoc & { id?: string }> = {
        ...mockFirestoreTournament,
      };
      delete docWithoutId.tournamentId;
      expect(() => TournamentMapper.toDomain(docWithoutId as FirestoreTournamentDoc & { id?: string })).toThrow(
        "Tournament ID is required for domain conversion"
      );
    });

    it("createdAt が存在しない場合はエラーを投げる", () => {
      const docWithoutCreatedAt = { ...mockFirestoreTournament };
      delete (docWithoutCreatedAt as Partial<FirestoreTournamentDoc>).createdAt;
      expect(() => TournamentMapper.toDomain(docWithoutCreatedAt)).toThrow(
        "CreatedAt and UpdatedAt timestamps are required for domain conversion"
      );
    });

    it("updatedAt が存在しない場合はエラーを投げる", () => {
      const docWithoutUpdatedAt = { ...mockFirestoreTournament };
      delete (docWithoutUpdatedAt as Partial<FirestoreTournamentDoc>).updatedAt;
      expect(() => TournamentMapper.toDomain(docWithoutUpdatedAt)).toThrow(
        "CreatedAt and UpdatedAt timestamps are required for domain conversion"
      );
    });

    it("コート配列が空の場合も正常に変換する", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        courts: [],
      });
      expect(result.courts).toEqual([]);
    });

    it("複数のコートを持つドキュメントを正常に変換する", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        courts: [
          { courtId: "c1", courtName: "Aコート" },
          { courtId: "c2", courtName: "Bコート" },
          { courtId: "c3", courtName: "Cコート" },
        ],
      });
      expect(result.courts).toHaveLength(3);
      expect(result.courts[2].courtId).toBe("c3");
    });

    it("tournamentDate を正しく処理する", () => {
      const specificDate = new Date("2024-06-15");
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        tournamentDate: specificDate,
      });
      expect(result.tournamentDate).toEqual(specificDate);
    });

    it("Timestamp を正しく Date に変換する", () => {
      const specificDate = new Date("2024-06-15T12:30:45Z");
      const timestamp = Timestamp.fromDate(specificDate);
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      expect(result.createdAt).toEqual(specificDate);
      expect(result.updatedAt).toEqual(specificDate);
    });

    it("tournamentName が空文字列でも tournamentSchema では許可される", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        tournamentName: "",
      });
      expect(result.tournamentName).toBe("");
    });

    it("無効な defaultMatchTime（0以下）の場合はバリデーションエラーを投げる", () => {
      expect(() =>
        TournamentMapper.toDomain({
          ...mockFirestoreTournament,
          defaultMatchTime: 0,
        })
      ).toThrow();
    });

    it("location が空文字列でも tournamentSchema では許可される", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        location: "",
      });
      expect(result.location).toBe("");
    });

    it("極端に大きな defaultMatchTime でも正常に変換できる", () => {
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        defaultMatchTime: 999999,
      });
      expect(result.defaultMatchTime).toBe(999999);
    });

    it("tournamentDetail が長いテキストの場合も正常に変換できる", () => {
      const longDetail = "a".repeat(1000);
      const result = TournamentMapper.toDomain({
        ...mockFirestoreTournament,
        tournamentDetail: longDetail,
      });
      expect(result.tournamentDetail).toBe(longDetail);
    });
  });

  describe("toFirestoreCreate", () => {
    it("新規作成用ドキュメントを生成する", () => {
      const tournamentForCreate = {
        id: "new-tournament-001",
        tournamentName: "新規大会",
        tournamentDate: new Date("2024-02-01"),
        tournamentDetail: "新規大会詳細",
        location: "新規会場",
        defaultMatchTime: 240,
        courts: [mockCourt],
        rounds: [],
        tournamentType: "individual",
      } as Parameters<typeof TournamentMapper.toFirestoreCreate>[0];

      const result = TournamentMapper.toFirestoreCreate(tournamentForCreate);
      expect(result.tournamentId).toBe("new-tournament-001");
      expect(result.tournamentName).toBe("新規大会");
      expect(result.defaultMatchTime).toBe(240);
      expect(result.createdAt).toHaveProperty("seconds");
      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("createdAt と updatedAt が自動的に設定される", () => {
      const beforeTime = Timestamp.now();
      const tournamentForCreate = {
        id: "tournament-002",
        tournamentName: "タイムスタンプテスト",
        tournamentDate: new Date("2024-02-01"),
        tournamentDetail: "詳細",
        location: "会場",
        defaultMatchTime: 180,
        courts: [],
        rounds: [],
        tournamentType: "individual",
      } as Parameters<typeof TournamentMapper.toFirestoreCreate>[0];

      const result = TournamentMapper.toFirestoreCreate(tournamentForCreate);
      const afterTime = Timestamp.now();

      expect(result.createdAt.seconds).toBeGreaterThanOrEqual(
        beforeTime.seconds
      );
      expect(result.updatedAt.seconds).toBeLessThanOrEqual(afterTime.seconds);
    });

    it("コート配列が空でも正常に処理される", () => {
      const tournamentForCreate = {
        id: "tournament-003",
        tournamentName: "コートなし大会",
        tournamentDate: new Date("2024-02-01"),
        tournamentDetail: "詳細",
        location: "会場",
        defaultMatchTime: 180,
        courts: [],
        rounds: [],
        tournamentType: "individual",
      } as Parameters<typeof TournamentMapper.toFirestoreCreate>[0];

      const result = TournamentMapper.toFirestoreCreate(tournamentForCreate);
      expect(result.courts).toEqual([]);
    });

    it("複数のコートが正しく変換される", () => {
      const courts = [
        { courtId: "c1", courtName: "Aコート" },
        { courtId: "c2", courtName: "Bコート" },
      ];
      const tournamentForCreate = {
        id: "tournament-004",
        tournamentName: "複数コート大会",
        tournamentDate: new Date("2024-02-01"),
        tournamentDetail: "詳細",
        location: "会場",
        defaultMatchTime: 180,
        courts,
        rounds: [],
        tournamentType: "individual",
      } as Parameters<typeof TournamentMapper.toFirestoreCreate>[0];

      const result = TournamentMapper.toFirestoreCreate(tournamentForCreate);
      expect(result.courts).toHaveLength(2);
      expect(result.courts[0].courtId).toBe("c1");
    });
  });

  describe("toFirestoreUpdate", () => {
    it("部分更新ドキュメントを生成する", () => {
      const partialTournament = {
        tournamentName: "更新された大会名",
        defaultMatchTime: 300,
      };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect(result.tournamentName).toBe("更新された大会名");
      expect(result.defaultMatchTime).toBe(300);
      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("更新されていないフィールドは undefined になる", () => {
      const partialTournament = { tournamentName: "新しい名前" };
      const result = TournamentMapper.toFirestoreUpdate(partialTournament);

      expect(result.tournamentName).toBe("新しい名前");
      expect(result.location).toBeUndefined();
      expect(result.courts).toBeUndefined();
    });

    it("updatedAt は常に設定される", () => {
      const partialTournament = { tournamentName: "テスト" };
      const result = TournamentMapper.toFirestoreUpdate(partialTournament);

      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("コート配列の更新も正しく処理される", () => {
      const newCourts = [
        { courtId: "c-new-1", courtName: "新Aコート" },
        { courtId: "c-new-2", courtName: "新Bコート" },
      ];
      const partialTournament = { courts: newCourts };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect(result.courts).toHaveLength(2);
      expect(result.courts![0].courtId).toBe("c-new-1");
    });

    it("複数フィールドの部分更新", () => {
      const partialTournament = {
        tournamentName: "新大会名",
        location: "新会場",
        defaultMatchTime: 250,
      };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect(result.tournamentName).toBe("新大会名");
      expect(result.location).toBe("新会場");
      expect(result.defaultMatchTime).toBe(250);
      expect(result.tournamentDetail).toBeUndefined();
    });

    it("tournamentDate の更新も正しく処理される", () => {
      const newDate = new Date("2024-12-25");
      const partialTournament = { tournamentDate: newDate };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect(result.tournamentDate).toEqual(newDate);
    });

    it("tournamentDetail の更新も正しく処理される", () => {
      const partialTournament = {
        tournamentDetail: "新しい詳細情報",
      };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect(result.tournamentDetail).toBe("新しい詳細情報");
    });

    it("空の部分更新の場合 updatedAt のみ設定される", () => {
      const partialTournament = {};
      const result = TournamentMapper.toFirestoreUpdate(partialTournament);

      expect(result.updatedAt).toHaveProperty("seconds");
      expect(Object.keys(result).length).toBe(1); // updatedAt のみ
    });

    it("undefined の値は含めない", () => {
      const partialTournament = {
        tournamentName: undefined,
        location: "更新された会場",
        courts: undefined,
      };

      const result = TournamentMapper.toFirestoreUpdate(partialTournament);
      expect("tournamentName" in result).toBe(false);
      expect(result.location).toBe("更新された会場");
      expect("courts" in result).toBe(false);
      expect(result.updatedAt).toHaveProperty("seconds");
    });

    it("コート配列が空の配列に更新される場合も正しく処理される", () => {
      const partialTournament = { courts: [] };
      const result = TournamentMapper.toFirestoreUpdate(partialTournament);

      expect(result.courts).toEqual([]);
    });
  });
});
