import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { meetingService } from '../services/meeting.service';
import MeetingCard from '../components/common/MeetingCard';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyMeetings() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-rsvps'],
    queryFn: () => meetingService.getMyRsvps(),
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Mes Réponses aux Réunions</h1>
          <p className="text-gray-600 dark:text-gray-400">Historique de vos RSVP aux réunions du club.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((attendance: any) => (
              <MeetingCard 
                key={attendance.id} 
                meeting={attendance.meeting} 
                userRsvp={attendance.status}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun RSVP</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Vous n'avez répondu à aucune réunion.
            </p>
            <Link to="/meetings" className="btn-primary">Voir les réunions</Link>
          </div>
        )}
      </div>
    </div>
  );
}
