
interface StandbyScreenProps {
  className?: string;
}

export function StandbyScreen({ className = "" }: StandbyScreenProps) {
  return (
    <div
      className={`min-h-screen bg-gray-900 flex items-center justify-center ${className}`}
    >
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">準備中</h1>
        <p className="text-xl">試合開始をお待ちください</p>
      </div>
    </div>
  );
}
