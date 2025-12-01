import { DownloadContent } from "./content";

// GitHub Releases API response type (simplified)
export type GitHubRelease = {
    tag_name: string;
    name: string;
    published_at: string;
    assets: {
        name: string;
        browser_download_url: string;
        size: number;
    }[];
    html_url: string;
};

async function getLatestRelease(): Promise<GitHubRelease | null> {
    try {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github+json',
        };

        const res = await fetch(
            "https://api.github.com/repos/HayashidaReo/nikken-next/releases/latest",
            {
                headers,
                next: { revalidate: 0 } // 常に最新を取得
            }
        );

        if (!res.ok) {
            console.error("Failed to fetch release:", res.statusText);
            return null;
        }

        return res.json();
    } catch (error) {
        console.error("Error fetching release:", error);
        return null;
    }
}

export default async function DownloadPage() {
    const release = await getLatestRelease();

    const getAssetUrl = (pattern: RegExp) => {
        return release?.assets.find((asset) => pattern.test(asset.name))?.browser_download_url;
    };

    const macArmUrl = getAssetUrl(/arm64\.dmg$/);
    const macIntelUrl = getAssetUrl(/x64\.dmg$/);
    const winUrl = getAssetUrl(/\.exe$/);

    return (
        <DownloadContent
            release={release}
            macArmUrl={macArmUrl}
            macIntelUrl={macIntelUrl}
            winUrl={winUrl}
        />
    );
}

