// Mappers
export { TeamMapper } from "./mappers/team-mapper";
export type { FirestoreTeamDoc, FirestorePlayerDoc } from "./mappers/team-mapper";

// Firebase Data Access
export { TeamData } from "./firebase/team-data";

// Collections and References
export {
    clientCollections,
    clientDocs,
    adminCollections,
    adminDocs,
    pathBuilder
} from "./firebase/collections";