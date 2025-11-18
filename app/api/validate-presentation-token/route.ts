import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.PRESENTATION_TOKEN_SECRET || "dev-secret-change-in-production";

interface TokenPayload {
    matchId: string;
    orgId: string;
    tournamentId: string;
    scope: "monitor-view";
    iat: number;
    exp: number;
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    try {
        // Extract token from Authorization header or body
        const authHeader = request.headers.get("authorization");
        let token: string | null = null;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            const body = await request.json();
            token = body.token;
        }

        if (!token) {
            console.warn("[TokenValidation] Token not provided", { clientIp });
            return NextResponse.json(
                { error: "Token not provided" },
                { status: 401 }
            );
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, TOKEN_SECRET, {
            issuer: "nikken-next",
            audience: "monitor-display",
        }) as TokenPayload;

        // Validate token scope
        if (decoded.scope !== "monitor-view") {
            console.warn("[TokenValidation] Invalid token scope", {
                scope: decoded.scope,
                clientIp,
            });
            return NextResponse.json(
                { error: "Invalid token scope" },
                { status: 403 }
            );
        }

        const duration = Date.now() - startTime;

        // Log successful validation
        console.log("[TokenValidation] Token validated successfully", {
            matchId: decoded.matchId,
            orgId: decoded.orgId,
            tournamentId: decoded.tournamentId,
            clientIp,
            duration: `${duration}ms`,
        });

        // Token is valid, return the payload data
        return NextResponse.json({
            valid: true,
            matchId: decoded.matchId,
            orgId: decoded.orgId,
            tournamentId: decoded.tournamentId,
        });
    } catch (error) {
        const duration = Date.now() - startTime;

        if (error instanceof jwt.TokenExpiredError) {
            console.warn("[TokenValidation] Token expired", {
                clientIp,
                duration: `${duration}ms`,
            });
            return NextResponse.json(
                { error: "Token has expired" },
                { status: 401 }
            );
        }

        if (error instanceof jwt.JsonWebTokenError) {
            console.warn("[TokenValidation] Invalid token signature", {
                clientIp,
                duration: `${duration}ms`,
                errorMessage: error.message,
            });
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        console.error("[TokenValidation] Token validation error:", error, {
            clientIp,
            duration: `${duration}ms`,
        });
        return NextResponse.json(
            { error: "Token validation failed" },
            { status: 500 }
        );
    }
}
