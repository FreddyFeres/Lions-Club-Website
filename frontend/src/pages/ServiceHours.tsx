import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceHoursService } from '../services/serviceHours.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Plus, Trophy, History } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const logFormSchema = z.object({
  hoursLogged: z.coerce.number().min(1, 'Minimum 1 heure').max(100, 'Maximum 100 heures'),
  description: z.string().min(5, 'Description requise'),
  date: z.string().min(1, 'Date requise'),
});

type LogForm = z.infer<typeof logFormSchema>;

export default function ServiceHours() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => serviceHoursService.getLeaderboard(),
  });

  const { data: myHours, isLoading: loadingMyHours } = useQuery({
    queryKey: ['my-service-hours'],
    queryFn: () => serviceHoursService.getMyHours(),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LogForm>({
    resolver: zodResolver(logFormSchema),
    defaultValues: { date: dayjs().format('YYYY-MM-DD') }
  });

  const logMutation = useMutation({
    mutationFn: (data: LogForm) => serviceHoursService.logHours(data),
    onSuccess: () => {
      toast.success('Heures enregistrées. En attente d\'approbation.');
      queryClient.invalidateQueries({ queryKey: ['my-service-hours'] });
      reset();
      setShowForm(false);
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement')
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Heures de Service</h1>
            <p className="text-gray-600 dark:text-gray-400">Suivez vos contributions et consultez le classement du club.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" /> Déclarer des heures
          </button>
        </div>

        {/* Log Form */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-lions-200 dark:border-lions-800/50 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nouvelle déclaration</h2>
            <form onSubmit={handleSubmit((d) => logMutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre d'heures</label>
                  <input {...register('hoursLogged')} type="number" className="input-field" placeholder="Ex: 4" />
                  {errors.hoursLogged && <p className="mt-1 text-sm text-red-600">{errors.hoursLogged.message}</p>}
                </div>
                <div>
                  <label className="label">Date de l'action</label>
                  <input {...register('date')} type="date" max={dayjs().format('YYYY-MM-DD')} className="input-field" />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Description de l'activité</label>
                <textarea {...register('description')} className="input-field min-h-[100px]" placeholder="Qu'avez-vous fait ?"></textarea>
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={isSubmitting || logMutation.isPending} className="btn-primary">
                  Soumettre pour approbation
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-lions-600 to-lions-800 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-1 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-gold-400" /> Classement du Club
              </h3>
              <p className="text-lions-200 text-sm mb-6">Top contributeurs du mois</p>
              
              {loadingLeaderboard ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-white/10 rounded animate-pulse"></div>)}
                </div>
              ) : leaderboard?.topUsers?.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.topUsers.map((u: any, idx: number) => (
                    <div key={u.userId} className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${idx === 0 ? 'bg-gold-400 text-lions-900' : idx === 1 ? 'bg-gray-300 text-lions-900' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-lions-900 text-white'}`}>
                          {idx + 1}
                        </div>
                        <span className="font-medium">{u.user.firstName} {u.user.lastName}</span>
                      </div>
                      <span className="font-bold text-gold-400">{u._sum.hoursLogged}h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/5 rounded-lg border border-white/10">Aucune donnée</div>
              )}
              
              <div className="mt-6 pt-4 border-t border-white/20 text-center">
                <p className="text-sm text-lions-200">Total Club (Mois)</p>
                <p className="text-3xl font-display font-bold text-gold-400">{leaderboard?.clubTotalHours || 0} Heures</p>
              </div>
            </div>
          </div>

          {/* History Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <History className="w-6 h-6 mr-2 text-lions-500" /> Mon Historique
              </h3>

              {loadingMyHours ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>)}
                </div>
              ) : myHours?.data?.length > 0 ? (
                <div className="space-y-4">
                  {myHours.data.map((log: any) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg text-lions-600 dark:text-lions-400">{log.hoursLogged}h</span>
                          <span className="text-gray-900 dark:text-white font-medium">{log.description}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {dayjs(log.date).format('DD MMM YYYY')}
                          {log.event && <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">{log.event.title}</span>}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex flex-col items-end">
                        <StatusBadge status={log.status} />
                        {log.status === 'rejected' && log.rejectionReason && (
                          <span className="text-xs text-red-500 mt-1">Motif: {log.rejectionReason}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore déclaré d'heures de service.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
