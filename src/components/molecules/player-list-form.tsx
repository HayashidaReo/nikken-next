"use client";

import { useFieldArray } from "react-hook-form";
import { Control, FieldErrors, UseFormRegister, UseFormSetFocus } from "react-hook-form";

import { AddButton } from "./action-buttons";
import { PlayerInputRow } from "./player-input-row";
import type { TeamFormData } from "@/types/team-form.schema";

interface PlayerListFormProps {
  control: Control<TeamFormData>;
  errors: FieldErrors<TeamFormData>;
  register: UseFormRegister<TeamFormData>;
  setFocus: UseFormSetFocus<TeamFormData>;
}

export function PlayerListForm({
  control,
  errors,
  register,
  setFocus,
}: PlayerListFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <PlayerInputRow
            key={field.id}
            index={index}
            register={register}
            error={errors.players?.[index]?.fullName}
            gradeError={errors.players?.[index]?.grade}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            control={control}
            onEnterSelect={() => {
              if (index === fields.length - 1) {
                append({ fullName: "", grade: "" });
                // レンダリング後に新しいフィールドにフォーカス
                setTimeout(() => {
                  setFocus(`players.${index + 1}.fullName`);
                }, 0);
              } else {
                // 次の行の姓にフォーカス
                setFocus(`players.${index + 1}.fullName`);
              }
            }}
          />
        ))}
      </div>

      <div className="pt-2">
        <AddButton
          onClick={() => append({ fullName: "", grade: "" })}
          className="w-full h-12 border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          <span className="flex items-center justify-center gap-2 font-medium">
            選手を追加する
          </span>
        </AddButton>

        {errors.players?.root && (
          <p className="text-red-500 text-sm mt-2 text-center">{errors.players.root.message}</p>
        )}
      </div>
    </div>
  );
}
