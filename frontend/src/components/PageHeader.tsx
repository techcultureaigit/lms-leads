import React from "react";
import Link from "next/link";
import { FaPlus, FaDownload, FaFilter, FaChevronRight } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showAddButton?: boolean;
  addButtonText?: string;
  addButtonHref?: string;
  onAddClick?: () => void;
  showExportButton?: boolean;
  onExportClick?: () => void;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  showAddButton = false,
  addButtonText = "Add New",
  addButtonHref,
  onAddClick,
  showExportButton = false,
  onExportClick,
  showFilterButton = false,
  onFilterClick,
  children,
}) => {
  return (
    <div className="mb-2 shrink-0">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <FaChevronRight className="w-3 h-3 text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#fbc40c] transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="hidden min-w-0 lg:block">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3 lg:justify-end">
        {showFilterButton && (
          <button
            onClick={onFilterClick}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium text-gray-700"
          >
            <FaFilter className="w-4 h-4" />
            Filter
          </button>
        )}
        {showExportButton && (
          <button
            onClick={onExportClick}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-medium text-gray-700"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        )}
        {showAddButton &&
          (addButtonHref ? (
            <Link
              href={addButtonHref}
              className="px-4 py-2 bg-[#fbc40c] hover:bg-[#D68108] text-white rounded-lg flex items-center gap-2 font-semibold transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              {addButtonText}
            </Link>
          ) : (
            <button
              onClick={onAddClick}
              className="px-4 py-2 bg-[#fbc40c] hover:bg-[#D68108] text-white rounded-lg flex items-center gap-2 font-semibold transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              {addButtonText}
            </button>
          ))}
        {children}
      </div>
      </div>
    </div>
  );
};

export default PageHeader;
