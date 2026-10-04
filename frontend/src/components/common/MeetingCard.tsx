import React from 'react';
import { Calendar, MapPin, Video, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    type: string;
    scheduledAt: string;
    location?: string;
    virtualLink?: string;
    status: string;
    _count?: {
      attendances: number;
    };
  };
  userRsvp?: string;
}

export default function MeetingCard({ meeting, userRsvp }: MeetingCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AssembleeGenerale': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'AssembleeGeneraleElective': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'ReunionAvancement': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'ReunionBureau': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'AssembleeGenerale': return 'AG';
      case 'AssembleeGeneraleElective': return 'AGE';
      case 'ReunionAvancement': return "Réunion d'Avancement";
      case 'ReunionBureau': return 'Réunion Bureau';
      default: return type;
    }
  };

  const getRsvpBadge = () => {
    if (!userRsvp) return null;
    switch (userRsvp) {
      case 'yes': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Présent</span>;
      case 'no': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Absent</span>;
      case 'maybe': return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Peut-être</span>;
      default: return null;
    }
  };

  return (
    <div className="card p-5 hover:border-lions-300 dark:hover:border-lions-700 transition-colors flex flex-col h-full border-l-4 border-l-lions-500">
      <div className="flex justify-between items-start mb-3 gap-2">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getTypeColor(meeting.type)}`}>
          {getTypeLabel(meeting.type)}
        </span>
        {getRsvpBadge()}
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
        {meeting.title}
      </h3>

      <div className="space-y-2.5 mb-5 mt-auto">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2.5 text-lions-500 flex-shrink-0" />
          <span className="font-medium">{dayjs(meeting.scheduledAt).format('DD MMM YYYY, HH:mm')}</span>
        </div>
        
        {meeting.location && (
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">{meeting.location}</span>
          </div>
        )}
        
        {meeting.virtualLink && (
          <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
            <Video className="w-4 h-4 mr-2.5 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-1">Réunion Virtuelle</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4 mr-1.5" />
          <span>{meeting._count?.attendances || 0} Confirmés</span>
        </div>
        <Link 
          to={`/meetings/${meeting.id}`}
          className="text-sm font-semibold text-lions-600 hover:text-lions-700 dark:text-lions-400 dark:hover:text-lions-300 flex items-center"
        >
          Détails & RSVP &rarr;
        </Link>
      </div>
    </div>
  );
}
