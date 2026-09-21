"use client";

import Link from "next/link";

export type PageCrumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  crumbs?: PageCrumb[];
  actions?: React.ReactNode;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden>
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PageHeader({
  title,
  crumbs,
  actions,
}: PageHeaderProps) {
  const trail = crumbs?.length
    ? crumbs
    : title
      ? [{ label: title }]
      : [];

  return (
    <div className="page-header">
      <div className="page-header-row">
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="page-crumb-home"
            aria-label="Dashboard home"
          >
            <HomeIcon />
          </Link>
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <span className="page-crumb-item" key={`${crumb.label}-${index}`}>
                <span className="page-crumb-sep" aria-hidden>
                  <ChevronIcon />
                </span>
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="page-crumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="page-crumb-current"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {actions ? <div className="dash-page-actions">{actions}</div> : null}
      </div>
    </div>
  );
}
