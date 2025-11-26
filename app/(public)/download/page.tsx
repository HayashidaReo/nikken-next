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
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        };

        const res = await fetch(
            "https://api.github.com/repos/HayashidaReo/nikken-next/releases/latest",
            {
                headers,
                next: { revalidate: 1800 } // 30分ごとに再検証
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

    const macUrl = getAssetUrl(/\.dmg$/); // Universal DMG
    const winUrl = getAssetUrl(/\.exe$/);

    return (
        <DownloadContent
            release={release}
            macUrl={macUrl}
            winUrl={winUrl}
        />
    );
}

