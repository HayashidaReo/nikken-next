# Firestore データベース設計

## データ正規化の方針

本システムでは、データの整合性とメンテナンス性を確保するため、以下の原則に従います：

- **名前はIDで参照**: コート名、ラウンド名、チーム名、選手名などの表示用データは、すべてIDで参照し、マスターデータ（tournaments、teams）から取得して表示します。
- **IDの保存場所**:
  - `courtId`, `roundId`: tournamentsコレクションのcourts/rounds配列に定義
  - `teamId`: teamsコレクションのドキュメントID
  - `playerId`: teamsコレクション内のplayers配列に定義
- **表示名の取得**: 画面表示時は、保存されたIDを基に対応するマスターデータから名前を取得します。
- **データ同期**: チーム名や選手名が変更された場合、Cloud Functionで関連するmatchesコレクションのキャッシュデータ（displayName, teamName）を自動更新します。

## organizations コレクション

大会運営を行う主催組織ごとに、tournaments コレクションの管理を行います。

- **パス**: `organizations/{orgId}`
- **ドキュメントID**: 自動生成ID

### フィールド

| フィールド名          | データ型  | 説明                     |
| --------------------- | --------- | ------------------------ |
| `orgId`               | String    | 主催団体ID               |
| `orgName`             | String    | 団体名                   |
| `representativeName`  | String    | 団体代表者名             |
| `representativePhone` | String    | 団体代表者電話番号       |
| `representativeEmail` | String    | 団体代表者メールアドレス |
| `createdAt`           | Timestamp | データ作成日時           |
| `updatedAt`           | Timestamp | 最終編集日時             |

## tournaments サブコレクション

各organizationが管理し、teams、matches コレクションの管理を行います。

- **パス**: `organizations/{orgId}/tournaments/{tournamentId}`
- **ドキュメントID**: 自動生成ID

### フィールド

| フィールド名         | データ型      | 説明                                     |
| -------------------- | ------------- | ---------------------------------------- |
| `tournamentId`       | String        | 大会ID（Firestoreの自動生成IDと同じ値）  |
| `tournamentName`     | String        | 大会名                                   |
| `tournamentDate`     | Timestamp     | 開催日（日付のみ、時間は00:00:00に設定） |
| `tournamentDetail`   | String        | 大会概要（自由記述テキスト）             |
| `location`           | String        | 開催場所                                 |
| `defaultMatchTime`   | Int           | デフォルト試合時間（秒）                 |
| `courts`             | Array of Maps | 会場のコート情報                         |
| `courts[].courtId`   | String        | コートID                                 |
| `courts[].courtName` | String        | コート名                                 |
| `rounds`             | Array of Maps | ラウンド（回戦）情報                     |
| `rounds[].roundId`   | String        | ラウンドID                               |
| `rounds[].roundName` | String        | ラウンド名                               |
| `tournamentType`     | String        | 大会形式 ("individual" \| "team")        |
| `createdAt`          | Timestamp     | データ作成日時                           |
| `updatedAt`          | Timestamp     | 最終編集日時                             |

## teams コレクション

選手登録フォームからの申請内容、およびその承認状態を一元管理します。

### 目的

- 選手登録フォームからのデータ（申請）を保存する
- 「チーム・選手管理画面」で、このコレクションのデータを一覧表示し、承認状態 (`isApproved`) を更新する
- 「試合の組み合わせ設定画面」で、`isApproved: true` のチームをドロップダウンの選択肢として読み出す

- **パス**: `organizations/{orgId}/tournaments/{tournamentId}/teams/{teamId}`
- **ドキュメントID**: 自動生成ID

### フィールド

| フィールド名            | データ型      | 説明                                                       |
| ----------------------- | ------------- | ---------------------------------------------------------- |
| `teamId`                | String        | チームId                                                   |
| `teamName`              | String        | チーム名（所属名）                                         |
| `representativeName`    | String        | 代表者名                                                   |
| `representativePhone`   | String        | 代表者電話番号                                             |
| `representativeEmail`   | String        | 代表者メールアドレス                                       |
| `players`               | Array of Maps | 参加選手リスト                                             |
| `players[].playerId`    | String        | 選手固有ID                                                 |
| `players[].lastName`    | String        | 姓                                                         |
| `players[].firstName`   | String        | 名                                                         |
| `players[].displayName` | String        | 表示名（基本姓のみ。同姓がいる場合は、名の一部も含まれる）          |
| `players[].grade`       | String?       | 段位　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  |
| `remarks`               | String        | 備考欄                                                     |
| `isApproved`            | Boolean       | 承認状態（デフォルト: false）                              |
| `createdAt`             | Timestamp     | フォーム送信日時                                           |
| `updatedAt`             | Timestamp     | 最終編集日時                                               |


## matchGroups コレクション (団体戦用)

団体戦における「チーム対チーム」の試合（対戦カード）を管理します。
個人戦の場合は使用しません。

- **パス**: `organizations/{orgId}/tournaments/{tournamentId}/matchGroups/{matchGroupId}`
- **ドキュメントID**: 自動生成ID

### フィールド

| フィールド名   | データ型  | 説明                                                   |
| -------------- | --------- | ------------------------------------------------------ |
| `matchGroupId` | String    | チーム試合ID                                           |
| `courtId`      | String    | コートID（tournamentsのcourts配列内のcourtIdと対応）   |
| `roundId`      | String    | ラウンドID（tournamentsのrounds配列内のroundIdと対応） |
| `isCompleted`  | Boolean   | 試合完了フラグ                                         |
| `winnerTeam`   | String    | 試合に勝ったチーム(`teamA` or `teamB`)                  |
| `sortOrder`    | number    | 表示順序                                               |
| `teamAId`      | String    | チームAのID                                            |
| `teamBId`      | String    | チームBのID                                            |
| `createdAt`    | Timestamp | 作成日時                                               |
| `updatedAt`    | Timestamp | 最終編集日時                                           |

## matches コレクション (個人戦用)

全ての試合の組み合わせ、およびリアルタイムの試合状況（得点、反則、選手名など）を管理します。このコレクションがアプリの核となります。

### 目的

- 「試合の組み合わせ設定画面」で、ドキュメントを作成・編集・削除する
- 「試合一覧画面」で、このコレクションを一覧表示する

- **パス (個人戦)**: `organizations/{orgId}/tournaments/{tournamentId}/matches/{matchId}`
- **ドキュメントID**: 自動生成ID （= 試合id）

### フィールド

| フィールド名                  | データ型  | 説明                                                                          |
| ----------------------------- | --------- | ----------------------------------------------------------------------------- |
| `matchId`                     | String    | 試合ID                                                                        |
| `courtId`                     | String    | コートID（tournamentsのcourts配列内のcourtIdと対応）                          |
| `roundId`                     | String    | ラウンドID（tournamentsのrounds配列内のroundIdと対応）                        |
| `sortOrder`                   | Number    | 表示順序（昇順でソート）                                                      |
| `players`                     | Map       | 選手の情報                                                                    |
| `players.playerA`             | Map       | 選手Aの情報                                                                   |
| `players.playerA.playerId`    | String    | 選手ID                                                                        |
| `players.playerA.teamId`      | String    | チームID                                                                      |
| `players.playerA.score`       | Number    | 選手Aの得点（0, 1, 2）                                                        |
| `players.playerA.hansoku`     | Number    | 選手Aの反則状態（0:"none", 1:"yellow", 2:"red", 3:"red_yellow", 4:"red_red"） |
| `players.playerB`             | Map       | 選手Bの情報（playerAと同様の構造）                                            |
| `isCompleted`                 | Boolean   | 試合完了フラグ                                                                |
| `winner`                      | String    | 勝者 ("playerA", "playerB", "draw", "")                                     |
| `winReason`                   | String    | 決着理由 ("ippon", "hantei", "hansoku", "fusen", "")                        |
| `createdAt`                   | Timestamp | 組み合わせ作成日時                                                            |
| `updatedAt`                   | Timestamp | 最終編集日時                                                                  |


## teamMatches コレクション (団体戦用)

全ての試合の組み合わせ、およびリアルタイムの試合状況（得点、反則、選手名など）を管理します。このコレクションがアプリの核となります。

### 目的

- 「試合の組み合わせ設定画面」で、ドキュメントを作成・編集・削除する
- 「試合一覧画面」で、このコレクションを一覧表示する

- **パス (団体戦)**: `organizations/{orgId}/tournaments/{tournamentId}/matchGroups/{matchGroupId}/teamMatches/{matchId}`
- **ドキュメントID**: 自動生成ID （= 試合id）

### フィールド

| フィールド名                  | データ型  | 説明                                                                          |
| ----------------------------- | --------- | ----------------------------------------------------------------------------- |
| `matchId`                     | String    | 試合ID                                                                        |
| `matchGroupId`                | String    | 親となるチーム試合ID                                                          |
| `roundId`                     | String    | ラウンドID（tournamentsのrounds配列内のroundIdと対応）                        |
| `sortOrder`                   | Number    | 表示順序（昇順でソート）                                                      |
| `players`                     | Map       | 選手の情報                                                                    |
| `players.playerA`             | Map       | 選手Aの情報                                                                   |
| `players.playerA.playerId`    | String    | 選手ID                                                                        |
| `players.playerA.teamId`      | String    | チームID                                                                      |
| `players.playerA.score`       | Number    | 選手Aの得点（0, 1, 2）                                                        |
| `players.playerA.hansoku`     | Number    | 選手Aの反則状態（0:"none", 1:"yellow", 2:"red", 3:"red_yellow", 4:"red_red"） |
| `players.playerB`             | Map       | 選手Bの情報（playerAと同様の構造）                                            |
| `isCompleted`                 | Boolean   | 試合完了フラグ                                                                |
| `winner`                      | String    | 勝者 ("playerA", "playerB", "draw", null)                                     |
| `winReason`                   | String    | 決着理由 ("ippon", "hantei", "hansoku", "fusen", null)                        |
| `createdAt`                   | Timestamp | 組み合わせ作成日時                                                            |
| `updatedAt`                   | Timestamp | 最終編集日時                                                                  |
