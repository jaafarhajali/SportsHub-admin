'use client'
import React, { useState, useEffect } from "react";
import { Button } from "lebify-ui";
import { Modal } from "../index";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import FieldError from "@/components/helper/FieldError";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { addUser } from "@/lib/api/dashboard/users";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Checkbox from "@/components/form/input/Checkbox";
import ProfilePhotoPreview from "@/components/ui/previewphoto";
import { User } from "@/types/User";
import { Role } from "@/types/Role";


interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    setTableData: React.Dispatch<React.SetStateAction<User[]>>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, setTableData }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    const usernamePattern = /^[A-Za-z\s]+$/;
    const phoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        phoneNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        termsAccepted: false,
        profilePhoto: null as File | null,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = (checked: boolean) => {
        setIsChecked(checked);
        setFormData({ ...formData, termsAccepted: checked });
    };

    // Fetch roles when modal opens
    useEffect(() => {
        if (isOpen && roles.length === 0) {
            fetchRoles();
        }
    }, [isOpen]);

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await fetch('http://localhost:8080/api/roles');
            if (response.ok) {
                const rolesData = await response.json();
                setRoles(rolesData);
            } else {
                toast.error('Failed to fetch roles');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error('Error loading roles');
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({ ...formData, profilePhoto: file });
    };

    const resetForm = () => {
        setFormData({
            username: "",
            phoneNumber: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "",
            termsAccepted: false,
            profilePhoto: null,
        });
        setErrors({});
        setIsChecked(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
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

        if (!formData.username) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (formData.username.length > 30) {
            newErrors.username = "Username must be less than 30 characters";
        } else if (!usernamePattern.test(formData.username)) {
            newErrors.username = "Username should only contain letters and spaces";
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!phoneNumberPattern.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Invalid phone number! Use international format (e.g., +1234567890)";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailPattern.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters long";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = "Confirm password does not match";
        }

        if (!formData.role) {
            newErrors.role = "Role is required";
        }

        if (!formData.termsAccepted) {
            newErrors.checkbox = "You must agree to the terms conditions and privacy policy";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            const apiData = {
                username: formData.username,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.confirmPassword,
                role: formData.role,
                termsAccepted: formData.termsAccepted,
                profilePhoto: formData.profilePhoto,
            };

            const newUser = await addUser(apiData);

            // if (!newUser) {
            //     console.warn("User data is incomplete:", newUser);
            //     return;
            // }

            setTableData(prev => [...prev, newUser]);

            toast.success("User added successfully");
            handleClose();
        } catch (err: any) {
            const errorMessage = err.message || "Failed to add user. Please try again.";
            setErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="p-6">
                <h2 className="text-xl font-semibold pb-10 dark:text-white">Add New User</h2>

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
                            {/* Username */}
                            <div className="sm:col-span-1">
                                <Label>
                                    Username {errors.username && <span className="text-error-500">*</span>}
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    placeholder="Enter your username"
                                    onChange={handleChange}
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
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
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

                        {/* Email */}
                        <div>
                            <Label>
                                Email {errors.email && <span className="text-error-500">*</span>}
                            </Label>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={
                                    !errors.email
                                        ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                        : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                }
                            />
                            {errors.email && <FieldError message={errors.email} />}
                        </div>

                        {/* Password and Confirm Password */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Password */}
                            <div>
                                <Label>
                                    Password {errors.password && (<span className="text-error-500">*</span>)}
                                </Label>
                                <div className="relative">
                                    <Input
                                        placeholder="Enter your password"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={!errors.password ? `border-l-3 border-l-green-700 dark:border-l-green-500` : `border-l-3 border-l-red-500 dark:border-l-red-500`}
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                        )}
                                    </span>
                                </div>
                                {errors.password && <FieldError message={errors.password} />}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <Label>
                                    Confirm Password {errors.confirmPassword && <span className="text-error-500">*</span>}
                                </Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className={
                                            !errors.confirmPassword
                                                ? `border-l-3 border-l-green-700 dark:border-l-green-500`
                                                : `border-l-3 border-l-red-500 dark:border-l-red-500`
                                        }
                                    />
                                    <span
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                        ) : (
                                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                        )}
                                    </span>
                                </div>
                                {errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
                            </div>
                        </div>

                        {/* Role Select */}
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
                                onChange={handleChange}
                                name="role"
                            >
                                <option value="" disabled>
                                    Select a role
                                </option>
                                {loadingRoles ? (
                                    <option disabled>Loading roles...</option>
                                ) : (
                                    roles.map((role) => (
                                        <option key={role._id} value={role._id}>
                                            {role.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.role && <FieldError message={errors.role} />}
                        </div>

                        {/* Profile Photo Upload */}
                        <div>
                            <Label>Profile Photo</Label>
                            <input
                                type="file"
                                name="profilePhoto"
                                accept="image/*"
                                onChange={handleImageChange}
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

                        <div className="flex items-center gap-3">
                            <Checkbox
                                className="w-5 h-5"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                            />
                            <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-sm md:text-base">
                                By creating an account means you agree to the{" "}
                                <span className="text-gray-800 dark:text-white/90">
                                    Terms and Conditions,{" "}
                                </span>
                                and our{" "}
                                <span className="text-gray-800 dark:text-white">
                                    Privacy Policy
                                </span>
                            </p>
                        </div>
                        {errors.checkbox && <FieldError message={errors.checkbox} />}

                        <Button
                            type="submit"
                            variant="sea"
                            loading={loading}
                            loadingPosition="right"
                            loadingSpinner="circle"
                            hideTextWhenLoading
                            className="flex items-center justify-center w-full"
                        >
                            Add User
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddUserModal;