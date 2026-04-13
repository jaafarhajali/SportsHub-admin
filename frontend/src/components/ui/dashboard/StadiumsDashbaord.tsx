'use client';

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StadiumsTable from "@/components/tables/StadiumsTable";
import { Stadium } from "@/types/Stadium";
import { useState } from "react";
import AddStadiumModal from "../modal/stadiums/AddStadiumModal";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";
import { getAllStadiums } from "@/lib/api/stadium";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

export default function StadiumsDashboard() {

    const { user } = useUser();
    const [isAddStadiumModalOpen, setIsAddStadiumModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Stadium[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const handleAddStadium = () => {
        setIsAddStadiumModalOpen(true);
    };

    const fetchStadiums = async () => {
        setLoading(true);
        try {
            let stadiumsData: Stadium[] = [];

            if (user?.role === 'admin') {
                stadiumsData = await getAllStadiums();
            } else if (user?.role === 'stadiumOwner') {
                stadiumsData = await getStadiumsByOwner(user.id);
            }

            const filteredStadium = stadiumsData.sort(
                (a: Stadium, b: Stadium) =>
                    new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
            );

            setTableData(filteredStadium);
        } catch (error) {
            toast.error("Failed to load stadiums");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            <PageBreadcrumb pageTitle="Stadiums Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Stadiums Table"
                    showAddButton={true}
                    addButtonText="Add Stadium"
                    onAddClick={handleAddStadium}
                    showExportButton={loading ? false : true}
                    onExportClick={() => exportTableToExcel("stadiums")}
                    showRefreshButton
                    onRefreshClick={fetchStadiums}
                >
                    <StadiumsTable
                        tableData={tableData}
                        setTableData={setTableData}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </ComponentCard>
            </div>

            {/* Add User Modal */}
            <AddStadiumModal
                isOpen={isAddStadiumModalOpen}
                onClose={() => setIsAddStadiumModalOpen(false)}
                setTableData={setTableData}
            />
        </div>
    )
}