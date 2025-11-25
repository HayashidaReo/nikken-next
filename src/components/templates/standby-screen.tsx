interface StandbyScreenProps {
  className?: string;
}

export function StandbyScreen({ className = "" }: StandbyScreenProps) {
  return (
    <div
      className={`w-full h-full bg-gray-900 flex items-center justify-center ${className}`}
    >
      <div className="text-center text-white">
        <h1 className="text-[10rem] font-bold mb-16 tracking-wider">準備中</h1>
      </div>
    </div>
  );
}
