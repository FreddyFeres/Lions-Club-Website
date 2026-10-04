import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import { Calendar, MapPin, Users, ArrowLeft, Check, TicketX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventService.getBySlug(slug!),
    enabled: !!slug,
  });

  const bookMutation = useMutation({
    mutationFn: () => eventService.book(event.id),
    onSuccess: () => {
      toast.success('Réservation confirmée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Erreur lors de la réservation');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => eventService.cancelBooking(event.id),
    onSuccess: () => {
      toast.success('Réservation annulée');
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Erreur lors de l'annulation");
    }
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-lions-500 border-t-transparent rounded-full"></div></div>;
  if (!event) return <div className="text-center py-24"><h2 className="text-2xl font-bold">Événement introuvable</h2><Link to="/events" className="text-lions-600 mt-4 inline-block">Retour aux événements</Link></div>;

  const isPast = dayjs(event.endDate).isBefore(dayjs());
  const hasBooked = !!event.userBooking && event.userBooking.status === 'confirmed';

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/events" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux événements
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header Image */}
          <div className="h-64 sm:h-80 lg:h-96 w-full relative bg-lions-100 dark:bg-gray-700">
            {event.imagePath ? (
              <img src={`/${event.imagePath}`} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lions-500">
                <Calendar className="w-20 h-20 opacity-50" />
              </div>
            )}
            {isPast && (
              <div className="absolute top-4 right-4 bg-gray-900 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
                Événement Terminé
              </div>
            )}
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-white mb-6">
              {event.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-start">
                <Calendar className="w-6 h-6 text-lions-600 dark:text-lions-400 mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Date & Heure</p>
                  <p className="text-gray-600 dark:text-gray-300">{dayjs(event.startDate).format('dddd, DD MMMM YYYY')}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{dayjs(event.startDate).format('HH:mm')} - {dayjs(event.endDate).format('HH:mm')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-lions-600 dark:text-lions-400 mr-4 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Lieu</p>
                  <p className="text-gray-600 dark:text-gray-300">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="w-6 h-6 text-lions-600 dark:text-lions-400 mr-4 flex-shrink-0" />
                <div className="w-full pr-4">
                  <p className="font-semibold text-gray-900 dark:text-white flex justify-between">
                    <span>Disponibilité</span>
                    <span>{event.bookedCount} / {event.capacity}</span>
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${event.isFull ? 'bg-red-500' : 'bg-lions-500'}`}
                      style={{ width: `${Math.min(100, (event.bookedCount / event.capacity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10 prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold mb-4">À propos de cet événement</h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {event.description || "Aucune description fournie pour cet événement."}
              </p>
            </div>

            {/* Booking Section */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-8 mt-8">
              {!isAuthenticated ? (
                <div className="bg-lions-50 dark:bg-lions-900/20 rounded-xl p-6 text-center border border-lions-100 dark:border-lions-800">
                  <p className="text-lions-800 dark:text-lions-200 font-medium mb-4">
                    Vous devez être connecté pour réserver votre place à cet événement.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('/login')} className="btn-primary">Se Connecter</button>
                    <button onClick={() => navigate('/register')} className="btn-secondary">Créer un compte</button>
                  </div>
                </div>
              ) : isPast ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Cet événement est terminé.</p>
                </div>
              ) : hasBooked ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between border border-green-200 dark:border-green-800/50 gap-4">
                  <div className="flex items-center text-green-800 dark:text-green-300">
                    <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full mr-4">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Place réservée !</p>
                      <p className="text-sm opacity-90">Réf: {event.userBooking.bookingReference}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(window.confirm('Voulez-vous vraiment annuler votre réservation ?')) cancelMutation.mutate() }}
                    disabled={cancelMutation.isPending}
                    className="btn-danger w-full sm:w-auto"
                  >
                    <TicketX className="w-4 h-4 mr-2" /> Annuler ma réservation
                  </button>
                </div>
              ) : event.isFull ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center border border-red-100 dark:border-red-800/50">
                  <p className="text-red-800 dark:text-red-300 font-bold text-lg mb-1">Événement Complet</p>
                  <p className="text-red-600 dark:text-red-400 text-sm">Il n'y a plus de places disponibles pour cet événement.</p>
                </div>
              ) : (
                <button 
                  onClick={() => bookMutation.mutate()}
                  disabled={bookMutation.isPending}
                  className="w-full btn-primary py-4 text-lg font-bold shadow-lg flex items-center justify-center group"
                >
                  {bookMutation.isPending ? 'Réservation en cours...' : 'Réserver ma place maintenant'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
