import React from "react";

interface FieldErrorProps {
  message: string;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 text-error-500 text-sm pt-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v3a1 1 0 11-2 0V7zm0 4a1 1 0 112 0v3a1 1 0 11-2 0v-3z"
          clipRule="evenodd"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
};

export default FieldError;
