import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "../../styles/admin/breadcrumbNav.css";

/**
 * BreadcrumbNav - Hierarchical breadcrumb navigation component
 * Props:
 *   - segments: Array of {label, path} objects
 *               Last segment is non-clickable (current page)
 */
const BreadcrumbNav = ({ segments = [] }) => {
  if (!segments || segments.length === 0) return null;

  return (
    <nav className="bn-breadcrumb" aria-label="Breadcrumb">
      <div className="bn-breadcrumb-inner">
        {segments.map((segment, idx) => {
          const isLast = idx === segments.length - 1;
          return (
            <React.Fragment key={idx}>
              {isLast ? (
                <span className="bn-segment bn-segment--current">
                  {segment.label}
                </span>
              ) : (
                <Link to={segment.path} className="bn-segment bn-segment--link">
                  {segment.label}
                </Link>
              )}
              {!isLast && <ChevronRight size={16} className="bn-divider" />}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default BreadcrumbNav;
