import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    imagePath?: string;
    bookedCount: number;
    isFull: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const isPast = dayjs(event.endDate).isBefore(dayjs());
  const percentFull = Math.min(100, Math.round((event.bookedCount / event.capacity) * 100));

  return (
    <div className="card group flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {event.imagePath ? (
          <img src={`/${event.imagePath}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-lions-100 dark:bg-lions-900/30 text-lions-800 dark:text-lions-200">
            <Calendar className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 text-center rounded-lg px-3 py-1.5 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-lions-600 dark:text-lions-400 uppercase leading-none mb-1">
            {dayjs(event.startDate).format('MMM')}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">
            {dayjs(event.startDate).format('DD')}
          </p>
        </div>
        
        {isPast ? (
          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            Terminé
          </div>
        ) : event.isFull ? (
          <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            Complet
          </div>
        ) : null}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          <Link to={`/events/${event.slug}`} className="hover:text-lions-600 dark:hover:text-lions-400 transition-colors">
            {event.title}
          </Link>
        </h3>
        
        <div className="space-y-2 mb-4 mt-auto pt-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2 text-lions-500 flex-shrink-0" />
            <span>{dayjs(event.startDate).format('HH:mm')} - {dayjs(event.endDate).format('HH:mm')}</span>
          </div>
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-lions-500 flex-shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
          <div className="flex justify-between items-center mb-1.5 text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Réservations</span>
            <span className="font-semibold text-gray-900 dark:text-white">{event.bookedCount} / {event.capacity}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-4 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${event.isFull ? 'bg-red-500' : 'bg-lions-500'}`}
              style={{ width: `${percentFull}%` }}
            ></div>
          </div>
          
          <Link 
            to={`/events/${event.slug}`} 
            className="w-full btn-secondary text-center flex justify-center py-2 text-sm"
          >
            Voir les détails
          </Link>
        </div>
      </div>
    </div>
  );
}
