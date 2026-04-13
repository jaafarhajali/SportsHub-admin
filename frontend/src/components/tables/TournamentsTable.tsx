'use client'
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Actions from "../ui/actions/Actions";
import Pagination from "./Pagination";
import { toast } from "react-toastify";
import { getMyTournaments, getAllTournaments, deleteTournament } from "@/lib/api/dashboard/tournaments";
import { Tournament } from "@/types/Tournament";
import { useUser } from "@/context/UserContext";
import { getStadiumById } from "@/lib/api/stadium";
import EditTournamentModal from "../ui/modal/tournaments/EditTournamenModal";
import Loading from "../ui/loading";


interface TournamentsTableProps {
    tableData: Tournament[];
    setTableData: React.Dispatch<React.SetStateAction<Tournament[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function TournamentsTable({
    tableData,
    setTableData,
    loading,
    setLoading,
}: TournamentsTableProps) {

    const { user } = useUser();
    const [currentPage, setCurrentPage] = useState(1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const itemsPerPage = 5;

    // Calculate pagination using the fetched data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTournaments = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    async function loadTournaments() {
        try {
            setLoading(true);

            let res;
            if (user?.role === "admin") {
                res = await getAllTournaments();
            } else if (user?.role === "stadiumOwner") {
                res = await getMyTournaments();
            } else {
                toast.error("Unauthorized to view tournaments");
                return;
            }

            res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setTableData(res);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tournaments");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTournaments();
    }, []);

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setSelectedTournament(null);
        setEditModalOpen(false);
    };

    const handleTournamentUpdate = async (updatedTournament: Tournament) => {
        let fullStadium = updatedTournament.stadiumId;

        // If stadiumId is a string, fetch full stadium info
        if (typeof updatedTournament.stadiumId === "string") {
            try {
                const data = await getStadiumById(updatedTournament.stadiumId);
                fullStadium = data;
            } catch (err) {
                console.warn("Failed to fetch stadium after update.");
            }
        }

        const tournamentWithPopulatedStadium = {
            ...updatedTournament,
            stadiumId: fullStadium,
        };

        setTableData(prev =>
            prev.map(tournament =>
                tournament._id === tournamentWithPopulatedStadium._id
                    ? tournamentWithPopulatedStadium
                    : tournament
            )
        );

        toast.success("Tournament updated successfully!");
    };

    const handleDeleteTournament = async (tournamentId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this tournament?");
        if (!confirmDelete) return;

        try {
            setLoading(true);

            await deleteTournament(tournamentId);

            setTableData(prev => prev.filter(tournament => tournament._id !== tournamentId));
            toast.success("Torunament deleted successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error deleting tournament");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {/* Table headers remain the same */}
            <div className="w-full overflow-x-auto">
                <div>
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Name
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Description
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Entry Price
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Reward
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Max Teams
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Start Date
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    End Date
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Stadium
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Created At
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Action
                                </TableCell>

                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell className="py-10 text-center" colSpan={9}>
                                        <div className="flex justify-center">
                                            <Loading />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentTournaments.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-10 text-center" colSpan={9}>
                                        <div className="flex justify-center">
                                            No tournaments found
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentTournaments.map((tournament, index) => (
                                    <TableRow key={tournament._id}>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.name}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.description}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.entryPricePerTeam}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.rewardPrize}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.maxTeams}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(tournament.startDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(tournament.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {tournament.stadiumId?.name || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(tournament.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <Actions
                                                onEdit={() => handleEdit(tournament)}
                                                onDelete={() => handleDeleteTournament(tournament._id)}
                                                isLastRow={index === currentTournaments.length - 1}
                                            />
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && tableData.length > 0 && (
                <div className="flex justify-center py-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            <EditTournamentModal
                isOpen={editModalOpen}
                onClose={handleCloseEditModal}
                tournament={selectedTournament}
                onUpdate={handleTournamentUpdate}
            />

        </div>
    );
}