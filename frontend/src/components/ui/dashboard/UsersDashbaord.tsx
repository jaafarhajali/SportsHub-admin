'use client';
import { getAllUsers } from "@/lib/api/dashboard/users";
import { getAllRoles } from "@/lib/api/dashboard/roles";
import { toast } from "react-toastify";
import { Role } from "@/types/Role";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UsersTable from "@/components/tables/UsersTable";
import { exportTableToExcel } from "@/lib/api/dashboard/export";
import { User } from "@/types/User";
import { useState } from "react";
import AddUserModal from "../modal/users/AddUserModal";

export default function UsersDashboard() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [tableData, setTableData] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [users, rolesData] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
      ]);

      setTableData(users.data.users);
      setRoles(rolesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Users Table" />
      <div className="space-y-6">
        <ComponentCard
          title="Users Table"
          showAddButton
          addButtonText="Add User"
          onAddClick={handleAddUser}
          showExportButton={loading ? false : true}
          onExportClick={() => exportTableToExcel("users")}
          showRefreshButton
          onRefreshClick={fetchData}
        >
          <UsersTable
            tableData={tableData}
            setTableData={setTableData}
            loading={loading}
            setLoading={setLoading}
            roles={roles} // optional
          />
        </ComponentCard>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        setTableData={setTableData}
      />
    </div>
  );
}
