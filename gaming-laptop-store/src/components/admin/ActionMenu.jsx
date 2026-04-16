import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import "../../styles/admin/actionMenu.css";

const ActionMenu = ({ actions, row }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef();
  const dropdownRef = useRef();
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.right });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleClickOutside = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        dropdownRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };

    const handleScroll = () => setOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePosition]);

  const visibleActions = actions.filter((a) => a.show(row));
  if (visibleActions.length === 0) return null;

  return (
    <>
      <button
        className="am-trigger"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        title="Acciones"
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            className="am-dropdown"
            ref={dropdownRef}
            style={{ top: pos.top, left: pos.left }}
          >
            {visibleActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  className={`am-item${action.destructive ? " am-item--destructive" : ""}`}
                  onClick={() => {
                    action.handler(row);
                    setOpen(false);
                  }}
                >
                  {Icon && <Icon size={14} />}
                  <span>{action.title}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
