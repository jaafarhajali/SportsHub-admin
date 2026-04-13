'use client'
import React, { useState } from "react";
import { Button } from "lebify-ui";
import { Modal } from "../index";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { toast } from "react-toastify";
import { PenaltyPolicy, Stadium, WorkingHours } from "@/types/Stadium";
import { addStadium } from "@/lib/api/dashboard/stadiums";
import { useUser } from "@/context/UserContext";

interface AddStadiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Stadium[]>>
}

const AddStadiumModal: React.FC<AddStadiumModalProps> = ({ isOpen, onClose, setTableData }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        photos: [] as File[],
        pricePerMatch: "",
        maxPlayers: "",
        penaltyPolicy: {
            hoursBefore: "",
            penaltyAmount: "",
        } as PenaltyPolicy,
        workingHours: {
            start: "",
            end: "",
        } as WorkingHours,
        ownerId: "",
    });

    const { user } = useUser();

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const [owners, setOwners] = useState<{ _id: string, username: string }[]>([]);
    const [ownersLoaded, setOwnersLoaded] = useState(false);

    const fetchOwners = async () => {
        if (ownersLoaded || user?.role !== "admin") return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/stadium-owners`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setOwners(data.data);
                setOwnersLoaded(true);
            }
        } catch (err) {
            console.error("Failed to load academy owners", err);
        }
    };

    // Handle input change for simple fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "pricePerMatch" || name === "maxPlayers") {
            // Allow only numbers
            if (!/^\d*$/.test(value)) return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle penaltyPolicy and workingHours nested fields
    const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, section: "penaltyPolicy" | "workingHours") => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: name === "hoursBefore" || name === "penaltyAmount" ? Number(value) : value,
            },
        }));
    };

    // Handle photo file selection (multiple allowed)
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            photos: files,
        }));
    };

    // Validate required fields
    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.pricePerMatch) newErrors.pricePerMatch = "Price per match is required";
        if (!formData.maxPlayers) newErrors.maxPlayers = "Max players is required";

        if (formData.penaltyPolicy.hoursBefore === "" || formData.penaltyPolicy.hoursBefore < 0)
            newErrors.penaltyPolicy_hoursBefore = "Valid hours before required";
        if (formData.penaltyPolicy.penaltyAmount === "" || formData.penaltyPolicy.penaltyAmount < 0)
            newErrors.penaltyPolicy_penaltyAmount = "Valid penalty amount required";

        if (!formData.workingHours.start) newErrors.workingHours_start = "Start time is required";
        if (!formData.workingHours.end) newErrors.workingHours_end = "End time is required";

        if (user?.role === "admin" && !formData.ownerId)
            newErrors.ownerId = "Owner is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            photos: [],
            pricePerMatch: "",
            maxPlayers: "",
            penaltyPolicy: { hoursBefore: "", penaltyAmount: "" },
            workingHours: { start: "", end: "" },
            ownerId: "",
        });
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("location", formData.location);
            data.append("pricePerMatch", formData.pricePerMatch.toString());
            data.append("maxPlayers", formData.maxPlayers.toString());
            data.append("penaltyPolicy", JSON.stringify(formData.penaltyPolicy));
            data.append("workingHours", JSON.stringify(formData.workingHours));

            formData.photos.forEach((file) => {
                data.append("photos", file, file.name);
            });

            if (formData.ownerId) {
                data.append("ownerId", formData.ownerId);
            }

            const newStadiumResponse = await addStadium(data);

            if (!newStadiumResponse.success) {
                toast.error(newStadiumResponse.message || "Failed to add stadium");
                return;
            }

            toast.success("Stadium added successfully");
            resetForm();
            onClose();
            setTableData(prev => [newStadiumResponse.data, ...prev]);

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while adding stadium");
        } finally {
            setLoading(false);
        }

    };

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }}>
            <div className="p-6">
                <h2 className="text-xl font-semibold pb-6 dark:text-white">Add New Stadium</h2>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">

                    {/* Name */}
                    <div>
                        <Label>
                            Stadium Name {errors.name && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter stadium name"
                            value={formData.name}
                            onChange={handleChange}
                            className={errors.name ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>

                    {/* Location */}
                    <div>
                        <Label>
                            Location {errors.location && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="Enter location"
                            value={formData.location}
                            onChange={handleChange}
                            className={errors.location ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.location && <FieldError message={errors.location} />}
                    </div>

                    {/* Price Per Match */}
                    <div>
                        <Label>
                            Price Per Match (LBP) {errors.pricePerMatch && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="pricePerMatch"
                            name="pricePerMatch"
                            type="text"
                            placeholder="Enter price per match"
                            value={formData.pricePerMatch}
                            onChange={handleChange}
                            className={errors.pricePerMatch ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.pricePerMatch && <FieldError message={errors.pricePerMatch} />}
                    </div>

                    {/* Max Players */}
                    <div>
                        <Label>
                            Max Players {errors.maxPlayers && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="maxPlayers"
                            name="maxPlayers"
                            type="text"
                            placeholder="Enter maximum players"
                            value={formData.maxPlayers}
                            onChange={handleChange}
                            className={errors.maxPlayers ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.maxPlayers && <FieldError message={errors.maxPlayers} />}
                    </div>

                    {/* Penalty Policy */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Penalty Policy - Hours Before {errors.penaltyPolicy_hoursBefore && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="hoursBefore"
                                name="hoursBefore"
                                type="number"
                                min={0}
                                placeholder="Hours before"
                                value={formData.penaltyPolicy.hoursBefore}
                                onChange={e => handleNestedChange(e, "penaltyPolicy")}
                                className={errors.penaltyPolicy_hoursBefore ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.penaltyPolicy_hoursBefore && <FieldError message={errors.penaltyPolicy_hoursBefore} />}
                        </div>

                        <div>
                            <Label>
                                Penalty Policy - Amount (LBP) {errors.penaltyPolicy_penaltyAmount && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="penaltyAmount"
                                name="penaltyAmount"
                                type="number"
                                min={0}
                                placeholder="Penalty amount"
                                value={formData.penaltyPolicy.penaltyAmount}
                                onChange={e => handleNestedChange(e, "penaltyPolicy")}
                                className={errors.penaltyPolicy_penaltyAmount ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.penaltyPolicy_penaltyAmount && <FieldError message={errors.penaltyPolicy_penaltyAmount} />}
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Working Hours - Start {errors.workingHours_start && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="start"
                                name="start"
                                type="time"
                                value={formData.workingHours.start}
                                onChange={e => handleNestedChange(e, "workingHours")}
                                className={errors.workingHours_start ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.workingHours_start && <FieldError message={errors.workingHours_start} />}
                        </div>

                        <div>
                            <Label>
                                Working Hours - End {errors.workingHours_end && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="end"
                                name="end"
                                type="time"
                                value={formData.workingHours.end}
                                onChange={e => handleNestedChange(e, "workingHours")}
                                className={errors.workingHours_end ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.workingHours_end && <FieldError message={errors.workingHours_end} />}
                        </div>
                    </div>

                    {user?.role === "admin" && (
                        <div>
                            <Label>Stadium Owner</Label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ownerId: e.target.value }))}
                                onClick={fetchOwners}
                                className="w-full border p-2 rounded-md"
                            >
                                <option value="">Select an owner</option>
                                {owners.map((owner) => (
                                    <option key={owner._id} value={owner._id}>
                                        {owner.username}
                                    </option>
                                ))}
                            </select>
                            {errors.ownerId && <FieldError message={errors.ownerId} />}
                        </div>
                    )}

                    {/* Photos Upload */}
                    <div>
                        <Label>Photos</Label>
                        <input
                            type="file"
                            name="photos"
                            multiple
                            accept="image/*"
                            onChange={handlePhotosChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-stone-700 dark:file:text-stone-200 dark:hover:file:bg-stone-600"
                        />
                        {formData.photos.length > 0 && formData.photos.map((file, i) => (
                            <p key={i} className="text-sm text-gray-600 mt-1">{file.name}</p>
                        ))}
                    </div>

                    <Button
                        type="submit"
                        variant="sea"
                        loading={loading}
                        loadingPosition="right"
                        loadingSpinner="circle"
                        hideTextWhenLoading
                        className="flex items-center justify-center w-full"
                    >
                        Add Stadium
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default AddStadiumModal;
