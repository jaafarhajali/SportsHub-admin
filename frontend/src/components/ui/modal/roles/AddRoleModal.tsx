'use client'
import React, { useState } from "react";
import { Button } from "lebify-ui";
import { Modal } from "../index";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { addRole } from "@/lib/api/dashboard/roles";
import { toast } from 'react-toastify';
import { Role } from "@/types/Role";


interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<Role[]>>;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, setTableData }) => {

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setName(e.target.value);
    };


    const resetForm = () => {
        setName("");
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const newErrors: any = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const apiData = {
                name,
            };

            const newRole = await addRole(apiData);
            
            setTableData(prev => [...prev, newRole]);

            toast.success("Role added successfully");
            handleClose();
        } catch (err: any) {
            const errorMessage = err.message || "Failed to add role. Please try again.";
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6 max-w-xl w-full">
                <h2 className="text-xl font-semibold pb-10 dark:text-white">Add New Role</h2>

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="space-y-5">
                        {errors.general && (
                            <div className="flex items-center gap-2 text-error-500 text-sm pt-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <p>{errors.general}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <Label>
                                    Name {errors.name && <span className="text-error-500">*</span>}
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={ name }
                                    placeholder="Enter your name"
                                    onChange={handleChange}
                                    className={
                                        !errors.name
                                            ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                            : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                    }
                                />
                                {errors.name && <FieldError message={errors.name} />}
                            </div>
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
                            Add Role
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddRoleModal;