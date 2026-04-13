'use client'
import React, { useState } from "react";
import { Button } from "lebify-ui";
import { Modal } from "../index";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { toast } from "react-toastify";
import { addAcademy } from "@/lib/api/dashboard/academy";
import { Academy } from "@/types/Academy";
import { useUser } from "@/context/UserContext";

interface AddAcademyModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Academy[]>>;
}

const AddAcademyModal: React.FC<AddAcademyModalProps> = ({ isOpen, onClose, setTableData }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        email: "",
        phoneNumber: "",
        photos: [] as File[],
        ownerId: "",
    });

    const { user } = useUser(); // must have user.role

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const [owners, setOwners] = useState<{ _id: string, username: string }[]>([]);
    const [ownersLoaded, setOwnersLoaded] = useState(false);

    const fetchOwners = async () => {
        if (ownersLoaded || user?.role !== "admin") return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/users/academy-owners`, {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, photos: files }));
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Valid email is required";
        if (!formData.phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Valid phone number is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            location: "",
            email: "",
            phoneNumber: "",
            photos: [],
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
            Object.entries(formData).forEach(([key, value]) => {
                if (key === "photos") {
                    formData.photos.forEach(file => data.append("photos", file));
                } else if (key === "ownerId" && formData.ownerId) {
                    data.append("ownerId", formData.ownerId);
                } else {
                    data.append(key, String(value));
                }
            });

            const response = await addAcademy(data);

            if (!response.success) {
                toast.error(response.message || "Failed to add academy");
                return;
            }

            toast.success("Academy added successfully");
            resetForm();
            onClose();
            setTableData(prev => [
                {
                    ...response.data,
                    ownerId: user,
                },
                ...prev,
            ]);

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while adding academy");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }}>
            <div className="p-6 max-w-xl w-full">
                <h2 className="text-xl font-semibold pb-6 dark:text-white">Add New Academy</h2>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">

                    {/* Name */}
                    <div>
                        <Label>Academy Name {errors.name && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="name"
                            type="text"
                            placeholder="Enter academy name"
                            defaultValue={formData.name}
                            onChange={handleChange}
                            className={errors.name ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>

                    {/* Location */}
                    <div>
                        <Label>Location {errors.location && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="location"
                            type="text"
                            placeholder="Enter location"
                            defaultValue={formData.location}
                            onChange={handleChange}
                            className={errors.location ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.location && <FieldError message={errors.location} />}
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email {errors.email && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter contact email"
                            defaultValue={formData.email}
                            onChange={handleChange}
                            className={errors.email ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.email && <FieldError message={errors.email} />}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <Label>Phone Number {errors.phoneNumber && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="phoneNumber"
                            type="text"
                            placeholder="e.g. +96171234567"
                            defaultValue={formData.phoneNumber}
                            onChange={handleChange}
                            className={errors.phoneNumber ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.phoneNumber && <FieldError message={errors.phoneNumber} />}
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            placeholder="Enter description"
                            value={formData.description}
                            className={`h-11 w-full rounded-lg border border-gray-300 outline-none appearance-none px-4 py-2.5 text-sm placeholder:text-gray-400 dark:bg-stone-950 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 ${errors.description ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}`}
                            onChange={handleChange}>
                        </textarea>
                    </div>

                    {user?.role === "admin" && (
                        <div>
                            <Label>Academy Owner</Label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onFocus={fetchOwners} // 👈 this triggers loading only on first focus
                                onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
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
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-stone-700 dark:file:text-stone-200 dark:hover:file:bg-stone-600"
                        />
                        {formData.photos.map((file, i) => (
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
                        Add Academy
                    </Button>
                </form>
            </div>
        </Modal>
    );
};

export default AddAcademyModal;