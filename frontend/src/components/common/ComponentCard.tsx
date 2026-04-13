'use client';
import React, { useState } from "react";
import { Button } from "lebify-ui";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;

  // Add button props
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonVariant?: "sea" | "primary" | "secondary";
  onAddClick?: () => void;
  addButtonIcon?: React.ReactNode;

  // Export button props
  showExportButton?: boolean;
  exportButtonText?: string;
  exportButtonVariant?: "sea" | "primary" | "secondary";
  onExportClick?: () => void;
  exportButtonIcon?: React.ReactNode;

  // Refresh button props
  showRefreshButton?: boolean;
  onRefreshClick?: () => void;
  refreshButtonIcon?: React.ReactNode;


  // Additional header actions
  headerActions?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  showAddButton = false,
  addButtonText = "Add",
  addButtonVariant = "sea",
  onAddClick,
  addButtonIcon,

  showExportButton = false,
  exportButtonText = "Export",
  exportButtonVariant = "secondary",
  onExportClick,

  showRefreshButton,
  onRefreshClick,

  exportButtonIcon,

  headerActions,
}) => {
  const defaultAddIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const defaultExportIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const defaultRefreshIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.13-3.36L23 10" />
      <path d="M20.49 15a9 9 0 01-14.13 3.36L1 14" />
    </svg>
  );

  return (
    <div className={`max-w-screen-lg rounded-2xl border border-gray-200 bg-white dark:border-stone-800 dark:bg-white/[0.03] ${className}`}>
      {/* Card Header */}
      <div className="px-6 py-5 flex justify-between items-center">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>

        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}

          {/* Export button */}
          {showExportButton && onExportClick && (
            <Button
              size="medium"
              hoverEffect="default"
              variant={exportButtonVariant}
              onClick={onExportClick}
              icon={exportButtonIcon || defaultExportIcon}
            >
              {exportButtonText}
            </Button>
          )}

          {/* Add button */}
          {showAddButton && onAddClick && (
            <Button
              size="medium"
              hoverEffect="default"
              variant={addButtonVariant}
              onClick={onAddClick}
              icon={addButtonIcon || defaultAddIcon}
            >
              {addButtonText}
            </Button>
          )}

          {showRefreshButton && onRefreshClick && (
            <Button
              size="large"
              hoverEffect="default"
              variant="basic"
              onClick={onRefreshClick}
              iconOnly={true}
              icon={defaultRefreshIcon}
            >
              {defaultRefreshIcon}
            </Button>
          )}
        </div>
      </div>

      {desc && <p className="px-6 text-sm text-gray-500 dark:text-gray-400">{desc}</p>}

      {/* Card Body */}
      <div className="p-4 border-t border-gray-200 dark:border-stone-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
