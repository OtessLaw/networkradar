import React from 'react';

export function DataTable({ columns, data, keyField = 'id', onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-surface rounded-lg border border-border">
        No data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-2 border-b border-border text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-4">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {data.map((row) => (
            <tr 
              key={row[keyField]} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-2' : ''}`}
            >
              {columns.map((col, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
