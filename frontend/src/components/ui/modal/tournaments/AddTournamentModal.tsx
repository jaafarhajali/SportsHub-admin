'use client';
import React, { useState, useEffect } from "react";
import { Button } from "lebify-ui";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { toast } from "react-toastify";
import { addTournament } from "@/lib/api/dashboard/tournaments";
import { getAllStadiums, getStadiumsByOwner } from "@/lib/api/dashboard/stadiums";
import { useUser } from "@/context/UserContext";
import { Tournament } from "@/types/Tournament";

interface AddTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Tournament[]>>
}

const AddTournamentModal: React.FC<AddTournamentModalProps> = ({
    isOpen,
    onClose,
    setTableData,
}) => {
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        entryPricePerTeam: "",
        rewardPrize: "",
        maxTeams: "",
        startDate: "",
        endDate: "",
        stadiumId: "",
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [stadiums, setStadiums] = useState([]);

    useEffect(() => {
        async function fetchStadiums() {
            try {
                const ownerId = user?.id;
                console.log(ownerId);
                if (!ownerId) {
                    toast.error("No owner ID found.");
                    return;
                }

                const data = user?.role === 'admin'
                    ? await getAllStadiums()
                    : await getStadiumsByOwner(ownerId);

                setStadiums(data.data);

                if (data.length === 1) {
                    setFormData((prev) => ({ ...prev, stadiumId: data[0]._id }));
                    console.log("Auto-selected stadium ID:", data[0]._id);
                } else if (data.length === 0) {
                    console.warn("No stadiums found for this owner.");
                }
            } catch (error) {
                console.error("Failed to fetch stadiums", error);
                toast.error("Failed to fetch your stadium");
            }
        }

        if (isOpen) {
            fetchStadiums();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const newErrors: any = {};

        // Required field validation
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.entryPricePerTeam) newErrors.entryPricePerTeam = "Entry price is required";
        if (!formData.rewardPrize) newErrors.rewardPrize = "Reward prize is required";
        if (!formData.maxTeams) newErrors.maxTeams = "Max teams is required";
        if (!formData.startDate) newErrors.startDate = "Start date is required";
        if (!formData.endDate) newErrors.endDate = "End date is required";
        if (!formData.stadiumId) newErrors.stadiumId = "Stadium is required";

        // Stop here if missing fields
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the validation errors.");
            setLoading(false);
            return;
        }

        // ✅ Date validation
        const now = new Date();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start < now) {
            toast.error("Start date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (end < now) {
            toast.error("End date cannot be in the past.");
            setLoading(false);
            return;
        }

        if (end < start) {
            toast.error("End date cannot be before the start date.");
            setLoading(false);
            return;
        }

        // ✅ Proceed to submit
        try {
            const newTournament = await addTournament(formData);
            toast.success("Tournament created!");
            onClose();
            setTableData(prev => [newTournament.data, ...prev]);
        } catch (err: any) {
            toast.error("Failed to add tournament");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 max-w-xl w-full">
                <h2 className="text-xl font-semibold pb-6 dark:text-white">Add New Tournament</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <Label>Name</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input name="description" value={formData.description} onChange={handleChange} />
                        {errors.description && <FieldError message={errors.description} />}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Entry Price Per Team</Label>
                            <Input name="entryPricePerTeam" value={formData.entryPricePerTeam} onChange={handleChange} />
                            {errors.entryPricePerTeam && <FieldError message={errors.entryPricePerTeam} />}
                        </div>
                        <div>
                            <Label>Reward Prize</Label>
                            <Input name="rewardPrize" value={formData.rewardPrize} onChange={handleChange} />
                            {errors.rewardPrize && <FieldError message={errors.rewardPrize} />}
                        </div>
                    </div>
                    <div>
                        <Label>Max Teams</Label>
                        <Input name="maxTeams" value={formData.maxTeams} onChange={handleChange} />
                        {errors.maxTeams && <FieldError message={errors.maxTeams} />}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Start Date</Label>
                            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                            {errors.startDate && <FieldError message={errors.startDate} />}
                        </div>
                        <div>
                            <Label>End Date</Label>
                            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                            {errors.endDate && <FieldError message={errors.endDate} />}
                        </div>
                    </div>
                    <div>
                        <Label>Stadium</Label>
                        <select
                            name="stadiumId"
                            value={formData.stadiumId}
                            onChange={handleChange}
                            className="w-full rounded border px-3 py-2 placeholder:text-gray-400 dark:bg-stone-950 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700"
                        >
                            <option value="">Select a stadium</option>
                            {stadiums.map((stadium: any) => (
                                <option key={stadium._id} value={stadium._id}>
                                    {stadium.name}
                                </option>
                            ))}
                        </select>
                        {errors.stadiumId && <FieldError message={errors.stadiumId} />}
                    </div>
                    <Button type="submit" variant="sea" loading={loading} className="w-full">
                        Add Tournament
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default AddTournamentModal;
