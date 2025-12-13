import { Timestamp } from "firebase/firestore";
import type { Organization, OrganizationCreateWithAccount } from "@/types/organization.schema";

export interface FirestoreOrganizationDoc {
    orgName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    adminUid: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export class OrganizationMapper {
    static toDomain(doc: FirestoreOrganizationDoc & { id: string }): Organization {
        return {
            id: doc.id,
            orgName: doc.orgName,
            representativeName: doc.representativeName,
            representativePhone: doc.representativePhone,
            representativeEmail: doc.representativeEmail,
            adminUid: doc.adminUid,
            createdAt: doc.createdAt instanceof Timestamp
                ? doc.createdAt.toDate().toISOString()
                : new Date().toISOString(),
            updatedAt: doc.updatedAt instanceof Timestamp
                ? doc.updatedAt.toDate().toISOString()
                : new Date().toISOString(),
        };
    }

    // 作成用データはFunction経由なのでMapper不要かもだが、一応
    static toFirestore(data: OrganizationCreateWithAccount): Partial<FirestoreOrganizationDoc> {
        // Cloud Functions側で処理されるため、クライアント側での厳密なFirestore型変換は必須ではないが
        // 型安全のために定義しておく
        return {
            orgName: data.orgName,
            representativeName: data.representativeName,
            representativePhone: data.representativePhone,
            representativeEmail: data.representativeEmail,
            // adminUid, createdAt, updatedAt はサーバーサイドで設定
        };
    }
}
