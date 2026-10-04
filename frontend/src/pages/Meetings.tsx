import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meetingService } from '../services/meeting.service';
import MeetingCard from '../components/common/MeetingCard';
import { Search, Filter, Users } from 'lucide-react';

export default function Meetings() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['meetings', filter, search],
    queryFn: () => meetingService.getAll({ 
      filter: filter || undefined,
      search: search || undefined
    }),
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Réunions du Club</h1>
            <p className="text-gray-600 dark:text-gray-400">Consultez les réunions prévues et gérez vos présences.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="">Toutes (À venir)</option>
                <option value="General">Générales</option>
                <option value="Board">Bureau Élargi (Board)</option>
                <option value="Committee">Commission</option>
                <option value="past">Passées</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-6 h-48 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((meeting: any) => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                userRsvp={meeting.userRsvp}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune réunion trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Modifiez vos critères de recherche ou revenez plus tard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
