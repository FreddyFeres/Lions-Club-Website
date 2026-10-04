import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import EventCard from '../components/common/EventCard';
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';

export default function Events() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', filter, search],
    queryFn: () => eventService.getAll({ filter: filter === 'all' ? undefined : filter, search: search || undefined }),
  });
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen pb-12 relative">
      {/* Premium Header Section */}
      <div className="relative pt-20 pb-16 overflow-hidden mb-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-soft-sm">
        <div className="absolute inset-0 bg-dots opacity-50 dark:opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-lions-100/40 dark:bg-lions-900/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="section-label"><CalendarIcon className="w-3.5 h-3.5" /> Agenda</span>
              <h1 className="text-4xl sm:text-5xl font-display font-black text-gray-900 dark:text-white mt-2 mb-4">Événements & Actions</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                Découvrez nos événements passés et à venir. Inscrivez-vous pour y participer !
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10 h-11"
                />
              </div>
              
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="input-field pl-10 h-11 appearance-none cursor-pointer"
                >
                  <option value="upcoming">À venir</option>
                  <option value="past">Passés</option>
                  <option value="all">Tous</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card h-96 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mt-auto"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.data.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Nous n'avons pas trouvé d'événements correspondant à vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
