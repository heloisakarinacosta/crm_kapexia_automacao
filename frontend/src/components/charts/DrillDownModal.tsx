"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DrillDownColumn {
  field: string;
  title: string;
  width: number;
  type: 'text' | 'number' | 'email' | 'phone' | 'badge' | 'currency' | 'date' | 'datetime';
}

interface DrillDownData {
  title: string;
  columns: DrillDownColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  modalSize: 'small' | 'medium' | 'large' | 'fullscreen';
  linkConfig?: {
    column: string;
    template: string;
    textColumn: string;
  };
}

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrillDownData | null;
  loading?: boolean;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  data,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setSortColumn(null);
    setSortDirection('asc');
  }, [data]);

  if (!isOpen) return null;

  const getModalSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'max-w-md';
      case 'medium':
        return 'max-w-2xl';
      case 'large':
        return 'max-w-6xl';
      case 'fullscreen':
        return 'max-w-[95vw] max-h-[95vh]';
      default:
        return 'max-w-4xl';
    }
  };

  const formatCellValue = (value: unknown, column: DrillDownColumn) => {
    if (value === null || value === undefined) {
      return '-';
    }

    switch (column.type) {
      case 'currency':
        return typeof value === 'string' ? value : `R$ ${(value as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'date':
        if (!value) return '-';
        const d = new Date(value as string | number);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      case 'datetime':
        if (!value) return '-';
        const dt = new Date(value as string | number);
        return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      case 'phone':
        return value;
      case 'email':
        return value;
      case 'badge':
        return renderBadge(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value);
      default:
        return String(value);
    }
  };

  const renderBadge = (value: unknown) => {
    if (typeof value === 'object' && value !== null && 'text' in value && 'color' in value) {
      const badgeValue = value as { text: string; color: string };
      const colorClasses = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800'
      };

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[badgeValue.color as keyof typeof colorClasses] || colorClasses.gray}`}>
          {badgeValue.text}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {String(value)}
      </span>
    );
  };

  const renderCellContent = (row: Record<string, unknown>, column: DrillDownColumn) => {
    const value = row[column.field];
    const formattedValue = formatCellValue(value, column);

    // Se é a coluna de link e tem configuração de link
    if (data?.linkConfig && column.field === data.linkConfig.column && row._link) {
      return (
        <Link 
          href={row._link}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {String(row._linkText || formattedValue)}
        </Link>
      );
    }

    // Se é email, renderizar como link mailto
    if (column.type === 'email' && value) {
      return (
        <a 
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {String(formattedValue)}
        </a>
      );
    }

    // Se é telefone, renderizar como link tel
    if (column.type === 'phone' && value) {
      return (
        <a 
          href={`tel:${String(value).replace(/\D/g, '')}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {String(formattedValue)}
        </a>
      );
    }

    return String(formattedValue);
  };

  const handleSort = (columnField: string) => {
    if (sortColumn === columnField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnField);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredData = () => {
    if (!data?.rows) return [];

    let filteredData = data.rows;

    // Aplicar filtro de busca
    if (searchTerm) {
      filteredData = data.rows.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar ordenação
    if (sortColumn) {
      filteredData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = aValue.toString().localeCompare(bValue.toString());
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filteredData;
  };

  const sortedAndFilteredData = getSortedAndFilteredData();
  const totalFilteredRows = sortedAndFilteredData.length;
  const totalPages = Math.ceil(totalFilteredRows / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedAndFilteredData.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className={`relative top-4 mx-auto p-5 border shadow-lg rounded-md bg-white ${getModalSizeClass(data?.modalSize || 'large')} mb-8`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {loading ? 'Carregando...' : data?.title || 'Detalhes do Gráfico'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando dados...</span>
          </div>
        ) : data ? (
          <>
            {/* Search and Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {totalFilteredRows} de {data.totalRows} registros
                  {searchTerm && ` (filtrados)`}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {data.columns.map((column) => (
                      <th
                        key={column.field}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ width: column.width }}
                        onClick={() => handleSort(column.field)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.title}</span>
                          {sortColumn === column.field && (
                            <svg
                              className={`h-4 w-4 transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.length > 0 ? (
                    currentData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {data.columns.map((column) => (
                          <td
                            key={column.field}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            style={{ width: column.width }}
                          >
                            {renderCellContent(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={data.columns.length}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        {searchTerm ? 'Nenhum resultado encontrado para a busca' : 'Nenhum dado disponível'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalFilteredRows)} de {totalFilteredRows} registros
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrillDownModal;

