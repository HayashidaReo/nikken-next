import { useMutation } from "@tanstack/react-query";

export interface PresentationTokenRequest {
    matchId: string;
    orgId: string;
    tournamentId: string;
}

export interface PresentationTokenResponse {
    token: string;
}

export interface TokenValidationResponse {
    matchId: string;
    orgId: string;
    tournamentId: string;
}

/**
 * プレゼンテーション用トークンを取得するMutation
 */
export function useGetPresentationToken() {
    return useMutation({
        mutationFn: async (request: PresentationTokenRequest) => {
            const response = await fetch("/api/presentation-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error("Failed to obtain presentation token");
            }

            const data = await response.json();
            return data.token as string;
        },
    });
}

/**
 * プレゼンテーション用トークンを検証するMutation
 */
export function useValidatePresentationToken() {
    return useMutation({
        mutationFn: async (token: string) => {
            const response = await fetch("/api/validate-presentation-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Token validation failed");
            }

            return response.json() as Promise<TokenValidationResponse>;
        },
    });
}
