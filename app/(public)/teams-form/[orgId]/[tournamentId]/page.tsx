import { Suspense } from "react";
import { TeamsFormPageContent } from "./page-content";

interface TeamsFormPageProps {
    params: {
        orgId: string;
        tournamentId: string;
    };
}

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
}

export default function TeamsFormPage({ params }: TeamsFormPageProps) {
    const { orgId, tournamentId } = params;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <Suspense fallback={<LoadingSpinner />}>
                <TeamsFormPageContent orgId={orgId} tournamentId={tournamentId} />
            </Suspense>
        </div>
    );
}
