"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import { submitContactForm } from "@/lib/api/contact";

const contactSchema = z.object({
    name: z.string().min(1, "お名前を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    message: z.string().min(1, "お問い合わせ内容を入力してください"),
    company: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await submitContactForm(data);

            if (response.ok) {
                setSubmitSuccess(true);
                reset();
            } else {
                setSubmitError(response.errors?.[0]?.message || "送信に失敗しました");
            }
        } catch (error) {
            setSubmitError("予期せぬエラーが発生しました: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-lp-bg relative border-t border-white/5">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-lp-text mb-4">
                            お問い合わせ
                        </h2>
                        <p className="text-lp-text-muted">
                            ご質問やご要望がございましたら、お気軽にお問い合わせください。
                        </p>
                    </div>

                    <div className="bg-lp-secondary/30 border border-lp-primary/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
                        {submitSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-lp-text mb-4">送信完了</h3>
                                <p className="text-lp-text-muted mb-8">
                                    お問い合わせありがとうございます。<br />
                                    内容を確認の上、担当者よりご連絡させていただきます。
                                </p>
                                <button
                                    onClick={() => setSubmitSuccess(false)}
                                    className="px-6 py-2 bg-lp-secondary border border-white/10 text-lp-text rounded-full hover:bg-white/5 transition-colors"
                                >
                                    戻る
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-lp-text-muted">
                                            お名前 <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`w-full bg-lp-bg/50 border ${errors.name ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all`}
                                            placeholder="山田 太郎"
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-red-400 text-xs flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="company" className="text-sm font-medium text-lp-text-muted">
                                            会社名・団体名
                                        </label>
                                        <input
                                            id="company"
                                            type="text"
                                            className="w-full bg-lp-bg/50 border border-white/10 rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all"
                                            placeholder="株式会社〇〇"
                                            {...register("company")}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-lp-text-muted">
                                        メールアドレス <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        className={`w-full bg-lp-bg/50 border ${errors.email ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all`}
                                        placeholder="example@email.com"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-lp-text-muted">
                                        お問い合わせ内容 <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        rows={5}
                                        className={`w-full bg-lp-bg/50 border ${errors.message ? "border-red-500/50" : "border-white/10"} rounded-xl px-4 py-3 text-lp-text focus:outline-none focus:border-lp-primary/50 focus:ring-1 focus:ring-lp-primary/50 transition-all resize-none`}
                                        placeholder="内容をご記入ください"
                                        {...register("message")}
                                    />
                                    {errors.message && (
                                        <p className="text-red-400 text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.message.message}
                                        </p>
                                    )}
                                </div>

                                {submitError && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {submitError}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-lp-blue text-white font-bold py-4 rounded-xl hover:bg-lp-blue/90 transition-all shadow-lg shadow-lp-blue/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                送信中...
                                            </>
                                        ) : (
                                            <>
                                                送信する
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
