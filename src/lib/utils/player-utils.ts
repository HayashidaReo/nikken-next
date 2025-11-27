/**
 * 選手バリアントの型定義
 */
export type PlayerVariant = "red" | "white";



/**
 * 選手バリアントに応じたスタイルクラスを取得
 */
export const getPlayerVariantStyles = (variant: PlayerVariant) => {
  const styles = {
    red: {
      background: "bg-gradient-to-br from-red-600 to-red-800",
      text: "text-white",
      accent: "text-red-100",
    },
    white: {
      background: "bg-gradient-to-br from-gray-300 to-gray-400",
      text: "text-black",
      accent: "text-gray-700",
    },
  };

  return styles[variant];
};

/**
 * 選手バリアントに応じた表示名を取得
 */
export const getPlayerDisplayName = (
  variant: PlayerVariant,
  playerName?: string
): string => {
  const defaultNames = {
    red: "選手A",
    white: "選手B",
  };

  return playerName || defaultNames[variant];
};

/**
 * 選手の位置設定を取得（上から/下からの配置）
 */
export const getPlayerPositionClass = (variant: PlayerVariant): string => {
  return variant === "red"
    ? "absolute top-5 right-16"
    : "absolute bottom-5 right-16";
};
