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
import { Role } from '@/types/Role';
import { updateRole } from '@/lib/api/dashboard/roles';

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    onUpdate: (updateRole: Role) => void;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
    isOpen,
    onClose,
    role,
    onUpdate
}) => {
    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (role) {
            setFormData(prev => ({
                ...prev,
                name: role.name || '',
            }));
        }
    }, [role]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name) newErrors.name = 'Name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role || !validate()) return;

        setLoading(true);

        try {
            const updated = await updateRole(role._id, formData);
            onUpdate(updated.data);
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update Role');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    if (!isOpen || !role) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6 w-full">
                <h2 className="text-xl font-bold">Edit Role</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>
                            Role Name {errors.name && <span className="text-error-500">*</span>}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Enter role name"
                            defaultValue={formData.name}
                            onChange={handleChange}
                            className={errors.name ? "border-l-3 border-l-red-500" : "border-l-3 border-l-green-700"}
                        />
                        {errors.name && <FieldError message={errors.name} />}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" variant="sea" loading={loading} className="w-full sm:w-auto">
                            {loading ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default EditRoleModal;
