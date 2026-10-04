import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/event.service';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import EventFormModal from '../../components/admin/EventFormModal';

export default function EventsManager() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', search],
    queryFn: () => eventService.getAll({ search: search || undefined, filter: 'all' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      toast.success('Événement supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Gestion des Événements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Créez, modifiez et suivez les inscriptions.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEventToEdit(null); setIsModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Nouvel Événement
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher un événement..." 
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Événement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inscriptions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((event: any) => {
                const isPast = dayjs(event.endDate).isBefore(dayjs());
                return (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {event.imagePath ? <img src={`/${event.imagePath}`} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dayjs(event.startDate).format('DD/MM/YYYY HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!event.isActive ? 'bg-red-100 text-red-800' : isPast ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                        {!event.isActive ? 'Inactif' : isPast ? 'Terminé' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white mr-2">{event.bookedCount}/{event.capacity}</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${event.isFull ? 'bg-red-500' : 'bg-lions-500'}`} style={{ width: `${Math.min(100, (event.bookedCount/event.capacity)*100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/events/${event.id}/reservations`} className="text-lions-600 hover:text-lions-900 p-1 bg-lions-50 rounded dark:bg-lions-900/30 dark:hover:text-lions-400" title="Gérer inscriptions">
                          <Users className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { setEventToEdit(event); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded dark:bg-blue-900/30 dark:hover:text-blue-400">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(window.confirm('Supprimer cet événement ?')) deleteMutation.mutate(event.id); }} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded dark:bg-red-900/30 dark:hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EventFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEventToEdit(null); }} 
        eventToEdit={eventToEdit} 
      />
    </div>
  );
}
