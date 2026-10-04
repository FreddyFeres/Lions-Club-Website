import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../../services/finance.service';
import toast from 'react-hot-toast';
import { X, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

const transactionSchema = z.object({
  description: z.string().min(3, 'Description requise'),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().min(0.01, 'Montant invalide'),
  category: z.enum(['Fundraising', 'MembershipFees', 'Donations', 'Equipment', 'Supplies', 'Operational', 'Other']),
  transactionDate: z.string().min(1, 'Date requise'),
  receipt: z.any().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionFormModal({ isOpen, onClose }: TransactionFormModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      category: 'Other',
      transactionDate: dayjs().format('YYYY-MM-DD'),
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => financeService.createTransaction(data),
    onSuccess: () => {
      toast.success('Transaction enregistrée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance-summary'] });
      reset();
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const onSubmit = (data: TransactionForm) => {
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('amount', data.amount.toString());
    formData.append('category', data.category);
    formData.append('transactionDate', new Date(data.transactionDate).toISOString());
    
    if (data.receipt && data.receipt[0]) {
      formData.append('receipt', data.receipt[0]);
    }

    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl animate-fade-in my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-lions-500" /> Nouvelle Transaction
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Type de transaction</label>
              <select {...register('type')} className="input-field">
                <option value="income">Revenu (+)</option>
                <option value="expense">Dépense (-)</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message as string}</p>}
            </div>
            <div>
              <label className="label">Montant (TND)</label>
              <input {...register('amount')} type="number" step="0.01" className="input-field" placeholder="Ex: 150.00" />
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message as string}</p>}
            </div>
            
            <div>
              <label className="label">Catégorie</label>
              <select {...register('category')} className="input-field">
                <option value="Fundraising">Levée de fonds</option>
                <option value="MembershipFees">Cotisations</option>
                <option value="Donations">Dons</option>
                <option value="Equipment">Équipement</option>
                <option value="Supplies">Fournitures</option>
                <option value="Operational">Frais opérationnels</option>
                <option value="Other">Autre</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>}
            </div>
            <div>
              <label className="label">Date de la transaction</label>
              <input {...register('transactionDate')} type="date" className="input-field" />
              {errors.transactionDate && <p className="mt-1 text-sm text-red-600">{errors.transactionDate.message as string}</p>}
            </div>
          </div>
          
          <div>
            <label className="label">Description / Libellé</label>
            <input {...register('description')} type="text" className="input-field" placeholder="Ex: Achat de fournitures pour l'événement..." />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>}
          </div>

          <div>
            <label className="label">Reçu / Justificatif (Optionnel)</label>
            <input {...register('receipt')} type="file" className="input-field py-2" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
