"use client";

import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/utils";

interface FieldWithConflictProps {
    conflict?: boolean;
}

export function FieldWithConflict({ conflict = false, children }: PropsWithChildren<FieldWithConflictProps>) {
    return <div className={cn("rounded-md", conflict && "ring-2 ring-red-500")}>{children}</div>;
}
