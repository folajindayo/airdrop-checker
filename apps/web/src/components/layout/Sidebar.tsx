"use client";

import React, { ReactNode } from "react";

interface SidebarItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar Component
 * Responsive sidebar navigation
 */
export default function Sidebar({ items, isOpen = true, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col p-4">
          {items.map((item, index) => {
            const content = (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-gray-500">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
            );

            const className = `flex w-full items-center rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
              item.active
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`;

            if (item.href) {
              return (
                <a key={index} href={item.href} className={className}>
                  {content}
                </a>
              );
            }

            if (item.onClick) {
              return (
                <button key={index} onClick={item.onClick} className={className}>
                  {content}
                </button>
              );
            }

            return (
              <div key={index} className={className}>
                {content}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

