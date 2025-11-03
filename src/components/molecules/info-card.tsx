"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/atoms/card";

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}