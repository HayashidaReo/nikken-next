import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.PRESENTATION_TOKEN_SECRET || "dev-secret-change-in-production";
const TOKEN_EXPIRY = "5m"; // 5 minutes

interface TokenPayload {
    matchId: string;
    orgId: string;
    tournamentId: string;
    scope: "monitor-view";
    iat?: number;
    exp?: number;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // TODO: Add proper authentication check here
        // For now, we'll accept the request but in production you should verify the user session
        // Example: const session = await getServerSession(authOptions);
        // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { matchId, orgId, tournamentId } = body;

        // Validate required fields
        if (!matchId || !orgId || !tournamentId) {
            console.warn("[PresentationToken] Missing required fields", {
                hasMatchId: !!matchId,
                hasOrgId: !!orgId,
                hasTournamentId: !!tournamentId,
            });
            return NextResponse.json(
                { error: "Missing required fields: matchId, orgId, tournamentId" },
                { status: 400 }
            );
        }

        // Validate field formats (basic validation)
        if (typeof matchId !== "string" || typeof orgId !== "string" || typeof tournamentId !== "string") {
            console.warn("[PresentationToken] Invalid field types");
            return NextResponse.json(
                { error: "Invalid field types" },
                { status: 400 }
            );
        }

        // Create JWT payload
        const payload: TokenPayload = {
            matchId,
            orgId,
            tournamentId,
            scope: "monitor-view",
        };

        // Sign the token
        const token = jwt.sign(payload, TOKEN_SECRET, {
            expiresIn: TOKEN_EXPIRY,
            issuer: "nikken-next",
            audience: "monitor-display",
        });

        // Calculate expiry timestamp
        const decoded = jwt.decode(token) as { exp: number };
        const expiresAt = decoded.exp * 1000; // Convert to milliseconds

        // Log token issuance (for audit trail)
        const duration = Date.now() - startTime;
        console.log("[PresentationToken] Token issued", {
            matchId,
            orgId,
            tournamentId,
            expiresAt: new Date(expiresAt).toISOString(),
            duration: `${duration}ms`,
        });

        return NextResponse.json({
            token,
            expiresAt,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error("[PresentationToken] Token generation error:", error, {
            duration: `${duration}ms`,
        });
        return NextResponse.json(
            { error: "Failed to generate presentation token" },
            { status: 500 }
        );
    }
}
