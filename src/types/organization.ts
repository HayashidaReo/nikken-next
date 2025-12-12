export interface Organization {
    id: string;
    orgName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    adminUid: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationCreateData {
    orgName: string;
    representativeName: string;
    representativePhone: string;
    representativeEmail: string;
    adminEmail: string;
    adminPassword: string;
}
