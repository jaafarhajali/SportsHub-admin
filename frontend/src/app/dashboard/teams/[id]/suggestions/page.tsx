import TeamSuggestions from "@/components/skills/TeamSuggestions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeamSuggestionsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <TeamSuggestions teamId={id} />
    </div>
  );
}
