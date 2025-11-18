"use client";

import React from "react";
import { Switch } from "@/components/atoms/switch";
import { Label } from "@/components/atoms/label";

type SwitchLabelProps = {
    id?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    onLabel?: string;
    offLabel?: string;
    className?: string;
};

export const SwitchLabel: React.FC<SwitchLabelProps> = ({
    id = "switch-label",
    checked,
    onChange,
    onLabel = "On",
    offLabel = "Off",
    className,
}) => {
    return (
        <div className={className ?? "flex items-center gap-3"}>
            <Switch checked={checked} onCheckedChange={onChange} id={id} />
            <Label htmlFor={id} className="text-sm">
                {checked ? onLabel : offLabel}
            </Label>
        </div>
    );
};

export default SwitchLabel;
