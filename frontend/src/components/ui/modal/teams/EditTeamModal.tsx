'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from '../';
import { User } from '@/types/User';
import { Team } from '@/types/Team';
import { updateTeam } from '@/lib/api/dashboard/teams';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react'; // Using react-icons for trash icon

interface EditTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team | null;
    allUsers: User[];
    onUpdate: (updatedTeam: Team) => void;
}

const EditTeamModal: React.FC<EditTeamModalProps> = ({
    isOpen,
    onClose,
    team,
    allUsers,
    onUpdate,
}) => {
    const [name, setName] = useState('');
    const [leaderId, setLeaderId] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (team) {
            setName(team.name || '');
            setLeaderId(team.leader?._id || '');
            // Exclude leader from members list
            setMembers(
                team.members?.map((m) => m._id).filter((id) => id !== team.leader?._id) || []
            );
        }
    }, [team]);

    const toggleMember = (userId: string) => {
        setMembers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const removeMember = (userId: string) => {
        setMembers((prev) => prev.filter((id) => id !== userId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!team) return;

        if (!name || !leaderId) {
            toast.error('Team name and leader are required');
            return;
        }

        setLoading(true);
        try {
            const response = await updateTeam(team._id, { name, leaderId, members });
            onUpdate(response.team);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update team');
        } finally {
            setLoading(false);
        }
    };

    const eligibleLeaders = allUsers
        .filter((u) => u.role.name === 'user' || (team && u._id === team.leader?._id))
        .sort((a, b) => {
            if (team?.leader?._id === a._id) return -1;
            if (team?.leader?._id === b._id) return 1;
            return a.username.localeCompare(b.username);
        });
    // Members eligible: users with no team OR already in this team
    const eligibleMembers = allUsers.filter(
        (u) => !u.team || (team && u.team._id === team._id)
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton
            className="p-6 w-full max-w-lg dark:bg-stone-900 dark:text-white"
        >
            <h2 className="text-2xl font-semibold mb-6 text-center">Edit Team</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                        placeholder="Enter team name"
                    />
                </div>

                {/* Team Leader */}
                <div>
                    <label className="block text-sm font-medium mb-2">Team Leader</label>
                    <select
                        value={leaderId}
                        onChange={(e) => setLeaderId(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                    >
                        <option value="">Select Leader</option>
                        {eligibleLeaders.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Members - Badge list with trash */}
                <div>
                    <label className="block text-sm font-medium mb-2">Members</label>

                    {/* Badges for selected members */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {members.length === 0 && (
                            <span className="text-sm italic text-gray-500 dark:text-gray-400">
                                No members selected
                            </span>
                        )}
                        {members.map((memberId) => {
                            const user = allUsers.find((u) => u._id === memberId);
                            if (!user) return null;
                            return (
                                <span
                                    key={memberId}
                                    className="inline-flex items-center bg-blue-600 text-white rounded-full px-3 py-1 text-sm"
                                >
                                    {user.username}
                                    <button
                                        type="button"
                                        onClick={() => removeMember(memberId)}
                                        className="ml-2 hover:text-red-400"
                                        aria-label={`Remove ${user.username}`}
                                    >
                                        <Trash2 />
                                    </button>
                                </span>
                            );
                        })}
                    </div>

                    {/* Checkbox list for selecting/deselecting members */}
                    <div className="max-h-32 overflow-y-auto border rounded-lg p-2 dark:bg-stone-800 dark:text-white">
                        {eligibleMembers
                            .filter((u) => u._id !== leaderId)
                            .map((user) => (
                                <label
                                    key={user._id}
                                    className="flex items-center gap-2 mb-1 cursor-pointer select-none"
                                >
                                    <input
                                        type="checkbox"
                                        checked={members.includes(user._id)}
                                        onChange={() => toggleMember(user._id)}
                                        className="cursor-pointer"
                                    />
                                    <span>{user.username}</span>
                                </label>
                            ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition"
                >
                    {loading ? 'Updating...' : 'Update Team'}
                </button>
            </form>
        </Modal>
    );
};

export default EditTeamModal;
