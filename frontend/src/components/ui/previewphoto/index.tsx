'use client';
import { useEffect, useState } from "react";

// Separate component for preview to handle URL cleanup properly
const ProfilePhotoPreview: React.FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="mt-2">
      <img
        src={previewUrl}
        alt="Profile preview"
        className="w-24 h-24 rounded-md object-cover"
      />
    </div>
  );
};

export default ProfilePhotoPreview;