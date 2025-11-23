Firestoreのオフライン機能はあくまで「一時的な電波断絶への保険（キャッシュ）」であり、**「長時間ガッツリ作業する場所」としては設計されていません。**

-----

### 1\. 新しいアーキテクチャ： "Local-First"

Flutterでいうと、**「`sqflite` (ローカルDB) でアプリを動かし、必要な時だけ API でサーバーと同期する」** という構成にします。これが一番安定します。

**採用すべき技術スタック:**

  * **ローカルDB:** **Dexie.js** (IndexedDBのラッパー。FlutterのsqfliteやDriftのポジション)
  * **サーバーDB:** **Firestore** (あくまでデータのマスター/バックアップ先)

#### 運用の流れ（イメージ）

1.  **準備（オンライン）:**
      * アプリ起動時や「データ取得」ボタンで、Firestoreから選手データをダウンロードし、**Dexie.js (ローカルDB) にコピー**する。
2.  **本番（オフライン/機内モード）:**
      * **Firestoreは一切見に行かない。**
      * UIは全て **Dexie.js** のデータを表示・更新する。
      * どれだけリロードしても、PCを再起動しても、ローカルDBなので一瞬で表示される。エラーも出ない。
3.  **終了後（オンライン）:**
      * 「結果を送信」ボタンで、Dexie.js のデータを Firestore に上書き保存する。

### 2\. なぜこれが正解なのか？

| 特徴 | Firestore SDK (今の構成) | Dexie.js + Firestore (提案) |
| :--- | :--- | :--- |
| **オフライン時の挙動** | 「接続できない」エラーを内部で握りつぶしながら、リトライを繰り返す（不安定）。 | **「正常動作」として動く。** ネットワーク処理がないので爆速。 |
| **リロード時の挙動** | サーバーに繋ぎに行こうとして待機時間が発生したり、設定ミスで消えたりする。 | **瞬時に復元される。** ローカルファイルを読むだけだから。 |
| **データ検索** | オフラインだと複雑な検索（`where`句の複合など）ができないことがある。 | **自由自在。** SQLのように自由にクエリが書ける。 |
| **Flutterでの例え** | 常に `FutureBuilder` で `Firestore.instance` を見ている状態。 | **Drift/Hive** で動かして、最後に `sync()` する状態。 |

### 3\. Dexie.js を使った実装イメージ

ReactでローカルDBを使うための標準ライブラリ `Dexie.js` を使います。
コードの雰囲気を見てください。驚くほど直感的です。

#### Step 1: DBの定義 (`src/db.ts`)

```typescript
import Dexie, { Table } from 'dexie';

// テーブルの型定義
export interface LocalMatch {
  id: string; // UUIDなど
  playerAName: string;
  playerBName: string;
  scoreA: number;
  scoreB: number;
  isSynced: boolean; // 未同期かどうかのフラグ
}

class MyDatabase extends Dexie {
  matches!: Table<LocalMatch>; 

  constructor() {
    super('NikkenOfflineDB');
    // スキーマ定義（検索に使うキーだけ書く）
    this.version(1).stores({
      matches: 'id, isSynced' 
    });
  }
}

export const db = new MyDatabase();
```

#### Step 2: データの保存（フックの中身）

もう `useMutation` で Firestore と格闘する必要はありません。

```typescript
// useSaveMatchResult.ts
import { db } from '@/db';

export const saveMatchLocally = async (matchData) => {
  // ローカルDBに保存（非同期だが一瞬）
  await db.matches.put({
    ...matchData,
    isSynced: false // 「まだサーバーに送ってないよ」という印
  });
  console.log("保存完了！");
};
```

#### Step 3: データの表示（コンポーネント）

`useLiveQuery` というフックを使うと、**DBが更新されると自動で画面も書き換わります**（FlutterのStreamBuilderと同じ感覚）。

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export const MatchList = () => {
  // DBの中身をリアルタイム監視
  const matches = useLiveQuery(() => db.matches.toArray());

  if (!matches) return <div>Loading...</div>;

  return (
    <ul>
      {matches.map(m => (
        <li key={m.id}>
           {m.playerAName} vs {m.playerBName} 
           {m.isSynced ? "✅" : "📤未送信"}
        </li>
      ))}
    </ul>
  );
};
```