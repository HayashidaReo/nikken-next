import { v4 as uuidv4 } from "uuid";

// --- Constants ---
export const DEMO_ROUNDS = [
    { roundId: "round_1", roundName: "1回戦" },
    { roundId: "round_2", roundName: "2回戦" },
    { roundId: "round_3", roundName: "3回戦" },
    { roundId: "round_semi", roundName: "準決勝" },
    { roundId: "round_final", roundName: "決勝" },
];

export const DEMO_COURTS = [
    { courtId: "court_a", courtName: "Aコート" },
    { courtId: "court_b", courtName: "Bコート" },
    { courtId: "court_c", courtName: "Cコート" },
    { courtId: "court_d", courtName: "Dコート" },
];

const LAST_NAMES = [
    "佐藤", "佐藤", "高橋", "田中", "伊藤", "渡辺", "山本", "中村", "小林", "加藤",
    "吉田", "山田", "佐々木", "山口", "松本", "井上", "木村", "林", "斎藤", "清水",
    "山崎", "森", "池田", "橋本", "阿部", "石川", "山下", "中島", "石井", "小川",
    "前田", "岡田", "長谷川", "藤田", "後藤", "近藤", "村上", "遠藤", "青木", "坂本"
];

const FIRST_NAMES = [
    "翔太", "拓海", "健太", "大輔", "直樹", "裕太", "優斗", "陸", "蓮", "陽翔",
    "美優", "結衣", "陽菜", "美咲", "七海", "未来", "愛", "遥", "彩", "花"
];

const GRADES = [
    { id: "none", label: "無級" },
    { id: "3k", label: "三級" },
    { id: "2k", label: "二級" },
    { id: "1k", label: "一級" },
    { id: "1d", label: "初段" },
    { id: "2d", label: "弍段" },
    { id: "3d", label: "参段" },
    { id: "4d", label: "四段" },
];

// --- Interfaces ---
export interface PlayerData {
    playerId: string;
    lastName: string;
    firstName: string;
    displayName: string;
    grade: string;
}

export interface TeamData {
    teamId: string;
    teamName: string;
    players: PlayerData[];
}

export interface MatchData {
    matchId: string;
    roundId: string; // round_1
    courtId: string; // court_a etc (random or fixed)
    sortOrder: number;
    playerA: {
        playerId: string;
        teamId: string;
        teamName: string; // For display convenience in some access patterns
        playerName: string; // For display
    };
    playerB: {
        playerId: string;
        teamId: string;
        teamName: string;
        playerName: string;
    };
    isCompleted: boolean;
}

// --- Generators ---

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateDemoTeams = (count: number = 8, playersPerTeam: number = 5): TeamData[] => {
    const teams: TeamData[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
        const teamId = uuidv4();
        const players: PlayerData[] = [];

        for (let j = 0; j < playersPerTeam; j++) {
            let last: string, first: string, full: string;
            let attempts = 0;
            do {
                last = getRandomElement(LAST_NAMES);
                first = getRandomElement(FIRST_NAMES);
                full = `${last} ${first}`;
                attempts++;
            } while (usedNames.has(full) && attempts < 50);
            usedNames.add(full);

            players.push({
                playerId: `player_${uuidv4()}`,
                lastName: last,
                firstName: first,
                displayName: last, // Simplified display name
                grade: getRandomElement(GRADES).id,
            });
        }

        teams.push({
            teamId,
            teamName: `チーム${String.fromCharCode(65 + i)}`, // チームA, チームB...
            players,
        });
    }
    return teams;
};

// Generate Individual Matches
export const generateDemoMatches = (teams: TeamData[]): MatchData[] => {
    const matches: MatchData[] = [];
    const targetMatchCount = 12;
    const teamPairsCount = Math.floor(teams.length / 2); // 4 pairs for 8 teams
    const playersPerTeam = teams[0].players.length; // 5

    let createdCount = 0;

    // Loop through player positions (Senpo, Jiho, etc.)
    for (let playerIdx = 0; playerIdx < playersPerTeam; playerIdx++) {
        // Loop through team pairs
        for (let pairIdx = 0; pairIdx < teamPairsCount; pairIdx++) {
            if (createdCount >= targetMatchCount) break;

            const teamA = teams[pairIdx * 2];
            const teamB = teams[pairIdx * 2 + 1];

            const pA = teamA.players[playerIdx];
            const pB = teamB.players[playerIdx];

            matches.push({
                matchId: uuidv4(),
                roundId: "round_1",
                courtId: DEMO_COURTS[createdCount % DEMO_COURTS.length].courtId,
                sortOrder: createdCount + 1,
                playerA: {
                    playerId: pA.playerId,
                    teamId: teamA.teamId,
                    teamName: teamA.teamName,
                    playerName: `${pA.lastName} ${pA.firstName}`,
                },
                playerB: {
                    playerId: pB.playerId,
                    teamId: teamB.teamId,
                    teamName: teamB.teamName,
                    playerName: `${pB.lastName} ${pB.firstName}`,
                },
                isCompleted: false,
            });
            createdCount++;
        }
    }

    return matches;
};
