"use client";

import { useFieldArray } from "react-hook-form";
import { Control, FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

import { AddButton, RemoveButton } from "./action-buttons";
import type { TeamFormData } from "@/types/team-form.schema";

interface PlayerListFormProps {
  control: Control<TeamFormData>;
  errors: FieldErrors<TeamFormData>;
  register: UseFormRegister<TeamFormData>;
}

export function PlayerListForm({
  control,
  errors,
  register,
}: PlayerListFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="group relative flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all hover:bg-white hover:shadow-sm hover:border-blue-200"
          >
            <div className="flex-1">
              <Label
                htmlFor={`players.${index}.fullName`}
                className="text-xs font-medium text-gray-500 mb-1.5 block"
              >
                選手名 {index + 1}{" "}
                <span className="text-gray-400 font-normal ml-1">
                  （姓と名の間に半角スペース）
                </span>
              </Label>
              <Input
                {...register(`players.${index}.fullName`)}
                id={`players.${index}.fullName`}
                placeholder="例: 山田 太郎"
                className={`bg-white ${errors.players?.[index]?.fullName ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200"
                  }`}
              />
              {errors.players?.[index]?.fullName && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.players?.[index]?.fullName?.message}
                </p>
              )}
            </div>

            {fields.length > 1 && (
              <div className="pt-6">
                <RemoveButton
                  onClick={() => remove(index)}
                  className="h-10 w-10 p-0 rounded-full border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <AddButton
          onClick={() => append({ fullName: "" })}
          className="w-full h-12 border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <span className="flex items-center justify-center gap-2 font-medium">
            <span className="text-xl">+</span> 選手を追加する
          </span>
        </AddButton>

        {errors.players?.root && (
          <p className="text-red-500 text-sm mt-2 text-center">{errors.players.root.message}</p>
        )}
      </div>
    </div>
  );
}
