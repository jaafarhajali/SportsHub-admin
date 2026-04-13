'use client'

import { useEffect, useState } from 'react';
import { Modal } from '../index';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import FieldError from '@/components/helper/FieldError';
import { Button } from 'lebify-ui';
import { Academy } from '@/types/Academy';
import { toast } from 'react-toastify';
import { updateAcademy } from '@/lib/api/dashboard/academy';
import { useUser } from '@/context/UserContext';

interface EditAcademyModalProps {
    isOpen: boolean;
    onClose: () => void;
    academy: Academy | null;
    onUpdate: (updatedAcademy: Academy) => void;
}

export default function EditAcademyModal({
    isOpen,
    onClose,
    academy,
    onUpdate,
}: EditAcademyModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        phoneNumber: '',
        email: '',
        description: '',
        photos: [] as File[],
        ownerId: '',
    });

    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [owners, setOwners] = useState<{ _id: string, username: string }[]>([]);
    const [ownersLoaded, setOwnersLoaded] = useState(false);
    
    useEffect(() => {
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

        fetchOwners();
    }, [ownersLoaded, user]);

    useEffect(() => {
        if (academy) {
            setFormData(prev => ({
                ...prev,
                name: academy.name || '',
                location: academy.location || '',
                phoneNumber: academy.phoneNumber || '',
                email: academy.email || '',
                description: academy.description || '',
                photos: [],
                ownerId: typeof academy.ownerId === 'string' ? academy.ownerId : academy.ownerId?._id || '',
            }));
        }
    }, [academy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            photos: files,
        }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!academy || !validate()) return;

        setLoading(true);
        try {
            const updated = await updateAcademy(academy._id, formData);
            onUpdate(updated.data);
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update academy');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !academy) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6 w-full">
                <h2 className="text-xl font-bold mb-4">Edit Academy</h2>
                <form onSubmit={handleSubmit} encType='multipart/form-data' className="space-y-4">
                    <div>
                        <Label>Name {errors.name && <span className="text-error-500">*</span>}</Label>
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

                    <div>
                        <Label>Phone Number {errors.phoneNumber && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="phoneNumber"
                            type="text"
                            placeholder="Enter phone number"
                            defaultValue={formData.phoneNumber}
                            onChange={handleChange}
                            className={errors.phoneNumber ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.phoneNumber && <FieldError message={errors.phoneNumber} />}
                    </div>

                    <div>
                        <Label>Email {errors.email && <span className="text-error-500">*</span>}</Label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            defaultValue={formData.email}
                            onChange={handleChange}
                            className={errors.email ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.email && <FieldError message={errors.email} />}
                    </div>

                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                            className={`h-11 w-full rounded-lg border border-gray-300 outline-none appearance-none px-4 py-2.5 text-sm placeholder:text-gray-400 dark:bg-stone-950 dark:text-white/90 dark:placeholder:text-white/30 dark:border-gray-700 ${errors.description ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}`}
                            rows={3}
                        />
                        {errors.description && <FieldError message={errors.description} />}
                    </div>

                    {user?.role === "admin" && (
                        <div>
                            <Label>Academy Owner</Label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
                                className="w-full border p-2 rounded-md dark:bg-stone-950 dark:text-white dark:border-gray-700"
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
                        {formData.photos.length > 0 && formData.photos.map((file, i) => (
                            <p key={i} className="text-sm text-gray-600 mt-1">{file.name}</p>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="sea"
                            onClick={handleClose}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="sea"
                            loading={loading}
                            className="flex-1 sm:flex-none"
                        >
                            {loading ? 'Updating...' : 'Update Academy'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}