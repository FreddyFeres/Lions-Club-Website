import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { meetingService } from '../../services/meeting.service';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

const meetingSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  agenda: z.string().optional(),
  location: z.string().min(3, 'Lieu requis'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date de réunion requise'),
});

type MeetingForm = z.infer<typeof meetingSchema>;

interface MeetingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToEdit?: any;
}

export default function MeetingFormModal({ isOpen, onClose, meetingToEdit }: MeetingFormModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<MeetingForm>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meetingToEdit?.title || '',
      agenda: meetingToEdit?.agenda || '',
      location: meetingToEdit?.location || '',
      description: meetingToEdit?.description || '',
      date: meetingToEdit ? dayjs(meetingToEdit.date).format('YYYY-MM-DDTHH:mm') : '',
    }
  });

  React.useEffect(() => {
    if (meetingToEdit) {
      reset({
        title: meetingToEdit.title,
        agenda: meetingToEdit.agenda || '',
        location: meetingToEdit.location || '',
        description: meetingToEdit.description || '',
        date: dayjs(meetingToEdit.date).format('YYYY-MM-DDTHH:mm'),
      });
    } else {
      reset({ title: '', agenda: '', location: '', description: '', date: '' });
    }
  }, [meetingToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (meetingToEdit) return meetingService.update(meetingToEdit.id, data);
      return meetingService.create(data);
    },
    onSuccess: () => {
      toast.success(`Réunion ${meetingToEdit ? 'modifiée' : 'planifiée'} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['admin-meetings'] });
      reset();
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'opération")
  });

  const onSubmit = (data: MeetingForm) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.agenda) formData.append('agenda', data.agenda);
    if (data.location) formData.append('location', data.location);
    if (data.description) formData.append('description', data.description);
    formData.append('date', new Date(data.date).toISOString());
    
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-fade-in my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {meetingToEdit ? 'Modifier la réunion' : 'Planifier une réunion'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Titre</label>
              <input {...register('title')} type="text" className="input-field" placeholder="Ex: Réunion Mensuelle" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>}
            </div>
            <div>
              <label className="label">Lieu physique ou Lien virtuel</label>
              <input {...register('location')} type="text" className="input-field" placeholder="Ex: Hôtel Paris ou lien Zoom" />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
            </div>
            
            <div>
              <label className="label">Date & Heure</label>
              <input {...register('date')} type="datetime-local" className="input-field" />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message as string}</p>}
            </div>
            <div>
              <label className="label">Description (Optionnel)</label>
              <input {...register('description')} type="text" className="input-field" placeholder="Ex: Réunion pour discuter..." />
            </div>
          </div>
          
          <div>
            <label className="label">Ordre du jour</label>
            <textarea {...register('agenda')} className="input-field min-h-[100px]" placeholder="Points à aborder..."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              {meetingToEdit ? 'Enregistrer' : 'Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
