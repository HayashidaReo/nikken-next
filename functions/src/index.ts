import * as admin from "firebase-admin";

// Initialize Firebase Admin (must be done before importing functions that use it)
if (!admin.apps.length) {
    admin.initializeApp();
}

// Export functions
export * from "./features/organization/createOrganization";
