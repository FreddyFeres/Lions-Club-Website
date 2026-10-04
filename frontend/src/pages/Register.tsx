import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Shield } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  role: z.enum(['normal_user', 'club_member', 'board_member']),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'normal_user'
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await authService.register(data);
      if (response.status === 'PENDING_ACTIVATION') {
        toast.success("Compte créé ! En attente d'approbation. Demandez votre code d'accès à l'administrateur.", { duration: 6000 });
        navigate('/login');
      } else {
        login(response);
        toast.success('Compte créé avec succès ! Bienvenue.');
        navigate('/events');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-lions-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-xl w-full space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-soft-xl border border-white/50 dark:border-white/10 animate-scale-in relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-lions-100 to-lions-50 dark:from-lions-900/50 dark:to-lions-800/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50 dark:border-white/10">
            <UserPlus className="h-8 w-8 text-lions-600 dark:text-lions-400 filter drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">Créer un compte</h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Rejoignez la communauté Lions Club Tunis Golfe
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Prénom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('firstName')} className="input-field pl-10" placeholder="Ali" />
              </div>
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            
            <div>
              <label className="label">Nom</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('lastName')} className="input-field pl-10" placeholder="Ben Salah" />
              </div>
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('email')} type="email" className="input-field pl-10" placeholder="ali@exemple.com" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="label">Téléphone (Optionnel)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('phone')} type="tel" className="input-field pl-10" placeholder="+216 20 000 000" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Type de compte</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select {...register('role')} className="input-field pl-10 appearance-none">
                  <option value="normal_user">Utilisateur Standard</option>
                  <option value="club_member">Membre du Club</option>
                  <option value="board_member">Membre du Bureau</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('password')} type="password" className="input-field pl-10" placeholder="••••••••" />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('confirmPassword')} type="password" className="input-field pl-10" placeholder="••••••••" />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 text-base flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-lions-600 hover:text-lions-500 dark:text-lions-400">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
