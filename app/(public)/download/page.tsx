import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Download, Monitor, Laptop } from "lucide-react";
import Link from "next/link";

// GitHub Releases API response type (simplified)
type GitHubRelease = {
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

    const macArmUrl = getAssetUrl(/arm64\.dmg$/);
    const macIntelUrl = getAssetUrl(/^(?!.*arm64).*\.dmg$/); // .dmg but not arm64
    const winUrl = getAssetUrl(/\.exe$/);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">デスクトップアプリをダウンロード</h1>
                    <p className="text-xl text-muted-foreground">
                        Nikken Next の最新バージョンを入手して、より快適な試合管理を体験しましょう。
                    </p>
                </div>

                {release ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    <Laptop className="h-6 w-6" />
                                    macOS
                                </CardTitle>
                                <CardDescription>バージョン: {release.tag_name}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {macArmUrl && (
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={macArmUrl}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Apple Silicon (M1/M2/M3)
                                        </Link>
                                    </Button>
                                )}
                                {macIntelUrl && (
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={macIntelUrl}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Intel Mac
                                        </Link>
                                    </Button>
                                )}
                                {!macArmUrl && !macIntelUrl && (
                                    <p className="text-sm text-muted-foreground">Mac版のインストーラーが見つかりませんでした。</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2">
                                    <Monitor className="h-6 w-6" />
                                    Windows
                                </CardTitle>
                                <CardDescription>バージョン: {release.tag_name}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {winUrl ? (
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={winUrl}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Windows (x64)
                                        </Link>
                                    </Button>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Windows版のインストーラーが見つかりませんでした。</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>リリース情報が見つかりませんでした</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                最新のリリース情報を取得できませんでした。GitHubのリリースページから直接ダウンロードしてください。
                            </p>
                            <Button asChild variant="outline">
                                <Link href="https://github.com/HayashidaReo/nikken-next/releases">
                                    GitHub Releases を開く
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="text-sm text-muted-foreground pt-8">
                    <p>
                        ※ macOSでアプリを開く際、「開発元を検証できません」という警告が表示される場合があります。
                        その場合は、Finderでアプリを右クリックして「開く」を選択してください。
                    </p>
                </div>
            </div>
        </div>
    );
}
