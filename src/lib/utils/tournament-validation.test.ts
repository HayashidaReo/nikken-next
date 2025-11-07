import { validateField } from "./tournament-validation";

describe("validateField", () => {
    test("required string field (tournamentName) should error on empty string", () => {
        const err = validateField("tournamentName", "");
        expect(err).not.toBeNull();
    });

    test("required string field (tournamentName) should error on whitespace only", () => {
        const err = validateField("tournamentName", "   ");
        expect(err).not.toBeNull();
    });

    test("optional field (tournamentId) should accept empty string as undefined and pass", () => {
        const err = validateField("tournamentId", "");
        expect(err).toBeNull();
    });

    test("optional date field (createdAt) should accept empty string as undefined and pass", () => {
        const err = validateField("createdAt", "");
        expect(err).toBeNull();
    });
});
