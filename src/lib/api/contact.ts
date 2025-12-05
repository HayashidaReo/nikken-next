import type { ContactFormData, FormSubmitResponse } from '@/types/contact';

/**
 * FormspreeのエンドポイントURL
 */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mblnkypz';

/**
 * Formspreeにフォームデータを送信する
 * @param data - お問い合わせフォームのデータ
 * @returns 送信結果
 */
export const submitContactForm = async (
    data: ContactFormData
): Promise<FormSubmitResponse> => {
    try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                ok: false,
                errors: errorData.errors || [
                    { field: 'general', message: '送信に失敗しました' },
                ],
            };
        }

        return { ok: true };
    } catch (error) {
        console.error('Form submission error:', error);
        return {
            ok: false,
            errors: [
                {
                    field: 'general',
                    message: 'ネットワークエラーが発生しました。後ほど再度お試しください。',
                },
            ],
        };
    }
};
