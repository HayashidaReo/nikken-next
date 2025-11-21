"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";
import type { ColumnDef } from "@/components/atoms/table-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Table, TableHeader, TableRow, TableBody, TableHead } from "@/components/atoms/table";

interface MatchTableProps {
    title?: string;
    columns: ColumnDef[];
    children: ReactNode;
    className?: string;
    headerRight?: ReactNode;
}

export function MatchTable({ title, columns, children, className, headerRight }: MatchTableProps) {
    return (
        <Card className={cn("w-full", className)}>
            {(title || headerRight) && (
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    {title ? <CardTitle className="text-xl">{title}</CardTitle> : <div />}
                    {headerRight ?? null}
                </CardHeader>
            )}

            <CardContent>
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow className="h-10">
                            {columns.map(col => (
                                <TableHead
                                    key={col.key}
                                    style={col.width ? { width: `${col.width}%` } : undefined}
                                    className={cn("px-3", col.className)}
                                >
                                    {col.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>{children}</TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default MatchTable;
