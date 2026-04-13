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
import { getStadiumsByOwner, getAllStadiums, deleteStadium } from "@/lib/api/dashboard/stadiums";
import { Stadium } from "@/types/Stadium";
import EditStadiumModal from "../ui/modal/stadiums/EditStadiumModal";
import Loading from "../ui/loading";

interface StadiumsTableProps {
  tableData: Stadium[];
  setTableData: React.Dispatch<React.SetStateAction<Stadium[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StadiumsTable({
  tableData,
  setTableData,
  loading,
  setLoading,
}: StadiumsTableProps) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState<Stadium | null>(null);

  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStadiums = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  useEffect(() => {
    async function fetchStadiums() {
      setLoading(true);
      try {
        let stadiumsData = [];

        if (user?.role === 'admin') {
          stadiumsData = await getAllStadiums();
        } else if (user?.role === 'stadiumOwner') {
          stadiumsData = await getStadiumsByOwner(user.id);
        }

        const filteredStadium = stadiumsData.data.sort((a: Stadium, b: Stadium) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTableData(filteredStadium);
      } catch (error) {
        toast.error("Failed to load stadiums");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchStadiums();
  }, [setLoading, setTableData, user?.id, user?.role]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (stadium: Stadium) => {
    setSelectedStadium(stadium);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedStadium(null);
    setEditModalOpen(false);
  };

  const handleStadiumUpdate = (updatedStadium: Stadium) => {
    setTableData(prev =>
      prev.map(stadium => stadium._id === updatedStadium._id ? updatedStadium : stadium)
    );
    toast.success('Stadium updated successfully!');
  };

  const handleDeleteStadium = async (stadiumId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this stadium?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await deleteStadium(stadiumId);

      setTableData(prev => prev.filter(stadium => stadium._id !== stadiumId));
      toast.success("Stadium deleted successfully");
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error deleting stadium");
      } else {
        toast.error("Error deleting stadium");
      }
    } finally {
      setLoading(false);
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
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Owner</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Location</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Price/Match</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Max Players</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Working Hours</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Created At</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500">Action</TableCell>
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
            ) : currentStadiums.length === 0 ? (
              <TableRow>
                <TableCell className="py-10 text-center" colSpan={9}>
                  <div className="flex justify-center">
                    No stadiums found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentStadiums.map((stadium, index) => (
                <TableRow key={stadium._id}>
                  <TableCell className="px-5 py-4 sm:px-6">
                    <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                      {stadium.photos?.[0] ? (
                        <Image
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                          src={`http://localhost:8080${stadium.photos[0]}`}
                          alt={stadium.name}
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">N/A</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.ownerId.username}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.location}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.pricePerMatch.toLocaleString()} LBP</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">{stadium.maxPlayers}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {stadium.workingHours?.start} - {stadium.workingHours?.end}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    {new Date(stadium.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Actions
                      onEdit={() => handleEdit(stadium)}
                      onDelete={() => handleDeleteStadium(stadium._id)}
                      isLastRow={index === currentStadiums.length - 1}
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

      <EditStadiumModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        stadium={selectedStadium}
        onUpdate={handleStadiumUpdate}
      />
    </div>
  );
}
