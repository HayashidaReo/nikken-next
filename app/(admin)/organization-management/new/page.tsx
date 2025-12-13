"use client";

import { OrganizationCreateForm } from "@/components/organisms/organization-create-form";

export default function NewOrganizationPage() {
    return (
        <main className="p-6 w-full mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">新規組織作成</h1>
                <p className="text-muted-foreground mt-2">
                    新しい組織（団体）を作成し、管理者アカウントを発行します。
                </p>
            </div>

            <div>
                <OrganizationCreateForm />
            </div>
        </main>
    );
}
