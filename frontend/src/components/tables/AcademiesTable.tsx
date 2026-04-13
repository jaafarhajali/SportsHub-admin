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
import Image from "next/image";
import Pagination from "./Pagination";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { Academy } from "@/types/Academy";
import { getAllAcademies, getAcademyByOwner, deleteAcademy } from "@/lib/api/dashboard/academy";
import EditAcademyModal from "../ui/modal/academies/EditAcademyModal";
import Loading from "../ui/loading";

interface AcademiesTableProps {
  tableData: Academy[];
  setTableData: React.Dispatch<React.SetStateAction<Academy[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AcademiesTable({
  tableData,
  setTableData,
  loading,
  setLoading,
}: AcademiesTableProps) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);

  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAcademies = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  useEffect(() => {
    async function fetchAcademies() {
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
    }

    fetchAcademies();
  }, [setLoading, setTableData, user?.id, user?.role]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenEditModal = (academy: Academy) => {
    setSelectedAcademy(academy);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedAcademy(null);
  };

  const handleAcademyUpdate = (updated: Academy) => {
    setTableData(prev =>
      prev.map((a) => (a._id === updated._id ? updated : a))
    );
    toast.success('Academy updated successfully!');
  };

  const handleDelete = async (academyId: string) => {
    if (confirm("Are you sure you want to delete this academy?")) {
      try {
        const result = await deleteAcademy(academyId);
        if (result.success) {
          toast.success("Academy deleted successfully");
          setTableData(prev => prev.filter(a => a._id !== academyId));
        } else {
          toast.error(result.message || "Failed to delete academy");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred while deleting the academy");
      }
    }
  };


  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Image</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Name</TableCell>
              {user?.role === "admin" && <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Owner</TableCell>}
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Description</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Location</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Phone</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Email</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Created At</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Action</TableCell>
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
            ) : currentAcademies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <div className="flex justify-center">
                    No Academies Founds
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentAcademies.map((academy, index) => (
                <TableRow key={academy._id}>
                  <TableCell className="px-5 py-4 sm:px-6">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                      {academy.photos && academy.photos.length > 0 ? (
                        <Image
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          src={`http://localhost:8080${academy.photos[0]}`}
                          alt={academy.name}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">N/A</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{academy.name}</TableCell>
                  {user?.role === "admin" && <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{academy.ownerId.username}</TableCell>}
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center max-w-xs truncate hover:whitespace-normal hover:bg-black/10 group relative">
                    <span className="truncate block group-hover:whitespace-normal group-hover:break-words group-hover:max-w-sm" title={academy.description}>
                      {academy.description}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{academy.location}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{academy.phoneNumber}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{academy.email}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {new Date(academy.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Actions
                      onEdit={() => handleOpenEditModal(academy)}
                      onDelete={() => handleDelete(academy._id)}
                      isLastRow={index === currentAcademies.length - 1}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

      <EditAcademyModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        academy={selectedAcademy}
        onUpdate={handleAcademyUpdate}
      />
    </div>
  );
}
