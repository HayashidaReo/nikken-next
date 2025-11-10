/**
 * URL utils related to front-end redirects
 */
export function getLoginRedirectUrl(): string | undefined {
    if (typeof window === "undefined") return undefined;
    try {
        return `${window.location.origin}/login`;
    } catch {
        return undefined;
    }
}

export default getLoginRedirectUrl;
