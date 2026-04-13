'use client'
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

import Actions from "../ui/actions/Actions"
import Pagination from "./Pagination";
import { deleteRole, getAllRoles } from '@/lib/api/dashboard/roles';
import { Role } from "@/types/Role";
import { toast } from "react-toastify";
import EditRoleModal from "../ui/modal/roles/EditRoleModal";
import Loading from "../ui/loading";


interface RolesTableProps {
    tableData: Role[];
    setTableData: React.Dispatch<React.SetStateAction<Role[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function RolesTable({
    tableData,
    setTableData,
    loading,
    setLoading,
}: RolesTableProps) {

    const [currentPage, setCurrentPage] = useState(1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);


    const itemsPerPage = 5;
    // Calculate pagination using the fetched data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoles = tableData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(tableData.length / itemsPerPage);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const roles = await getAllRoles();
                roles.sort((a: Role, b: Role) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setTableData(roles);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, [setLoading, setTableData]);


    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Are you sure you want to delete this role?');
        if (!confirmed) return;

        try {
            await deleteRole(id);
            toast.success('Role deleted successfully');
            setTableData(prev => prev.filter(role => role._id !== id));
        } catch (error) {
            console.error('Failed to delete role:', error);
        }
    };

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleOpenEditModal = (role: Role) => {
        setSelectedRole(role);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setSelectedRole(null);
    };

    const handleRoleUpdate = (updated: Role) => {
        setTableData(prev =>
            prev.map((a) => (a._id === updated._id ? updated : a))
        );

        toast.success('Role updated successfully!');
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
                                    Role
                                </TableCell>

                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Created By
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                                >
                                    Updated By
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
                                    Updated At
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
                                    <TableCell colSpan={8} className="py-10 text-center">
                                        <div className="flex justify-center">
                                            <Loading />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentRoles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center">
                                        <div className="flex justify-center">
                                            No Roles Founds
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentRoles.map((role, index) => (
                                    <TableRow key={role._id}>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {role.name}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {role.createdBy?.username || 'N/A'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {role.updatedBy?.username || 'N/A'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(role.createdAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            {new Date(role.updatedAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                                            <Actions
                                                onEdit={() => handleOpenEditModal(role)}
                                                onDelete={() => handleDelete(role._id)}
                                                isLastRow={index === currentRoles.length - 1}
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

            <EditRoleModal
                isOpen={editModalOpen}
                onClose={handleCloseEditModal}
                role={selectedRole}
                onUpdate={handleRoleUpdate}
            />

        </div>
    );
}