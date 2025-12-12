export interface Player {
    playerId: string;
    lastName: string;
    firstName: string;
    displayName: string;
    grade?: string;
}

export class DisplayNameHelper {
    static generateDisplayNames(players: Player[]): Player[] {
        const playersWithDisplayName = players.map(player => ({
            ...player,
            displayName: player.lastName,
        }));

        const lastNameGroups = this.groupByLastName(playersWithDisplayName);

        for (const [, playersInGroup] of lastNameGroups.entries()) {
            if (playersInGroup.length > 1) {
                this.resolveNameConflicts(playersInGroup);
            }
        }

        return playersWithDisplayName;
    }

    private static groupByLastName(players: Player[]): Map<string, Player[]> {
        const groups = new Map<string, Player[]>();

        for (const player of players) {
            const existing = groups.get(player.lastName) || [];
            existing.push(player);
            groups.set(player.lastName, existing);
        }

        return groups;
    }

    private static resolveNameConflicts(players: Player[]): void {
        let maxNameLength = 1;
        let resolved = false;

        while (!resolved && maxNameLength <= this.getMaxFirstNameLength(players)) {
            const displayNames = new Set<string>();
            let hasConflict = false;

            for (const player of players) {
                const namePart = this.getFirstNamePart(player.firstName, maxNameLength);
                const candidateDisplayName = `${player.lastName} ${namePart}`;

                if (displayNames.has(candidateDisplayName)) {
                    hasConflict = true;
                    break;
                }

                displayNames.add(candidateDisplayName);
            }

            if (!hasConflict) {
                for (const player of players) {
                    const namePart = this.getFirstNamePart(
                        player.firstName,
                        maxNameLength
                    );
                    player.displayName = `${player.lastName} ${namePart}`;
                }
                resolved = true;
            } else {
                maxNameLength++;
            }
        }

        if (!resolved) {
            for (const player of players) {
                player.displayName = `${player.lastName} ${player.firstName}`;
            }
        }
    }

    private static getFirstNamePart(firstName: string, length: number): string {
        return firstName.substring(0, length);
    }

    private static getMaxFirstNameLength(players: Player[]): number {
        return Math.max(...players.map(player => player.firstName.length));
    }

    public static splitPlayerName(fullName: string): { lastName: string; firstName: string } {
        const parts = fullName.trim().split(/[\s\u3000]+/);
        return {
            lastName: parts[0] || "",
            firstName: parts[1] || "",
        };
    }
}
