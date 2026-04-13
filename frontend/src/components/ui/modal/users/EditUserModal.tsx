// components/EditUserModal.js
import { useState, useEffect } from 'react';
import { Modal } from '..';
import Label from '@/components/form/Label';
import FieldError from '@/components/helper/FieldError';
import Input from '@/components/form/input/InputField';
import ProfilePhotoPreview from '../../previewphoto';
import { Role } from '@/types/Role';
import { User } from '@/types/User';
import { updateUser } from '@/lib/api/dashboard/users';
import { toast } from 'react-toastify';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];
    onUpdate: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    user,
    roles,
    onUpdate
}) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        phoneNumber: '',
        isActive: true,
        profilePhoto: null as File | null
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Populate form when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                role: user.role?.id || '',
                phoneNumber: user.phoneNumber || '',
                isActive: user.isActive ?? true,
                profilePhoto: null
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: fileInput.files?.[0] || null
            }));
        } else if (type === 'checkbox') {
            const checkboxInput = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: checkboxInput.checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setErrors({});

        try {
            // Create FormData for file upload support
            const formDataToSend = new FormData();

            // Only include changed fields
            const originalUser = user;
            let hasChanges = false;

            if (formData.username !== originalUser.username) {
                formDataToSend.append('username', formData.username);
                hasChanges = true;
            }

            if (formData.email !== originalUser.email) {
                formDataToSend.append('email', formData.email);
                hasChanges = true;
            }

            if (formData.role !== (originalUser.role?.id || originalUser.role?._id)) {
                formDataToSend.append('role', formData.role);
                hasChanges = true;
            }

            if (formData.phoneNumber !== originalUser.phoneNumber) {
                formDataToSend.append('phoneNumber', formData.phoneNumber);
                hasChanges = true;
            }

            if (formData.isActive !== originalUser.isActive) {
                formDataToSend.append('isActive', formData.isActive.toString());
                hasChanges = true;
            }

            if (formData.profilePhoto) {
                formDataToSend.append('profilePhoto', formData.profilePhoto);
                hasChanges = true;
            }

            // Only send request if there are changes
            if (!hasChanges) {
                toast.info('No changes detected');
                setLoading(false);
                return;
            }

            const updatedUser = await updateUser(user._id, formData);

            // Call parent component's update handler
            onUpdate(updatedUser);
            onClose();

        } catch (err: any) {
            setErrors(err.message || 'Failed to update user');
            toast.error(err.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }   
    };

    const resetForm = () => {
        setErrors({});
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                role: user.role?.id || '',
                phoneNumber: user.phoneNumber || '',
                isActive: user.isActive ?? true,
                profilePhoto: null
            });
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className='p-6 w-full'>
                <h2 className="text-xl font-bold">Edit User</h2>

                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {/* Username */}
                        <div className="sm:col-span-1">
                            <Label>
                                Username {errors.username && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                defaultValue={formData.username}
                                placeholder="Enter your username"
                                onChange={handleInputChange}
                                className={
                                    !errors.username
                                        ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                        : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                }
                            />
                            {errors.username && <FieldError message={errors.username} />}
                        </div>

                        {/* Phone Number */}
                        <div className="sm:col-span-1">
                            <Label>
                                Phone Number {errors.phoneNumber && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                type="text"
                                id="phoneNumber"
                                name="phoneNumber"
                                defaultValue={formData.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                className={
                                    !errors.phoneNumber
                                        ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                        : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                }
                            />
                            {errors.phoneNumber && <FieldError message={errors.phoneNumber} />}
                        </div>
                    </div>

                    <div>
                        <Label>
                            Email {errors.email && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            type="email"
                            name="email"
                            defaultValue={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={
                                !errors.email
                                    ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                    : `border-l-3 border-l-red-500 dark:border-l-red-500`
                            }
                        />
                        {errors.email && <FieldError message={errors.email} />}
                    </div>

                    <div>
                        <Label>
                            Role {errors.role && <span className="text-error-500">*</span>}
                        </Label>
                        <select
                            className={`w-full rounded-md py-2 px-3 border border-gray-300 dark:border-gray-700 dark:bg-stone-950 dark:text-white/90 outline-none ${!errors.role
                                ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                }`}
                            value={formData.role}
                            onChange={handleInputChange}
                            name="role"
                        >
                            <option value="" disabled>
                                Select a role
                            </option>
                            {
                                roles.map((role) => (
                                    <option key={role._id} value={role._id}>
                                        {role.name}
                                    </option>
                                ))
                            }
                        </select>
                        {errors.role && <FieldError message={errors.role} />}
                    </div>

                    <div>
                        <Label>Profile Photo</Label>
                        <input
                            type="file"
                            name="profilePhoto"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-stone-700 dark:file:text-stone-200 dark:hover:file:bg-stone-600"
                        />
                        {formData.profilePhoto && (
                            <ProfilePhotoPreview file={formData.profilePhoto} />
                        )}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Active User
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditUserModal;