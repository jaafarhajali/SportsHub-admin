'use client'
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddAcademyModal from "@/components/ui/modal/academies/AddAcademyModal";
import { Academy } from "@/types/Academy";
import AcademiesTable from "@/components/tables/AcademiesTable";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { useUser } from "@/context/UserContext";
import { getAllAcademies } from "@/lib/api/academy";
import { getAcademyByOwner } from "@/lib/api/dashboard/academy";
import { toast } from "react-toastify";

export default function AcademiesDashbaord() {
  const { user } = useUser();
  const [isAddAcademyModalOpen, setIsAddAcademyModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Academy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);


  const handleAddAcademy = () => {
    setIsAddAcademyModalOpen(true);
  };

  const fetchAcademies = async () => {
    setLoading(true);
    try {
      let academiesData: Academy[] = [];

      if (user?.role === 'admin') {
        academiesData = await getAllAcademies();
      } else if (user?.role === 'academyOwner') {
        academiesData = await getAcademyByOwner(user.id);
      }

      academiesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTableData(academiesData);
    } catch (error) {
      toast.error("Failed to load academies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Academies Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Academiess Table"
          showAddButton={true}
          addButtonText="Add Academy"
          onAddClick={handleAddAcademy}
          showExportButton={loading ? false : true}
          onExportClick={() => exportTableToExcel("academies")}
          showRefreshButton={true}
          onRefreshClick={fetchAcademies}
        >
          <AcademiesTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
          />
        </ComponentCard>
      </div>

      {/* Add Academy Modal */}
      <AddAcademyModal
        isOpen={isAddAcademyModalOpen}
        onClose={() => setIsAddAcademyModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}