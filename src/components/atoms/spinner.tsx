import React from 'react';
import { Blocks } from 'react-loader-spinner';

/**
 * Spinner - ローディングインジケーター (Atom)
 *
 * 最小単位のUI要素として、おしゃれなスピナーを表示します。
 * react-loader-spinnerのThreeDotsアニメーションを使用。
 * サイズをpropsで制御可能で、さまざまな場所で再利用できます。
 */

interface SpinnerProps {
  /** スピナーのサイズ */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** カスタムクラス名 */
  className?: string;
  /** スピナーの色（デフォルトはprimary色） */
  color?: string;
}

const sizeConfig = {
  xs: { height: 30, width: 30 },
  sm: { height: 40, width: 40 },
  md: { height: 60, width: 60 },
  lg: { height: 80, width: 80 },
  xl: { height: 100, width: 100 },
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'hsl(var(--primary))'
}) => {
  const { height, width } = sizeConfig[size];

  return (
    <div className={className} role="status" aria-label="読み込み中">
      <Blocks
        height={height}
        width={width}
        color={color}
        ariaLabel="blocks-loading"
        wrapperStyle={{}}
        wrapperClass="blocks-wrapper"
        visible={true}
      />
    </div>
  );
};
