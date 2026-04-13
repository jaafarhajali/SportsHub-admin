import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getTournamentById, removeTeamFromTournament, addTeamToTournament } from "@/lib/api/dashboard/tournaments";
import { Team } from "@/types/Team";
import { toast } from "react-toastify";

interface TeamsSubTableProps {
  tournamentId: string;
  teams?: (string | { _id: string, name?: string })[];
  onTeamRemoved: (teamId: string) => void;
  onTeamAdded: (team: string | { _id: string, name?: string }) => void;
}

export default function TeamsSubTable({ tournamentId, teams = [], onTeamRemoved, onTeamAdded }: TeamsSubTableProps) {
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [newTeamId, setNewTeamId] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTournamentById(tournamentId);
        setTeamList(data.teams || []);
      } catch (error) {
        toast.error("Failed to load teams.");
      }
    };

    fetchTeams();
  }, [tournamentId]);

  const handleRemove = async (teamId: string) => {
    try {
      await removeTeamFromTournament(tournamentId, teamId);
      toast.success("Team removed.");
      setTeamList(prev => prev.filter(t => t._id !== teamId));
      onTeamRemoved(teamId);
    } catch (err) {
      toast.error("Failed to remove team.");
    }
  };

  const handleAdd = async () => {
    if (!newTeamId) return toast.warning("Select a team");

    try {
      await addTeamToTournament(tournamentId, newTeamId);
      toast.success("Team added.");
      onTeamAdded({ _id: newTeamId }); // Optionally fetch full team details
    } catch (err) {
      toast.error("Failed to add team.");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
      <h4 className="text-md font-bold text-gray-700 dark:text-white mb-2">Joined Teams</h4>
      <ul className="space-y-2">
        {teamList.map(team => (
          <li key={team._id} className="flex justify-between items-center bg-white dark:bg-stone-700 rounded-md p-2 shadow-sm">
            <span className="text-sm text-gray-700 dark:text-white">{team.name || team._id}</span>
            <button onClick={() => handleRemove(team._id)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 mt-4">
        <input
          type="text"
          placeholder="Enter team ID"
          value={newTeamId}
          onChange={(e) => setNewTeamId(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
        >
          Add Team
        </button>
      </div>
    </div>
  );
}
