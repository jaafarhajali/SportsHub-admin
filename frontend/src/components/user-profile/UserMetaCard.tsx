"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
// Update the import path below to the correct location of your Button component
import { Button } from "lebify-ui";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import { updateUser } from "@/lib/api/users";


export default function UserMetaCard() {
  const { user, refreshUser } = useUser();
  const { isOpen, openModal, closeModal } = useModal();
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formValues, setFormValues] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    profilePhoto: user?.profilePhoto || null
  });

  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    refreshUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);




  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);

    const formData = new FormData();
    const { username, email, phoneNumber } = formValues;

    // Append only if values changed
    if (username && username.trim() !== user.username) {
      formData.append("username", username.trim());
    }

    if (email && email.trim() !== user.email) {
      formData.append("email", email.trim());
    }

    if (phoneNumber && phoneNumber.trim() !== user.phoneNumber) {
      formData.append("phoneNumber", phoneNumber.trim());
    }

    if (imageFile) {
      formData.append("profilePhoto", imageFile);
    }

    // If no data was changed, abort
    if (![...formData.keys()].length) {
      console.log("No changes detected.");
      toast.warning("No changes detected.");
      closeModal();
      return;
    }

    try {
      const data = await updateUser(user.id, formData);

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("authStateChange"));
      }

      toast.success("Profile updated successfully");
      closeModal();
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/send-verification?platform=web`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Verification email sent");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Verification email error:", err);
      toast.error("Failed to send verification email");
    }
  };





  return (
    <>
      <div className="p-5 border border-gray-300 rounded-2xl bg-white dark:bg-stone-800 dark:border-stone-700 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="flex items-center justify-center w-20 h-20 overflow-hidden border border-gray-300 rounded-full dark:border-stone-700">
              {user && user.profilePhoto && user.profilePhoto !== "null" ? (
                <Image
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  src={
                    user.profilePhoto.startsWith('http')
                      ? user.profilePhoto
                      : `http://localhost:8080${user.profilePhoto}`
                  }
                  alt={user.username}
                />
              ) : (
                <span className="text-stone-900 dark:text-white font-medium text-3xl">
                  {user ? user.username.substring(0, 2).toUpperCase() : 'NA'}
                </span>
              )}
            </div>
            <div className="order-3 xl:order-2">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Username
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.username}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Email address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.email}
                  </p>
                </div>

                {user?.isVerified ? (
                  <span className="inline-flex items-center mt-2 gap-2 text-green-600 dark:text-green-400 text-sm font-semibold">
                    ✅ Verified
                  </span>
                ) : (
                  <button
                    onClick={handleVerifyEmail}
                    className="mt-2 inline-block px-4 py-1.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-full transition"
                  >
                    Verify Email
                  </button>
                )}

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.phoneNumber}
                  </p>
                </div>

              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm bg-transparent border border-gray-300 text-stone-900 hover:border-transparent hover:text-white dark:text-white dark:border-stone-700 dark:hover:border-transparent transition-colors hover:bg-[#1a7b9b] lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl p-4 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Edit Personal Information
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update your details to keep your profile up-to-date.
              </p>
            </div>
            <form
              className="flex flex-col"
              onSubmit={(e) => {
                e.preventDefault(); // ✅ Prevent default browser behavior
                handleSave();       // ✅ Trigger your custom save logic
              }}
            >
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">

                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Profile Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Username</Label>
                      <Input
                        type="text"
                        defaultValue={user?.username}
                        onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                        className="border-l-3 border-l-green-700 dark:border-l-green-500" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Email</Label>
                      <Input
                        type="text"
                        defaultValue={user?.email}
                        onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                        className="border-l-3 border-l-green-700 dark:border-l-green-500" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Phone</Label>
                      <Input
                        type="text"
                        defaultValue={user?.phoneNumber}
                        onChange={(e) => setFormValues({ ...formValues, phoneNumber: e.target.value })}
                        className="border-l-3 border-l-green-700 dark:border-l-green-500" />
                    </div>

                    <div className="col-span-2">
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
                    </div>
                    {previewImage && (
                      <div className="mt-3">
                        <Label>Preview</Label>
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-24 h-24 rounded-full object-cover mt-2"
                        />
                      </div>
                    )}

                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="medium" buttonType="outlined" onClick={closeModal}>
                  Close
                </Button>
                <Button variant="sea" size="medium" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
}
