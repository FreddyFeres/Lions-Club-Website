import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Key } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  accessCode: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showAccessCode, setShowAccessCode] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await authService.login(data);
      login(response);
      toast.success('Connexion réussie !');
      
      // Redirect based on role
      if (response.user.role === 'admin' || response.user.role === 'board_member') {
        navigate('/admin');
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      if (err.response?.data?.error === 'ACCOUNT_PENDING_ACTIVATION') {
        setShowAccessCode(true);
        toast.error(err.response?.data?.message || "Veuillez saisir votre code d'accès.");
      } else {
        toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-lions-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-soft-xl border border-white/50 dark:border-white/10 animate-scale-in relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-lions-100 to-lions-50 dark:from-lions-900/50 dark:to-lions-800/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/50 dark:border-white/10">
            <span className="text-3xl filter drop-shadow-sm">🦁</span>
          </div>
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white tracking-tight">Bon retour</h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Connectez-vous à votre espace Lions Club
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="label">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="vous@exemple.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label className="label mb-0">Mot de passe</label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-lions-600 hover:text-lions-500 dark:text-lions-400">Mot de passe oublié ?</a>
                </div>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {showAccessCode && (
              <div className="animate-fade-in">
                <label className="label text-amber-600 dark:text-amber-500">Code d'accès administrateur (4 chiffres)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    {...register('accessCode')}
                    type="text"
                    maxLength={4}
                    className="input-field pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    placeholder="1234"
                  />
                </div>
                <p className="mt-2 text-xs text-amber-600/80 dark:text-amber-400/80">
                  Votre compte est en attente d'approbation. Veuillez saisir le code fourni par l'administrateur.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-2.5 text-base flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" /> Se connecter
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-lions-600 hover:text-lions-500 dark:text-lions-400">
              S'inscrire maintenant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
