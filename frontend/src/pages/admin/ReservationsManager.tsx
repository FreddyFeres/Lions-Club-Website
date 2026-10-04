import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/event.service';
import { ArrowLeft, CheckCircle2, TicketX } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function ReservationsManager() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-event-bookings', id],
    queryFn: () => eventService.getAllBookings(id!),
    enabled: !!id,
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: string) => eventService.checkIn(id!, bookingId),
    onSuccess: () => {
      toast.success('Check-in effectué');
      queryClient.invalidateQueries({ queryKey: ['admin-event-bookings', id] });
    },
    onError: () => toast.error('Erreur lors du check-in')
  });

  if (isLoading) return <div>Chargement...</div>;

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter);

  return (
    <div>
      <Link to="/admin/events" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux événements
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Inscriptions à l'événement</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez le check-in des participants à l'entrée.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-xs">
            <option value="all">Toutes les réservations</option>
            <option value="confirmed">Confirmées (A venir)</option>
            <option value="attended">Présents (Check-in fait)</option>
            <option value="cancelled">Annulées</option>
          </select>
        </div>

        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Inscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredBookings?.map((booking: any) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-lions-600">
                  {booking.bookingReference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.user.firstName} {booking.user.lastName}</div>
                  <div className="text-sm text-gray-500">{booking.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dayjs(booking.createdAt).format('DD/MM/YYYY HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {booking.status === 'confirmed' ? (
                    <button 
                      onClick={() => checkInMutation.mutate(booking.id)}
                      disabled={checkInMutation.isPending}
                      className="btn-primary py-1 px-3 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Marquer Présent
                    </button>
                  ) : booking.status === 'attended' ? (
                    <span className="text-green-600 font-medium text-sm flex items-center justify-end"><CheckCircle2 className="w-4 h-4 mr-1" /> Fait</span>
                  ) : (
                    <span className="text-gray-400"><TicketX className="w-5 h-5 ml-auto" /></span>
                  )}
                </td>
              </tr>
            ))}
            {filteredBookings?.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Aucune réservation trouvée</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
