import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/event.service';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

const eventSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  description: z.string().optional(),
  location: z.string().min(3, 'Lieu requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  capacity: z.coerce.number().min(1, 'Capacité requise'),
  image: z.any().optional(),
});

type EventForm = z.infer<typeof eventSchema>;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: any;
}

export default function EventFormModal({ isOpen, onClose, eventToEdit }: EventFormModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: eventToEdit?.title || '',
      description: eventToEdit?.description || '',
      location: eventToEdit?.location || '',
      startDate: eventToEdit ? dayjs(eventToEdit.startDate).format('YYYY-MM-DDTHH:mm') : '',
      endDate: eventToEdit ? dayjs(eventToEdit.endDate).format('YYYY-MM-DDTHH:mm') : '',
      capacity: eventToEdit?.capacity || 0,
    }
  });

  // Reset form when eventToEdit changes
  React.useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        description: eventToEdit.description || '',
        location: eventToEdit.location,
        startDate: dayjs(eventToEdit.startDate).format('YYYY-MM-DDTHH:mm'),
        endDate: dayjs(eventToEdit.endDate).format('YYYY-MM-DDTHH:mm'),
        capacity: eventToEdit.capacity,
      });
    } else {
      reset({ title: '', description: '', location: '', startDate: '', endDate: '', capacity: 0 });
    }
  }, [eventToEdit, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (eventToEdit) return eventService.update(eventToEdit.id, data);
      return eventService.create(data);
    },
    onSuccess: () => {
      toast.success(`Événement ${eventToEdit ? 'modifié' : 'créé'} avec succès`);
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      reset();
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'opération")
  });

  const onSubmit = (data: EventForm) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append('startDate', new Date(data.startDate).toISOString());
    formData.append('endDate', new Date(data.endDate).toISOString());
    formData.append('capacity', data.capacity.toString());
    
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-fade-in my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {eventToEdit ? "Modifier l'événement" : "Nouvel événement"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Titre</label>
              <input {...register('title')} type="text" className="input-field" placeholder="Ex: Gala de Charité" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>}
            </div>
            <div>
              <label className="label">Lieu</label>
              <input {...register('location')} type="text" className="input-field" placeholder="Ex: Tunis" />
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>}
            </div>
            
            <div>
              <label className="label">Date de début</label>
              <input {...register('startDate')} type="datetime-local" className="input-field" />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message as string}</p>}
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input {...register('endDate')} type="datetime-local" className="input-field" />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message as string}</p>}
            </div>

            <div>
              <label className="label">Capacité</label>
              <input {...register('capacity')} type="number" className="input-field" placeholder="Ex: 100" />
              {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message as string}</p>}
            </div>
            
            <div>
              <label className="label">Image (Optionnel)</label>
              <input {...register('image')} type="file" accept="image/*" className="input-field py-2" />
            </div>
          </div>
          
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} className="input-field min-h-[100px]" placeholder="Détails de l'événement..."></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              {eventToEdit ? 'Enregistrer' : "Créer l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
