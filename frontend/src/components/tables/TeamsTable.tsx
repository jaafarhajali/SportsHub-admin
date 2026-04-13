'use client';
import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Pagination from "./Pagination";
import Actions from "../ui/actions/Actions";
import { toast } from "react-toastify";
import { getAllTeams, deleteTeam } from "@/lib/api/dashboard/teams";
// import EditTeamModal from "../ui/modal/teams/EditTeamModal";
import { Team } from "@/types/Team";
import EditTeamModal from "../ui/modal/teams/EditTeamModal";
import { getAllUsers } from '@/lib/api/dashboard/users'; // Adjust path if needed
import { User } from '@/types/User';
import Loading from "../ui/loading";

interface TeamsTableProps {
    tableData: Team[];
    setTableData: React.Dispatch<React.SetStateAction<Team[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const TeamsTable: React.FC<TeamsTableProps> = ({
    tableData,
    setTableData,
    loading,
    setLoading,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeams = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teams = await getAllTeams();
                const sortedTeams = teams.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setTableData(sortedTeams);
            } catch (error) {
                console.error("Failed to fetch teams:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [setLoading, setTableData]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getAllUsers();
                setAllUsers(res.data.users || []);
            } catch (err) {
                toast.error("Failed to load users");
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this team?");
        if (!confirmed) return;

        try {
            await deleteTeam(id);
            toast.success("Team deleted successfully");
            setTableData(prev => prev.filter(team => team._id !== id));
        } catch (error) {
            console.error("Failed to delete team:", error);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenEditModal = (team: Team) => {
        setSelectedTeam(team);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedTeam(null);
    };

    const handleTeamUpdate = (updated: Team) => {
        setTableData(prev => prev.map(t => (t._id === updated._id ? updated : t)));
        toast.success("Team updated successfully");
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Team</TableCell>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Leader</TableCell>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Members</TableCell>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Created At</TableCell>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Updated At</TableCell>
                            <TableCell isHeader className="text-center text-theme-xs px-5 py-3 text-gray-500 dark:text-gray-400">Action</TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="px-5 py-4 text-center">
                                    <div className="flex justify-center">
                                        <Loading />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentTeams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="px-5 py-4 text-center">
                                    <div className="flex justify-center">
                                        No teams found
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentTeams.map((team, index) => (
                                <TableRow key={team._id}>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">{team.name}</TableCell>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">{team.leader?.username || "N/A"}</TableCell>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center max-h-24 overflow-y-auto custom-scrollbar">
                                            {team.members?.length > 0 ? (
                                                team.members.map((member, i) => (
                                                    <span key={i} className="text-xs text-gray-700 dark:text-gray-300">
                                                        {member.username}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs italic text-gray-400">No members</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(team.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(team.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-center text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                                        <Actions
                                            onEdit={() => handleOpenEditModal(team)}
                                            onDelete={() => handleDelete(team._id)}
                                            isLastRow={index === currentTeams.length - 1}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {!loading && tableData.length > 0 && (
                <div className="flex justify-center py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {selectedTeam && (
                <EditTeamModal
                    isOpen={editModalOpen}
                    onClose={handleCloseEditModal}
                    team={selectedTeam}
                    allUsers={allUsers}
                    onUpdate={handleTeamUpdate}
                />
            )}
        </div>
    );
};

export default TeamsTable;
