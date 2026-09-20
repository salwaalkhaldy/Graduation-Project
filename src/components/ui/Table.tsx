import React from 'react';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75">
            {headers.map((header, idx) => (
              <th
                key={`table-th-${header}-${idx}`}
                className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {React.Children.map(children, (child, idx) => {
            if (!React.isValidElement(child)) return child;
            // Ensure every child row has a guaranteed unique key
            return child.key != null
              ? child
              : React.cloneElement(child, { key: `table-row-${idx}` });
          })}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${
        onClick ? 'cursor-pointer hover:bg-teal-50/40' : 'hover:bg-slate-50/60'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}> = ({ children, className = '', colSpan }) => {
  return (
    <td
      colSpan={colSpan}
      className={`py-3.5 px-4 text-slate-800 text-sm align-middle ${className}`}
    >
      {children}
    </td>
  );
};
