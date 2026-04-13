import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, XCircle } from 'lucide-react';

interface ActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  isLastRow?: boolean; // Add this prop to identify the last row
  deleteLabel?: string; 
}

const Actions: React.FC<ActionsProps> = ({ onEdit, onDelete, isLastRow = false, deleteLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const DeleteIcon = deleteLabel?.toLowerCase() === "cancel" ? XCircle : Trash2;

  return (
    <div className="relative" ref={actionRef}>
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className={`absolute right-full mr-3 ${isLastRow ? 'bottom-0' : 'top-0'} w-36 bg-white dark:bg-stone-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-stone-700`}>
          <div className="py-1">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <DeleteIcon className="h-4 w-4 mr-2" />
                {deleteLabel || "Delete"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;