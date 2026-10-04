import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceHoursService } from '../../services/serviceHours.service';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function ServiceHoursManager() {
  const [filter, setFilter] = useState('pending');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-service-hours', filter],
    queryFn: () => serviceHoursService.getAll({ status: filter || undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => serviceHoursService.approve(id),
    onSuccess: () => {
      toast.success('Heures approuvées');
      queryClient.invalidateQueries({ queryKey: ['admin-service-hours'] });
    },
    onError: () => toast.error('Erreur')
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => serviceHoursService.reject(id, reason),
    onSuccess: () => {
      toast.success('Heures rejetées');
      queryClient.invalidateQueries({ queryKey: ['admin-service-hours'] });
    },
    onError: () => toast.error('Erreur')
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Validation Heures de Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Approuvez ou rejetez les heures déclarées par les membres.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-xs">
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
            <option value="">Toutes</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.description}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" /> {dayjs(log.date).format('DD/MM/YYYY')}
                      {log.event && <span className="ml-2 text-lions-500">Lien: {log.event.title}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{log.user.firstName} {log.user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-lions-600">
                    {log.hoursLogged}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'approved' ? 'bg-green-100 text-green-800' :
                      log.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status === 'approved' ? 'Approuvé' : log.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {log.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => approveMutation.mutate(log.id)}
                          className="btn-primary py-1 px-3 text-sm bg-green-600 hover:bg-green-700 border-none"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            const reason = window.prompt("Motif du rejet :");
                            if (reason !== null) rejectMutation.mutate({ id: log.id, reason });
                          }}
                          className="btn-danger py-1 px-3 text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {data?.data?.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Aucune déclaration trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
