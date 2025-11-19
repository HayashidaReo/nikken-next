interface TournamentInfoProps {
  tournamentName: string;
  courtName: string;
  round: string;
  className?: string;
}

export function TournamentInfo({
  tournamentName,
  courtName,
  round,
  className = "",
}: TournamentInfoProps) {
  return (
    <div className={`flex items-center gap-8 text-white ${className}`}>
      <span className="text-4xl font-bold">{tournamentName}</span>
      <span className="text-4xl font-bold">{courtName}</span>
      <span className="text-4xl font-bold">{round}</span>
    </div>
  );
}
