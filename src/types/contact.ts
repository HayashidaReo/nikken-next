export interface ContactFormData {
    name: string;
    email: string;
    message: string;
    // Optional fields if needed in the future
    company?: string;
}

export interface FormSubmitResponse {
    ok: boolean;
    errors?: {
        field: string;
        message: string;
    }[];
}
