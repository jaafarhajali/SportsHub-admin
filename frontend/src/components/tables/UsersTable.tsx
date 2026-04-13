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
import Image from "next/image";
import Pagination from "./Pagination";
import { getAllUsers, deleteUser } from '@/lib/api/dashboard/users';
import { getAllRoles } from '@/lib/api/dashboard/roles';
import { Badge } from "lebify-ui"
import { User } from "@/types/User";
import { toast } from "react-toastify";
import EditUserModal from "../ui/modal/users/EditUserModal";
import { Role } from "@/types/Role";
import Loading from "../ui/loading";


interface UsersTableProps {
  tableData: User[];
  setTableData: React.Dispatch<React.SetStateAction<User[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  roles?: Role[];
}


export default function UsersTable({
  tableData,
  setTableData,
  loading,
  setLoading,
}: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add state for modal and roles
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both users and roles
        const [users, rolesData] = await Promise.all([
          getAllUsers(),
          getAllRoles()
        ]);

        setTableData(users.data.users);
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setTableData, setLoading]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      setTableData(prev => prev.filter(user => user._id !== id));
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Add edit handlers
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    // Update the user in the local state
    setTableData(prevUsers =>
      prevUsers.map(user =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );

    toast.success('User updated successfully!');
  };

  // Calculate pagination using the fetched data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
        <div>
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Profile Image
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Username
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Phone Number
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Verified
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
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="flex justify-center">
                      <Loading />
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="flex justify-center">
                      No Users Founds
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                        {user && user.profilePhoto && user.profilePhoto !== "null" ? (
                          <Image
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            src={
                              user.profilePhoto.startsWith('http')
                                ? user.profilePhoto
                                : `http://localhost:8080${user.profilePhoto}`
                            }
                            alt={user.username}
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {user ? user.username.substring(0, 2).toUpperCase() : 'NA'}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-5 py-4 sm:px-6 text-center">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.username}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.role?.name || 'No role assigned'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {user.phoneNumber}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {user.isActive ? (
                        <Badge variant="light" propColor="#33FF57" isBordered={false}>Active</Badge>
                      ) : (
                        <Badge variant="light" color="error">Inactive</Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                      {user.isVerified ? (
                        <Badge variant="light" propColor="#33FF57" isBordered={false}>Yes</Badge>
                      ) : (
                        <Badge variant="light" color="error">No</Badge>
                      )}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Actions
                        onEdit={() => handleEdit(user)}
                        onDelete={() => handleDelete(user._id)}
                        isLastRow={index === currentUsers.length - 1}
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
      {
        !loading && tableData.length > 0 && (
          <div className="flex justify-center py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )
      }

      {/* Fixed: EditUserModal with proper props */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        roles={roles}
        onUpdate={handleUserUpdate}
      />
    </div >
  );
}