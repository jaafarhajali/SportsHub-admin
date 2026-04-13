'use client';
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TeamsTable from "@/components/tables/TeamsTable";
import { Team } from "@/types/Team";
import React, { useState } from "react";
import { AddTeamModal } from "../modal/teams/AddTeamModal";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { getAllTeams } from "@/lib/api/dashboard/teams";


export default function TeamsDashboard() {
    const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
    const [tableData, setTableData] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const handleAddTeam = () => {
        setIsAddTeamModalOpen(true);
    };

    const fetchTeams = async () => {
        setLoading(true);
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

    return (
        <div>
            <PageBreadcrumb pageTitle="Teams Table" />
            <div className="space-y-6">
                <ComponentCard
                    title="Teams Table"
                    showAddButton={true}
                    addButtonText="Add Team"
                    onAddClick={handleAddTeam}
                    showExportButton={loading ? false : true}
                    onExportClick={() => exportTableToExcel("teams")}
                    showRefreshButton
                    onRefreshClick={fetchTeams}
                >
                    <TeamsTable
                        tableData={tableData}
                        setTableData={setTableData}
                        loading={loading}
                        setLoading={setLoading}
                    />
                </ComponentCard>
            </div>

            {/* Add User Modal */}
            <AddTeamModal
                isOpen={isAddTeamModalOpen}
                onClose={() => setIsAddTeamModalOpen(false)}
                setTableData={setTableData}
            />
        </div>
    );
}
