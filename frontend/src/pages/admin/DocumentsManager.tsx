import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/document.service';
import { Plus, Trash2, FileText, Download, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import DocumentUploadModal from '../../components/admin/DocumentUploadModal';

export default function DocumentsManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-documents', filter],
    queryFn: () => documentService.getAll({ category: filter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      toast.success('Document supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Gestion des Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les fichiers du club, les rapports et les PV.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" /> Uploader un Document
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-xs">
            <option value="">Toutes les catégories</option>
            <option value="meeting_minutes">Procès-verbaux</option>
            <option value="financial_report">Rapports Financiers</option>
            <option value="bylaws">Statuts & Règlements</option>
            <option value="general">Général</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accès</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((doc: any) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-lions-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</div>
                        <div className="text-xs text-gray-500">{doc.description || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{doc.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dayjs(doc.createdAt).format('DD/MM/YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {doc.isRestricted ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <Lock className="w-3 h-3 mr-1" /> Board Seulement
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Public (Membres)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <a href={documentService.getDownloadUrl(doc.id)} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Télécharger">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => { if(window.confirm('Supprimer ce document ?')) deleteMutation.mutate(doc.id) }} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
