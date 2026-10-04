import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Building2, CreditCard, CheckCircle2 } from 'lucide-react';
import { financeService } from '../services/finance.service';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const donateSchema = z.object({
  donorName: z.string().min(2, 'Le nom est requis'),
  donorEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  amount: z.coerce.number().min(5, 'Le montant minimum est de 5 TND'),
  notes: z.string().optional(),
});

type DonateForm = z.infer<typeof donateSchema>;

export default function Donate() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful }, reset } = useForm<DonateForm>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      donorName: user ? `${user.firstName} ${user.lastName}` : '',
      donorEmail: user ? user.email : '',
    }
  });

  const onSubmit = async (data: DonateForm) => {
    try {
      await financeService.donate(data);
      toast.success('Promesse de don enregistrée ! Merci pour votre générosité.');
    } catch (err) {
      toast.error("Une erreur s'est produite");
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-10 text-center animate-fade-in border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Merci pour votre soutien !</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Votre promesse de don a été enregistrée avec succès. Pour finaliser votre don, veuillez effectuer un virement bancaire sur le compte ci-dessous.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl text-left border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Building2 className="w-5 h-5 mr-2 text-lions-600"/> Nos Coordonnées Bancaires</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3"><span className="text-gray-500 dark:text-gray-400">Banque:</span> <span className="col-span-2 font-medium dark:text-white">BIAT (Banque Internationale Arabe de Tunisie)</span></div>
              <div className="grid grid-cols-3"><span className="text-gray-500 dark:text-gray-400">Titulaire:</span> <span className="col-span-2 font-medium dark:text-white">Lions Club Tunis Golfe</span></div>
              <div className="grid grid-cols-3"><span className="text-gray-500 dark:text-gray-400">RIB:</span> <span className="col-span-2 font-mono font-bold text-lions-600 dark:text-lions-400 tracking-wider">08 000 000 1234567890 12</span></div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              Veuillez indiquer votre nom dans le libellé du virement pour que nous puissions identifier votre don.
            </p>
          </div>
          
          <div className="mt-8">
            <button onClick={() => reset()} className="btn-secondary mr-4">Faire un autre don</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Heart className="w-16 h-16 text-lions-600 mx-auto mb-4 animate-pulse-slow" />
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Soutenez nos actions</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Votre générosité nous permet de financer nos œuvres sociales et d'aider ceux qui en ont le plus besoin dans notre communauté.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lions-500 to-gold-500"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Promesse de don</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Nom complet / Société</label>
                  <input {...register('donorName')} className="input-field" placeholder="Votre nom" />
                  {errors.donorName && <p className="mt-1 text-sm text-red-600">{errors.donorName.message}</p>}
                </div>
                <div>
                  <label className="label">Email (Optionnel)</label>
                  <input {...register('donorEmail')} type="email" className="input-field" placeholder="pour le reçu" />
                  {errors.donorEmail && <p className="mt-1 text-sm text-red-600">{errors.donorEmail.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">Montant (TND)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="font-semibold text-gray-500">TND</span>
                  </div>
                  <input 
                    {...register('amount')} 
                    type="number" 
                    step="1"
                    className="input-field pl-14 text-lg font-bold" 
                    placeholder="100" 
                  />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
                
                {/* Quick amount buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[20, 50, 100, 200, 500].map(val => (
                    <button 
                      key={val} 
                      type="button"
                      onClick={() => reset(form => ({ ...form, amount: val }))}
                      className="px-3 py-1 text-sm font-medium rounded-full bg-lions-50 text-lions-700 hover:bg-lions-100 border border-lions-200 transition-colors"
                    >
                      {val} TND
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Message (Optionnel)</label>
                <textarea {...register('notes')} className="input-field min-h-[100px]" placeholder="Un petit mot d'encouragement..."></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full btn-primary py-4 text-lg font-bold mt-4"
              >
                {isSubmitting ? 'Enregistrement...' : 'Confirmer mon don'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                En cliquant sur ce bouton, vous enregistrez une promesse de don. Le transfert s'effectuera par virement bancaire.
              </p>
            </form>
          </div>

          {/* Info Side */}
          <div className="space-y-8">
            <div className="bg-lions-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Heart className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3" /> Virement Bancaire
                </h3>
                <p className="text-lions-100 mb-6 leading-relaxed">
                  Pour les dons depuis la Tunisie, nous privilégions les virements bancaires afin d'éviter les frais de transaction.
                </p>
                <div className="bg-lions-800/50 rounded-xl p-5 border border-lions-700 font-mono">
                  <div className="mb-2 text-lions-200 text-sm">RIB BIAT</div>
                  <div className="text-xl tracking-widest break-all">08 000 000 1234567890 12</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">À quoi sert votre don ?</h3>
              <ul className="space-y-4">
                {[
                  "Financement de matériel médical pour les hôpitaux locaux",
                  "Soutien aux familles nécessiteuses (couffins du Ramadan)",
                  "Aménagement d'écoles dans les zones rurales",
                  "Actions environnementales (nettoyage des plages, reboisement)"
                ].map((text, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
