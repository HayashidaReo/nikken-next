import jwt from "jsonwebtoken";

// トークン設定
const TOKEN_SECRET = process.env.PRESENTATION_TOKEN_SECRET || "dev-secret-change-in-production";
const TOKEN_EXPIRY = "5m"; // 5分
const TOKEN_ISSUER = "nikken-next";
const TOKEN_AUDIENCE = "monitor-display";

/**
 * プレゼンテーショントークンのペイロード型
 */
export interface TokenPayload {
    matchId: string;
    orgId: string;
    tournamentId: string;
    scope: "monitor-view";
    iat?: number;
    exp?: number;
}

/**
 * トークン生成パラメータ
 */
export interface GenerateTokenParams {
    matchId: string;
    orgId: string;
    tournamentId: string;
}

/**
 * トークン生成結果
 */
export interface GenerateTokenResult {
    token: string;
    expiresAt: number;
}

/**
 * トークン検証結果
 */
export interface ValidateTokenResult {
    valid: true;
    matchId: string;
    orgId: string;
    tournamentId: string;
}

/**
 * トークン検証エラー
 */
export class TokenValidationError extends Error {
    constructor(
        message: string,
        public readonly code: "EXPIRED" | "INVALID" | "SCOPE_MISMATCH" | "UNKNOWN"
    ) {
        super(message);
        this.name = "TokenValidationError";
    }
}

/**
 * プレゼンテーショントークンを生成する
 */
export function generatePresentationToken(params: GenerateTokenParams): GenerateTokenResult {
    const { matchId, orgId, tournamentId } = params;

    // バリデーション
    if (!matchId || !orgId || !tournamentId) {
        throw new Error("Missing required fields: matchId, orgId, tournamentId");
    }

    if (typeof matchId !== "string" || typeof orgId !== "string" || typeof tournamentId !== "string") {
        throw new Error("Invalid field types");
    }

    // JWTペイロードの作成
    const payload: TokenPayload = {
        matchId,
        orgId,
        tournamentId,
        scope: "monitor-view",
    };

    // トークンの署名
    const token = jwt.sign(payload, TOKEN_SECRET, {
        expiresIn: TOKEN_EXPIRY,
        issuer: TOKEN_ISSUER,
        audience: TOKEN_AUDIENCE,
    });

    // 有効期限のタイムスタンプを計算
    const decoded = jwt.decode(token) as { exp: number };
    const expiresAt = decoded.exp * 1000; // ミリ秒に変換

    return {
        token,
        expiresAt,
    };
}

/**
 * プレゼンテーショントークンを検証する
 */
export function validatePresentationToken(token: string): ValidateTokenResult {
    if (!token) {
        throw new TokenValidationError("Token not provided", "INVALID");
    }

    try {
        // トークンの検証とデコード
        const decoded = jwt.verify(token, TOKEN_SECRET, {
            issuer: TOKEN_ISSUER,
            audience: TOKEN_AUDIENCE,
        }) as TokenPayload;

        // スコープの検証
        if (decoded.scope !== "monitor-view") {
            throw new TokenValidationError("Invalid token scope", "SCOPE_MISMATCH");
        }

        return {
            valid: true,
            matchId: decoded.matchId,
            orgId: decoded.orgId,
            tournamentId: decoded.tournamentId,
        };
    } catch (error) {
        if (error instanceof TokenValidationError) {
            throw error;
        }

        if (error instanceof jwt.TokenExpiredError) {
            throw new TokenValidationError("Token has expired", "EXPIRED");
        }

        if (error instanceof jwt.JsonWebTokenError) {
            throw new TokenValidationError("Invalid token", "INVALID");
        }

        throw new TokenValidationError("Token validation failed", "UNKNOWN");
    }
}
