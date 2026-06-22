"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface PremiumTableProps extends React.HTMLAttributes<HTMLTableElement> {
  headers: string[];
  children: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const PremiumTable: React.FC<PremiumTableProps> = ({
  headers,
  children,
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto glass-panel rounded-2xl border border-brand-purple/10 shadow-lg",
        wrapperClassName
      )}
    >
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props}>
        {/* Table Headers */}
        <thead>
          <tr className="border-b border-brand-purple/10 bg-brand-purple/5 text-gray-400 font-semibold tracking-wider uppercase text-[10px]">
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4 font-semibold text-gray-400 uppercase tracking-widest pl-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-white/5 text-white/90">
          {children}
        </tbody>
      </table>
    </div>
  );
};

interface PremiumTableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export const PremiumTableCell: React.FC<PremiumTableCellProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <td className={cn("px-6 py-4.5 whitespace-nowrap align-middle", className)} {...props}>
      {children}
    </td>
  );
};

interface PremiumTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export const PremiumTableRow: React.FC<PremiumTableRowProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr
      className={cn(
        "hover:bg-white/[0.02] transition-colors duration-150 group",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};
