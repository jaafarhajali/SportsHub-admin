'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TournamentsTable from "@/components/tables/TournamentsTable";
import { useUser } from "@/context/UserContext";
import { Tournament } from "@/types/Tournament";
import { useState } from "react";
import AddTournamentModal from "../modal/tournaments/AddTournamentModal";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { getMyTournaments } from "@/lib/api/dashboard/tournaments";
import { getAllTournaments } from "@/lib/api/tournaments";
import { toast } from "react-toastify";

export default function TournamentsDashboard() {
    const { user } = useUser();
    const [isAddTournamentModalOpen, setIsAddTournamentModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const handleAddTournament = () => {
        setIsAddTournamentModalOpen(true);
    };

    const fetchData = async () => {
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

            // Defensive: if res is an object with data property, use it, else use res itself
            const tournamentsArray = Array.isArray(res) ? res : res?.data ?? [];

            tournamentsArray.sort((a: Tournament, b: Tournament) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setTableData(tournamentsArray);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load tournaments");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <PageBreadcrumb pageTitle="Tournaments Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Tournaments Table"
                    showAddButton={true}
                    addButtonText="Add Tournament"
                    onAddClick={handleAddTournament}
                    showExportButton={loading ? false : true}
                    onExportClick={() => exportTableToExcel("tournaments")}
                    showRefreshButton
                    onRefreshClick={fetchData}
                >
                    <TournamentsTable
                        tableData={tableData}
                        setTableData={setTableData}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </ComponentCard>
            </div>


            <AddTournamentModal
                isOpen={isAddTournamentModalOpen}
                onClose={() => setIsAddTournamentModalOpen(false)}
                setTableData={setTableData}
            />
        </div>
    )
}