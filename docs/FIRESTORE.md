### 1\. 全体アーキテクチャ図

| 層 (Layer) | React (TanStack Query) | 役割 |
| :--- | :--- | :--- |
| **View** | **Component** (`.tsx`) | 画面描画。フックを呼ぶだけ。 |
| **ViewModel** | **Custom Hook** (`useQuery`, `useMutation`) | 状態管理。データのキャッシュ、楽観的更新、ローディング状態の管理。 |
| **Repository** | **Service Functions** (`.ts`) | **ここを作ります。** Firestoreへの直接アクセス、型変換（Converter）を担当。 |
| **Model** | **Type / Interface** | データの型定義。 |
| **Data Source** | Firestore SDK | データベース本体。 |

-----

### 2\. ディレクトリ構成（Feature-based）

機能ごとにフォルダをまとめる構成をお勧めします。コードが増えても迷子になりません。（既存の構成を尊重する）

承知しました。**「現在のディレクトリ構成を維持したまま、中身をFirestore Client SDK（オフライン対応）に書き換える」** 場合の構成図を作成しました。

ファイル自体を移動させる必要はありません。**「どのファイルの役割をどう変えるか」** に注目してご覧ください。

### 修正後のディレクトリ構成と役割定義

書き換えが必要な重要ファイルに注釈（`★`）を付けています。

```text
.
├── components
│   └── ... (UIコンポーネントは変更なし。Hooksからデータをもらうだけ)
│
├── data
│   ├── firebase
│   │   └── ...
│   ├── mappers  <-- ★ ここでFirestoreのデータを変換する
│   │   ├── match-converter.ts       // (変更) FirestoreDataConverterを定義
│   │   ├── team-converter.ts        // (変更) FirestoreDataConverterを定義
│   │   └── tournament-converter.ts  // (変更) FirestoreDataConverterを定義
│   └── index.ts
│
├── domains
│   └── ... (エンティティ定義はそのまま利用)
│
├── hooks
│   └── ... (汎用Hooksは変更なし)
│
├── lib
│   ├── firebase
│   │   └── client.ts  <-- ★ 最重要: ここで enableMultiTabIndexedDbPersistence 等を設定
│   ├── utils
│   │   └── ...
│   └── ...
│
├── queries  <-- ★ ここが「APIクライアント」から「SDKラッパー」に変わる
│   ├── use-match-result.ts    // (変更) useMutationでRepositoryを呼ぶ
│   ├── use-matches.ts         // (変更) useQueryでRepositoryを呼ぶ
│   ├── use-teams.ts           // (変更) useQueryでRepositoryを呼ぶ
│   └── use-tournaments.ts     // (変更) useQueryでRepositoryを呼ぶ
│
├── repositories
│   ├── firestore  <-- ★ ここが「サーバー処理」から「クライアントDB操作」になる
│   │   ├── match-repository.ts      // (変更) db(client)を使って直接読み書き
│   │   ├── team-repository.ts       // (変更) db(client)を使って直接読み書き
│   │   └── tournament-repository.ts // (変更) db(client)を使って直接読み書き
│   └── ...
│
├── types
│   └── ... (型定義はそのまま)
│
└── ...
```

-----

### 3\. 実装詳細（下から順に）

ここが重要です。Flutterでいう `fromJson` / `toJson` を **Firestore Data Converter** という機能を使って実装します。これを使うと、アプリ内では常に「型安全なオブジェクト」として扱えます。

#### ① Model & Converter (型定義と変換)

Flutterの `freezed` モデルのようなものです。

```typescript
// src/features/tournaments/types/index.ts
export type Tournament = {
  id: string;
  name: string;
  date: Date; // FirestoreのTimestampをDateに変換して扱う
};

// src/features/tournaments/services/converter.ts
import { FirestoreDataConverter, Timestamp } from 'firebase/firestore';
import { Tournament } from '../types';

export const tournamentConverter: FirestoreDataConverter<Tournament> = {
  // アプリ -> Firestore (toJson)
  toFirestore(tournament: Tournament) {
    return {
      name: tournament.name,
      date: Timestamp.fromDate(tournament.date),
    };
  },
  // Firestore -> アプリ (fromJson)
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      date: data.date?.toDate(), // TimestampをDateに戻す
    } as Tournament;
  },
};
```

#### ② Repository (データアクセス)

ここではUIの状態（ローディングなど）は気にせず、純粋に「Firestoreと会話する関数」だけを書きます。
`withConverter` を使うのがポイントです。

```typescript
// src/features/tournaments/services/repository.ts
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { tournamentConverter } from './converter';
import { Tournament } from '../types';

// コンバーター適用済みのCollectionRef
const tournamentsRef = collection(db, 'tournaments').withConverter(tournamentConverter);

export const getTournaments = async (): Promise<Tournament[]> => {
  const q = query(tournamentsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  // converterを通しているので、data()は既にTournament型
  return snapshot.docs.map(doc => doc.data());
};

export const createTournament = async (tournament: Tournament): Promise<void> => {
  const docRef = doc(tournamentsRef, tournament.id);
  await setDoc(docRef, tournament);
};
```

#### ③ Custom Hook (ViewModel)

ここで TanStack Query を使い、キャッシュ管理と楽観的更新を行います。
コンポーネントはこのフックだけを使います。

```typescript
// src/features/tournaments/hooks/use-tournaments.ts
import { useQuery } from '@tanstack/react-query';
import { getTournaments } from '../services/repository';

export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournaments,
    // オフライン対応のための設定
    staleTime: Infinity, // キャッシュを腐らせない
    gcTime: Infinity,    // ガベージコレクションしない
  });
};
```

#### ④ Component (View)

非常にシンプルになります。

```tsx
// src/features/tournaments/components/tournament-list.tsx
import { useTournaments } from '../hooks/use-tournaments';

export const TournamentList = () => {
  const { data, isLoading, isError } = useTournaments();

  if (isLoading) return <div>読み込み中...</div>;
  if (isError) return <div>エラー</div>;

  return (
    <ul>
      {data?.map(t => (
        <li key={t.id}>{t.name} - {t.date.toLocaleDateString()}</li>
      ))}
    </ul>
  );
};
```

-----

### 4\. セキュリティルールの整備 (必須)

APIルートを廃止するので、今までサーバー側で行っていたチェックを `firestore.rules` に移す必要があります。

**イメージ:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{tournamentId} {
      // 読み取りは誰でもOK
      allow read: if true;
      // 書き込みは認証済みユーザーのみ
      allow write: if request.auth != null;
    }
  }
}
```