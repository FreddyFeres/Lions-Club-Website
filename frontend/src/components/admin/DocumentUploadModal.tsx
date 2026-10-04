import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/document.service';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';

const documentSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  description: z.string().optional(),
  visibility: z.enum(['public', 'members', 'board']),
  file: z.any()
    .refine((files) => files?.length == 1, 'Fichier requis.')
});

type DocumentForm = z.infer<typeof documentSchema>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentUploadModal({ isOpen, onClose }: DocumentUploadModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      visibility: 'members'
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => documentService.upload(data),
    onSuccess: () => {
      toast.success('Document uploadé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      reset();
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'upload")
  });

  const onSubmit = (data: DocumentForm) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('visibility', data.visibility);
    formData.append('file', data.file[0]);

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Upload className="w-5 h-5 mr-2" /> Uploader un Document
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Titre du document</label>
            <input {...register('title')} type="text" className="input-field" placeholder="Ex: Rapport Financier Q1" />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>}
          </div>
          
          <div>
            <label className="label">Fichier</label>
            <input {...register('file')} type="file" className="input-field py-2" />
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file.message as string}</p>}
          </div>

          <div>
            <label className="label">Visibilité (Accès)</label>
            <select {...register('visibility')} className="input-field">
              <option value="public">Public (Tout le monde)</option>
              <option value="members">Membres uniquement</option>
              <option value="board">Bureau Élargi (Board)</option>
            </select>
            {errors.visibility && <p className="mt-1 text-sm text-red-600">{errors.visibility.message as string}</p>}
          </div>

          <div>
            <label className="label">Description (Optionnel)</label>
            <textarea {...register('description')} className="input-field min-h-[80px]" placeholder="Brève description..."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              Uploader
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
