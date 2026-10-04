import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '../services/meeting.service';
import { Calendar, MapPin, Video, Users, ArrowLeft, Clock, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { documentService } from '../services/document.service';
import { useAuth } from '../context/AuthContext';
import MeetingPvModal from '../components/admin/MeetingPvModal';

export default function MeetingDetail() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: meeting, isLoading } = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => meetingService.getById(id!),
    enabled: !!id,
  });

  const rsvpMutation = useMutation({
    mutationFn: (status: 'yes' | 'no' | 'maybe') => meetingService.rsvp(id!, status),
    onSuccess: () => {
      toast.success('Votre RSVP a été enregistré');
      queryClient.invalidateQueries({ queryKey: ['meeting', id] });
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du RSVP");
    }
  });

  if (isLoading) return <div className="min-h-screen flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-lions-500 border-t-transparent rounded-full"></div></div>;
  if (!meeting) return <div className="text-center py-20">Réunion introuvable</div>;

  const isPast = dayjs(meeting.scheduledAt).isBefore(dayjs());
  const rsvpStatus = meeting.userRsvp?.status;
  const canEditPv = user?.role === 'admin' || user?.role === 'board_member';
  const [isPvModalOpen, setIsPvModalOpen] = React.useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/meetings" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux réunions
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <div className="p-8 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Type: {meeting.type}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-md ${meeting.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                Statut: {meeting.status}
              </span>
            </div>

            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">
              {meeting.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 mb-8">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-lions-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Date</p>
                  <p className="text-gray-600 dark:text-gray-300">{dayjs(meeting.scheduledAt).format('dddd, DD MMMM YYYY')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-lions-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Heure</p>
                  <p className="text-gray-600 dark:text-gray-300">{dayjs(meeting.scheduledAt).format('HH:mm')}</p>
                </div>
              </div>
              {meeting.location && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-lions-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Lieu</p>
                    <p className="text-gray-600 dark:text-gray-300">{meeting.location}</p>
                  </div>
                </div>
              )}
              {meeting.virtualLink && (
                <div className="flex items-start">
                  <Video className="w-5 h-5 text-lions-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Lien Virtuel</p>
                    <a href={meeting.virtualLink} target="_blank" rel="noopener noreferrer" className="text-lions-600 hover:underline break-all">
                      {meeting.virtualLink}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ordre du jour / Notes</h3>
              </div>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                {meeting.agenda || "Aucun ordre du jour n'a été publié pour le moment."}
              </div>
            </div>

            {(meeting.minutes || canEditPv) && (
              <div className="mb-8 animate-fade-in relative">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-lions-600" /> Procès-Verbal (PV)
                  </h3>
                  {canEditPv && (
                    <button onClick={() => setIsPvModalOpen(true)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {meeting.minutes ? 'Modifier le PV' : 'Rédiger le PV'}
                    </button>
                  )}
                </div>
                {meeting.minutes ? (
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-lions-50/50 dark:bg-lions-900/10 p-6 rounded-xl border border-lions-100 dark:border-lions-900/30">
                    {meeting.minutes}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    Le procès-verbal n'a pas encore été rédigé.
                  </div>
                )}
              </div>
            )}

            {meeting.documents?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Documents associés</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {meeting.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center overflow-hidden">
                        <FileText className="w-5 h-5 text-lions-500 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium truncate dark:text-white">{doc.title}</span>
                      </div>
                      <a href={documentService.getDownloadUrl(doc.id)} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-lions-600 dark:hover:text-lions-400">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* RSVP Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Votre présence</h3>
                {isPast ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cette réunion est terminée.</p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez confirmer votre présence pour faciliter l'organisation.</p>
                )}
              </div>
              
              {!isPast && (
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => rsvpMutation.mutate('yes')}
                    disabled={rsvpMutation.isPending}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium transition-all ${rsvpStatus === 'yes' ? 'bg-green-600 text-white shadow-md ring-2 ring-green-300 ring-offset-2' : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-green-900/30'}`}
                  >
                    Oui
                  </button>
                  <button 
                    onClick={() => rsvpMutation.mutate('maybe')}
                    disabled={rsvpMutation.isPending}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium transition-all ${rsvpStatus === 'maybe' ? 'bg-yellow-500 text-white shadow-md ring-2 ring-yellow-200 ring-offset-2' : 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-yellow-900/30'}`}
                  >
                    Peut-être
                  </button>
                  <button 
                    onClick={() => rsvpMutation.mutate('no')}
                    disabled={rsvpMutation.isPending}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium transition-all ${rsvpStatus === 'no' ? 'bg-red-600 text-white shadow-md ring-2 ring-red-300 ring-offset-2' : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-red-900/30'}`}
                  >
                    Non
                  </button>
                </div>
              )}
            </div>
            {isPast && rsvpStatus && (
              <div className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Vous aviez répondu:</span>
                <span className={`text-sm font-bold ${rsvpStatus === 'yes' ? 'text-green-600' : rsvpStatus === 'no' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {rsvpStatus === 'yes' ? 'Présent' : rsvpStatus === 'no' ? 'Absent' : 'Peut-être'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {canEditPv && (
        <MeetingPvModal
          isOpen={isPvModalOpen}
          onClose={() => setIsPvModalOpen(false)}
          meetingToEdit={meeting}
        />
      )}
    </div>
  );
}
