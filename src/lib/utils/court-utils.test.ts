import { findCourtName, getValidCourts } from "./court-utils";

describe("court-utils", () => {
    const mockCourts = [
        { courtId: "court-1", courtName: "Aコート" },
        { courtId: "court-2", courtName: "Bコート" },
        { courtId: "court-3", courtName: "Cコート" },
    ];

    describe("findCourtName", () => {
        it("returns court name when court exists", () => {
            const result = findCourtName("court-1", mockCourts);
            expect(result).toBe("Aコート");
        });

        it("returns courtId when court not found", () => {
            const result = findCourtName("court-999", mockCourts);
            expect(result).toBe("court-999");
        });

        it("returns courtId when courts array is empty", () => {
            const result = findCourtName("court-1", []);
            expect(result).toBe("court-1");
        });

        it("returns courtId when courts is undefined", () => {
            const result = findCourtName("court-1", undefined);
            expect(result).toBe("court-1");
        });

        it("returns courtId when courts is null", () => {
            const result = findCourtName("court-1", null);
            expect(result).toBe("court-1");
        });

        it("handles multiple courts correctly", () => {
            expect(findCourtName("court-1", mockCourts)).toBe("Aコート");
            expect(findCourtName("court-2", mockCourts)).toBe("Bコート");
            expect(findCourtName("court-3", mockCourts)).toBe("Cコート");
        });
    });

    describe("getValidCourts", () => {
        it("returns courts array when valid", () => {
            const result = getValidCourts(mockCourts);
            expect(result).toEqual(mockCourts);
        });

        it("returns empty array when courts is undefined", () => {
            const result = getValidCourts(undefined);
            expect(result).toEqual([]);
        });

        it("returns empty array when courts is null", () => {
            const result = getValidCourts(null);
            expect(result).toEqual([]);
        });

        it("returns empty array when courts is empty", () => {
            const result = getValidCourts([]);
            expect(result).toEqual([]);
        });

        it("returns courts array for single item", () => {
            const singleCourt = [{ courtId: "court-1", courtName: "Aコート" }];
            const result = getValidCourts(singleCourt);
            expect(result).toEqual(singleCourt);
        });
    });
});
