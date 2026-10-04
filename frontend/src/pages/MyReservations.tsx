import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import dayjs from 'dayjs';

export default function MyReservations() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => eventService.getMyBookings(),
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Mes Réservations</h1>
            <p className="text-gray-600 dark:text-gray-400">Suivez vos inscriptions aux événements du club.</p>
          </div>
          <Link to="/events" className="btn-primary text-sm">
            <Search className="w-4 h-4 mr-2" />
            Parcourir les événements
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 h-32 animate-pulse flex">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mr-6"></div>
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {data.data.map((booking: any) => {
              const isPast = dayjs(booking.event.endDate).isBefore(dayjs());
              
              return (
                <div key={booking.id} className="card hover:border-lions-300 dark:hover:border-lions-700 transition-colors overflow-hidden flex flex-col sm:flex-row group">
                  <div className="sm:w-48 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700 relative flex-shrink-0">
                    {booking.event.imagePath ? (
                      <img src={`/${booking.event.imagePath}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Calendar className="w-10 h-10" />
                      </div>
                    )}
                    {isPast && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">Terminé</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/events/${booking.event.slug}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-lions-600 transition-colors">
                        {booking.event.title}
                      </Link>
                      <StatusBadge status={booking.status} />
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 text-lions-500" />
                        <span>{dayjs(booking.event.startDate).format('DD MMM YYYY, HH:mm')}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-lions-500" />
                        <span>{booking.event.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Réf: </span>
                        <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-lions-600 dark:text-lions-400 font-bold tracking-wider">
                          {booking.bookingReference}
                        </code>
                      </div>
                      <Link to={`/events/${booking.event.slug}`} className="btn-secondary text-sm py-1.5">
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucune réservation</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Vous n'êtes inscrit à aucun événement pour le moment. Découvrez nos prochaines actions et rejoignez-nous !
            </p>
            <Link to="/events" className="btn-primary">Voir les événements</Link>
          </div>
        )}
      </div>
    </div>
  );
}
