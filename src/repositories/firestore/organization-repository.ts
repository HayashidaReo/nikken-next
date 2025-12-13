import {
    collection,
    query,
    orderBy,
    onSnapshot,
    Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase/client";
import { FIRESTORE_COLLECTIONS } from "@/lib/constants";
import { OrganizationRepository } from "@/repositories/organization-repository";
import { OrganizationMapper, FirestoreOrganizationDoc } from "@/data/mappers/organization-mapper";
import type { Organization, OrganizationCreateWithAccount } from "@/types/organization.schema";

export class FirestoreOrganizationRepository implements OrganizationRepository {
    listenAll(
        onChange: (organizations: Organization[]) => void,
        onError: (error: Error) => void
    ): () => void {
        const q = query(
            collection(db, FIRESTORE_COLLECTIONS.ORGANIZATIONS),
            orderBy("createdAt", "desc")
        );

        const unsub: Unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                try {
                    const organizations = snapshot.docs.map((doc) => {
                        const data = doc.data() as FirestoreOrganizationDoc;
                        return OrganizationMapper.toDomain({ ...data, id: doc.id });
                    });
                    onChange(organizations);
                } catch (e) {
                    onError(e instanceof Error ? e : new Error("Failed to map organization data"));
                }
            },
            (error) => {
                console.error("Organization listen error:", error);
                onError(error);
            }
        );

        return () => unsub();
    }

    async create(data: OrganizationCreateWithAccount): Promise<{ orgId: string }> {
        try {
            const createOrganizationFn = httpsCallable<OrganizationCreateWithAccount, { orgId: string }>(
                functions,
                "createOrganization"
            );
            const result = await createOrganizationFn(data);
            return result.data;
        } catch (error: unknown) {
            console.error("Create organization error:", error);
            const errorMessage = error instanceof Error ? error.message : "組織作成に失敗しました";
            throw new Error(errorMessage);
        }
    }
}
