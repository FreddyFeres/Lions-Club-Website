import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '../../services/meeting.service';
import toast from 'react-hot-toast';
import { X, FileText, Save } from 'lucide-react';

const pvSchema = z.object({
  minutes: z.string().optional(),
});

type PvForm = z.infer<typeof pvSchema>;

interface MeetingPvModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToEdit: any;
}

export default function MeetingPvModal({ isOpen, onClose, meetingToEdit }: MeetingPvModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<PvForm>({
    resolver: zodResolver(pvSchema),
    defaultValues: {
      minutes: meetingToEdit?.minutes || '',
    }
  });

  React.useEffect(() => {
    if (meetingToEdit) {
      reset({
        minutes: meetingToEdit.minutes || '',
      });
    }
  }, [meetingToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => meetingService.update(meetingToEdit.id, data),
    onSuccess: () => {
      toast.success('Procès-verbal enregistré avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement du PV")
  });

  const onSubmit = (data: PvForm) => {
    const formData = new FormData();
    formData.append('minutes', data.minutes || '');
    
    // Send existing data so it isn't overwritten with undefined if the backend relies on full objects
    formData.append('title', meetingToEdit.title);
    formData.append('type', meetingToEdit.type);
    if (meetingToEdit.agenda) formData.append('agenda', meetingToEdit.agenda);
    if (meetingToEdit.location) formData.append('location', meetingToEdit.location);
    if (meetingToEdit.virtualLink) formData.append('virtualLink', meetingToEdit.virtualLink);
    formData.append('scheduledAt', new Date(meetingToEdit.scheduledAt).toISOString());
    formData.append('quorumRequired', (meetingToEdit.quorumRequired || 0).toString());

    mutation.mutate(formData);
  };

  if (!isOpen || !meetingToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl animate-scale-in my-8 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lions-100 dark:bg-lions-900/40 rounded-lg">
              <FileText className="w-5 h-5 text-lions-600 dark:text-lions-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Rédiger le Procès-Verbal
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {meetingToEdit.title}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex-1 flex flex-col space-y-4">
            <div>
              <label className="label">Contenu du Procès-Verbal (PV)</label>
              <textarea 
                {...register('minutes')} 
                className="input-field min-h-[400px] font-mono text-sm leading-relaxed resize-y" 
                placeholder="Rédigez les notes, les décisions et le déroulement de la réunion ici..."
              ></textarea>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Les membres pourront consulter ce PV une fois enregistré.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary px-6">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary px-6 flex items-center">
              {isSubmitting || mutation.isPending ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer le PV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
