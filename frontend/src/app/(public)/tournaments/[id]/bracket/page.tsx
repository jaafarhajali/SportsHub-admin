import TournamentBracket from "@/components/ai/TournamentBracket";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BracketPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <TournamentBracket tournamentId={id} />
      </div>
    </div>
  );
}
