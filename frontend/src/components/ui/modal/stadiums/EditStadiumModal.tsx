'use client'

import { useState, useEffect } from 'react';
import { Modal } from '..';
import Label from '@/components/form/Label';
import FieldError from '@/components/helper/FieldError';
import { Button } from 'lebify-ui';
import { Stadium, WorkingHours } from '@/types/Stadium';
import { toast } from 'react-toastify';
import { updateStadium } from '@/lib/api/dashboard/stadiums';
import { useUser } from '@/context/UserContext';
import Input from '@/components/form/input/InputField';

interface EditStadiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    stadium: Stadium | null;
    onUpdate: (updatedStadium: Stadium) => void;
}

const EditStadiumModal: React.FC<EditStadiumModalProps> = ({
    isOpen,
    onClose,
    stadium,
    onUpdate
}) => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        photos: [] as File[],
        pricePerMatch: "",
        maxPlayers: "",
        penaltyPolicy: {
            hoursBefore: "",
            penaltyAmount: "",
        },
        workingHours: {
            start: "",
            end: "",
        } as WorkingHours,
        ownerId: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { user } = useUser();

    const [owners, setOwners] = useState<{ _id: string, username: string }[]>([]);
    const [ownersLoaded, setOwnersLoaded] = useState(false);

    useEffect(() => {
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
                console.error("Failed to load stadium owners", err);
            }
        };

        fetchOwners();
    }, [ownersLoaded, user]);


    useEffect(() => {
        if (stadium) {
            setFormData(prev => ({
                ...prev,
                name: stadium.name || '',
                location: stadium.location || '',
                pricePerMatch: stadium.pricePerMatch?.toString() || '',
                maxPlayers: stadium.maxPlayers?.toString() || '',
                workingHours: stadium.workingHours || { start: '', end: '' },
                penaltyPolicy: {
                    hoursBefore: stadium.penaltyPolicy?.hoursBefore?.toString() || '',
                    penaltyAmount: stadium.penaltyPolicy?.penaltyAmount?.toString() || '',
                },
                ownerId: typeof stadium.ownerId === 'string' ? stadium.ownerId : stadium.ownerId?._id || '',
                photos: [],
            }));
        }
    }, [stadium]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleNestedChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        section: 'workingHours' | 'penaltyPolicy'
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.pricePerMatch) newErrors.pricePerMatch = 'Price is required';
        if (!formData.maxPlayers) newErrors.maxPlayers = 'Max players is required';
        if (!formData.workingHours.start) newErrors.workingHours_start = 'Start time is required';
        if (!formData.workingHours.end) newErrors.workingHours_end = 'End time is required';
        if (!formData.penaltyPolicy.hoursBefore) newErrors.penaltyPolicy_hoursBefore = 'Hours before required';
        if (!formData.penaltyPolicy.penaltyAmount) newErrors.penaltyPolicy_penaltyAmount = 'Penalty amount required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stadium || !validate()) return;

        setLoading(true);

        try {
            const updated = await updateStadium(stadium._id, formData);
            onUpdate(updated.data);
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update stadium');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !stadium) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6 w-full">
                <h2 className="text-xl font-bold">Edit Stadium</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>
                            Stadium Name {errors.name && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter stadium name"
                            defaultValue={formData.name}
                            onChange={handleChange}
                            className={errors.name ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>

                    <div>
                        <Label>
                            Location {errors.location && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="location"
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
                        <Label>
                            Price Per Match (LBP) {errors.pricePerMatch && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="pricePerMatch"
                            name="pricePerMatch"
                            type="text"
                            placeholder="Enter price per match"
                            defaultValue={formData.pricePerMatch}
                            onChange={handleChange}
                            className={errors.pricePerMatch ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.pricePerMatch && <FieldError message={errors.pricePerMatch} />}
                    </div>

                    <div>
                        <Label>
                            Max Players {errors.maxPlayers && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="maxPlayers"
                            name="maxPlayers"
                            type="text"
                            placeholder="Enter maximum players"
                            defaultValue={formData.maxPlayers}
                            onChange={handleChange}
                            className={errors.maxPlayers ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.maxPlayers && <FieldError message={errors.maxPlayers} />}
                    </div>

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
                                defaultValue={formData.penaltyPolicy.hoursBefore}
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
                                defaultValue={formData.penaltyPolicy.penaltyAmount}
                                onChange={e => handleNestedChange(e, "penaltyPolicy")}
                                className={errors.penaltyPolicy_penaltyAmount ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.penaltyPolicy_penaltyAmount && <FieldError message={errors.penaltyPolicy_penaltyAmount} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Working Hours - Start {errors.workingHours_start && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="start"
                                name="start"
                                type="time"
                                defaultValue={formData.workingHours.start}
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
                                defaultValue={formData.workingHours.end}
                                onChange={e => handleNestedChange(e, "workingHours")}
                                className={errors.workingHours_end ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                            />
                            {errors.workingHours_end && <FieldError message={errors.workingHours_end} />}
                        </div>
                    </div>

                    {/* Stadium Owner (only for admins) */}
                    {user?.role === 'admin' && (
                        <div>
                            <Label>Stadium Owner</Label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={e => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
                                className="w-full border p-2 rounded-md"
                            >
                                <option value="">Select an owner</option>
                                {owners.map(owner => (
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

                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="sea" loading={loading} className="w-full sm:w-auto">
                            {loading ? 'Updating...' : 'Update Stadium'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditStadiumModal;
