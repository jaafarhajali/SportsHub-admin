'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from '../';
import { getAllUsers } from '@/lib/api/dashboard/users';
import { createTeam } from '@/lib/api/dashboard/teams';
import { toast } from 'react-toastify';
import { Team } from '@/types/Team';
import { User } from '@/types/User';

interface AddTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Team[]>>

}

export const AddTeamModal: React.FC<AddTeamModalProps> = ({
    isOpen,
    onClose,
    setTableData,
}) => {
    const [name, setName] = useState('');
    const [leaderId, setLeaderId] = useState('');
    const [members, setMembers] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [availableLeaders, setAvailableLeaders] = useState<User[]>([]);
    const [availableMembers, setAvailableMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            const allUsers: User[] = res.data.users || [];

            // ✅ Filter users who can be team leaders (role === 'user')
            const leaders = allUsers.filter(user => user.role?.name === 'user');

            // ✅ Filter users who are not in a team (team === null)
            const members = allUsers.filter(user => user.team === null);

            setUsers(allUsers);
            setAvailableLeaders(leaders);
            setAvailableMembers(members);
        } catch (err) {
            toast.error("Failed to load users");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !leaderId) {
            toast.error('Team name and leader are required');
            return;
        }

        setLoading(true);

        try {
            const response = await createTeam(name, leaderId, members);
            toast.success('Team created successfully');
            onClose();
            setName('');
            setLeaderId('');
            setMembers([]);
            setTableData(prev => [response.team, ...prev]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (userId: string) => {
        setMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="p-6 w-[500px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Create New Team
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Team Name */}
                <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        Team Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                    />
                </div>

                {/* Team Leader */}
                <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        Team Leader
                    </label>
                    <select
                        value={leaderId}
                        onChange={(e) => setLeaderId(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg dark:bg-stone-800 dark:text-white"
                    >
                        <option value="">Select Leader</option>
                        {users
                            .filter((user) => user.role?.name === "user")
                            .map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.username}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Members (optional) */}
                <div>
                    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        Members (optional)
                    </label>
                    <div className="max-h-32 overflow-y-auto border rounded-lg p-2 dark:bg-stone-800 dark:text-white">
                        {users
                            .filter((user) => !user.team && user._id !== leaderId)
                            .map((user) => (
                                <label key={user._id} className="flex items-center gap-2 mb-1">
                                    <input
                                        type="checkbox"
                                        checked={members.includes(user._id)}
                                        onChange={() => toggleMember(user._id)}
                                    />
                                    <span>{user.username}</span>
                                </label>
                            ))}
                    </div>
                </div>


                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    {loading ? 'Creating...' : 'Create Team'}
                </button>
            </form>
        </Modal>
    );
};
