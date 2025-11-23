import { useEffect, useRef, useCallback } from 'react';

/**
 * タイマーが0になったときにブザーを鳴らすフック
 * @param timeRemaining 残り時間（秒）
 */
export const useBuzzer = (timeRemaining: number) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevTimeRef = useRef(timeRemaining);

    useEffect(() => {
        // Audioオブジェクトの初期化
        // public/sounds/basketball_buzzer.mp3 を参照
        audioRef.current = new Audio('/sounds/basketball_buzzer.mp3');
        audioRef.current.load(); // プリロード
    }, []);

    const playBuzzer = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e) => {
                console.warn("ブザーの再生に失敗しました。ユーザーインタラクションが必要な可能性があります。", e);
            });
        }
    }, []);

    useEffect(() => {
        // 残り時間が 0 より大きい状態から 0 になった瞬間に再生
        if (prevTimeRef.current > 0 && timeRemaining === 0) {
            playBuzzer();
        }
        prevTimeRef.current = timeRemaining;
    }, [timeRemaining, playBuzzer]);

    return { playBuzzer };
};
