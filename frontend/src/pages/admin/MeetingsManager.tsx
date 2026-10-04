import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '../../services/meeting.service';
import { Plus, Trash2, Edit, CheckSquare, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import MeetingFormModal from '../../components/admin/MeetingFormModal';
import MeetingPvModal from '../../components/admin/MeetingPvModal';
import { FileText } from 'lucide-react';

export default function MeetingsManager() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPvModalOpen, setIsPvModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-meetings', search],
    queryFn: () => meetingService.getAll({ search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => meetingService.delete(id),
    onSuccess: () => {
      toast.success('Réunion supprimée');
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Gestion des Réunions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Planifiez les réunions du club et suivez les présences.</p>
        </div>
        <button className="btn-primary" onClick={() => { setMeetingToEdit(null); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Planifier Réunion
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((meeting: any) => (
                <tr key={meeting.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {meeting.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dayjs(meeting.date).format('DD/MM/YYYY HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${meeting.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                      {meeting.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setMeetingToEdit(meeting); setIsPvModalOpen(true); }} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded" title="Rédiger PV">
                        <FileText className="w-4 h-4" />
                      </button>
                      <button className="text-lions-600 hover:text-lions-900 p-1 bg-lions-50 rounded" title="Présences">
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setMeetingToEdit(meeting); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(window.confirm('Supprimer cette réunion ?')) deleteMutation.mutate(meeting.id) }} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Supprimer">
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

      <MeetingFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setMeetingToEdit(null); }} 
        meetingToEdit={meetingToEdit} 
      />

      <MeetingPvModal
        isOpen={isPvModalOpen}
        onClose={() => { setIsPvModalOpen(false); setMeetingToEdit(null); }}
        meetingToEdit={meetingToEdit}
      />
    </div>
  );
}
