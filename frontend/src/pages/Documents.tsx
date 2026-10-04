import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import { FileText, Download, Filter, Search, Lock } from 'lucide-react';
import dayjs from 'dayjs';

export default function Documents() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filter, search],
    queryFn: () => documentService.getAll({ 
      category: filter || undefined,
      search: search || undefined
    }),
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'meeting_minutes': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'financial_report': return 'bg-green-100 text-green-800 border-green-200';
      case 'bylaws': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'meeting_minutes': return 'Procès-verbal';
      case 'financial_report': return 'Rapport Financier';
      case 'bylaws': return 'Statuts & Règlements';
      default: return 'Général';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Centre de Documents</h1>
          <p className="text-gray-600 dark:text-gray-400">Consultez et téléchargez les documents officiels du club.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="">Toutes les catégories</option>
              <option value="meeting_minutes">Procès-verbaux</option>
              <option value="financial_report">Rapports Financiers</option>
              <option value="bylaws">Statuts & Règlements</option>
              <option value="general">Général</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((doc: any) => (
              <div key={doc.id} className="card p-6 hover:shadow-md transition-shadow group flex flex-col h-full border-t-4 border-t-lions-500">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-lions-600 dark:text-lions-400 group-hover:bg-lions-100 group-hover:text-lions-700 transition-colors`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded border ${getCategoryColor(doc.category)}`}>
                    {getCategoryLabel(doc.category)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={doc.title}>
                  {doc.title}
                </h3>
                {doc.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}
                
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col">
                    <span>Ajouté le {dayjs(doc.createdAt).format('DD MMM YYYY')}</span>
                    {doc.isRestricted && (
                      <span className="flex items-center text-amber-600 mt-1">
                        <Lock className="w-3 h-3 mr-1" /> Document restreint
                      </span>
                    )}
                  </div>
                  <a 
                    href={documentService.getDownloadUrl(doc.id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-lions-50 hover:text-lions-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-lions-400 dark:hover:bg-gray-700 transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun document trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Modifiez vos critères de recherche ou essayez une autre catégorie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
