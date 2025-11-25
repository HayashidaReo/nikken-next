# Local-First アーキテクチャ設計書

## 1\. アーキテクチャ概要

本システムは、試合運営の安定性とパフォーマンスを最優先するため、\*\*「Local-First（ローカルファースト）」\*\*アーキテクチャを採用する。
UIは常にローカルDBを参照・操作し、バックグラウンドまたは手動操作でサーバー（Firestore）と同期を行う。

### 技術スタック

  * **ローカルDB (Client)**: **Dexie.js** (IndexedDB Wrapper)
      * 役割: アプリケーションの信頼できる情報源（Single Source of Truth）。オフライン時のデータ保存先。
  * **リモートDB (Server)**: **Firestore**
      * 役割: データのマスター、バックアップ、他端末との共有。

## 2\. 運用フロー

1.  **準備（オンライン）**
      * アプリ起動時や「データ取得」ボタン押下時。
      * Firestoreから最新データをダウンロードし、Dexie.jsへ一括コピーする。
2.  **本番運用（オフライン/機内モード推奨）**
      * Firestoreへのアクセスは遮断し、**Dexie.js** のみを読み書きする。
      * ネットワーク遅延の影響を受けず、リロードや再起動を行ってもデータは即座に表示される。
3.  **同期（オンライン復帰後）**
      * 「結果を送信」ボタン押下時。
      * Dexie.js 内の「未送信データ」を抽出し、Firestoreへ上書き保存（同期）する。

## 3\. 導入メリット

| 特徴 | 従来のFirestore SDK構成 | Local-First (Dexie.js) 構成 |
| :--- | :--- | :--- |
| **オフライン動作** | エラーやリトライ処理が不安定 | **ネットワーク処理がないため高速・安定** |
| **リロード時** | サーバー接続待機やキャッシュ消失のリスクあり | **ローカルDBから瞬時に復元** |
| **データ検索** | オフライン時のクエリ制限あり | **柔軟なクエリが可能** |
| **開発メンタルモデル** | 常にサーバー状態を意識する必要あり | **ローカル変数を扱う感覚でDB操作が可能** |

## 4\. 実装詳細

### Step 1: DB定義 (`src/lib/db.ts`)

同期状態を管理するためのフラグ（`isSynced`）をスキーマに含める。

```typescript
import Dexie, { Table } from 'dexie';

export interface LocalMatch {
  id: string;
  playerAName: string;
  playerBName: string;
  scoreA: number;
  scoreB: number;
  // ...他フィールド
  isSynced: boolean; // false: 未送信（変更あり）, true: 送信済み
  updatedAt: Date;
}

class NikkenOfflineDB extends Dexie {
  matches!: Table<LocalMatch>; 

  constructor() {
    super('NikkenOfflineDB');
    // インデックス定義（検索に使用するフィールド）
    this.version(1).stores({
      matches: 'id, isSynced' 
    });
  }
}

export const db = new NikkenOfflineDB();
```

### Step 2: データの保存 (`useSaveMatch.ts`)

UIからの保存操作は、常にローカルDBに対して行う。ネットワーク状態による分岐は行わない。

```typescript
import { db } from '@/lib/db';

export const saveMatchLocally = async (matchData: any) => {
  await db.matches.put({
    ...matchData,
    isSynced: false, // 変更があったため「未送信」とする
    updatedAt: new Date()
  });
};
```

### Step 3: データの表示 (`components/MatchList.tsx`)

Dexieの `useLiveQuery` を使用し、ローカルDBの変更をリアルタイムにUIへ反映させる。

```tsx
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export const MatchList = () => {
  // DBの変更を検知して自動再描画
  const matches = useLiveQuery(() => db.matches.toArray());

  if (!matches) return <div>Loading...</div>;

  return (
    <ul>
      {matches.map(m => (
        <li key={m.id}>
           {m.playerAName} vs {m.playerBName} 
           {/* 同期ステータスの表示 */}
           <span>{m.isSynced ? "✅ 送信済" : "📤 未送信"}</span>
        </li>
      ))}
    </ul>
  );
};
```

### Step 4: 同期処理 (`src/features/sync/sync-service.ts`) 【追記】

ローカルの未送信データをFirestoreへプッシュし、成功後にローカルの状態を更新する。

```typescript
import { db } from '@/lib/db';
import { firestoreDb } from '@/lib/firebase/client';
import { writeBatch, doc } from 'firebase/firestore';

export const syncMatchesToFirestore = async () => {
  // 1. ネットワーク接続確認
  if (!navigator.onLine) {
    throw new Error("オフラインのため同期できません");
  }

  // 2. 未送信データの抽出
  const unsyncedMatches = await db.matches
    .where('isSynced').equals(0) // false (0) を検索
    .toArray();

  if (unsyncedMatches.length === 0) {
    return { count: 0, message: "送信するデータはありません" };
  }

  // 3. Firestoreへの一括書き込み (Batch)
  const batch = writeBatch(firestoreDb);
  
  unsyncedMatches.forEach((match) => {
    const ref = doc(firestoreDb, 'matches', match.id);
    // Firestoreに不要なローカル管理フィールドを除外してセット
    const { isSynced, ...dataToSave } = match; 
    batch.set(ref, dataToSave, { merge: true });
  });

  await batch.commit();

  // 4. ローカルDBのステータス更新 (成功時のみ)
  // 送信したデータの isSynced を true に変更
  const syncedMatches = unsyncedMatches.map(m => ({ ...m, isSynced: true }));
  await db.matches.bulkPut(syncedMatches);

  return { count: unsyncedMatches.length, message: "同期完了" };
};
```