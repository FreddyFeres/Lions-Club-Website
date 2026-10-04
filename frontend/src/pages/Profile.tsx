import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Camera, Briefcase, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profession: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: (user as any)?.phone || '',
      bio: (user as any)?.bio || '',
      profession: (user as any)?.profession || '',
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);
      toast.success('Profil mis à jour avec succès');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const response = await userService.updateAvatar(formData);
      updateUser({ avatar: response.avatar });
      toast.success('Photo de profil mise à jour');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8">Mon Profil</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header background */}
          <div className="h-32 bg-gradient-to-r from-lions-600 to-lions-400"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            {/* Avatar section */}
            <div className="relative -mt-16 mb-8 flex justify-between items-end">
              <div className="relative group">
                {user?.avatar ? (
                  <img src={`/${user.avatar}`} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-lions-100 text-lions-800 flex items-center justify-center text-4xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                
                <label className="absolute bottom-0 right-0 bg-lions-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-lions-700 transition-colors shadow-lg border-2 border-white dark:border-gray-800 group-hover:scale-110">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
                </label>
              </div>
              
              <div className="pb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-lions-50 text-lions-700 border border-lions-200 dark:bg-lions-900/30 dark:text-lions-300 dark:border-lions-800 capitalize shadow-sm">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.membershipNumber && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span>N° Membre: <strong>{user.membershipNumber}</strong></span>
                </div>
              )}
              {(user as any)?.joinDate && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Membre depuis: {dayjs((user as any).joinDate).format('MMMM YYYY')}</span>
                </div>
              )}
              {(user as any)?.duesPaidUntil && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className={`w-3 h-3 rounded-full mr-3.5 ml-1 ${dayjs((user as any).duesPaidUntil).isAfter(dayjs()) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Cotisation valide jusqu'au: {dayjs((user as any).duesPaidUntil).format('DD/MM/YYYY')}</span>
                </div>
              )}
            </div>

            {/* Editable Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations Personnelles</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="label">Prénom</label>
                  <input {...register('firstName')} className="input-field" />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input {...register('lastName')} className="input-field" />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="label flex items-center"><Phone className="w-4 h-4 mr-1.5" /> Téléphone</label>
                  <input {...register('phone')} type="tel" className="input-field" placeholder="+216..." />
                </div>
                <div>
                  <label className="label flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> Profession</label>
                  <input {...register('profession')} className="input-field" placeholder="Ingénieur, Médecin..." />
                </div>
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea {...register('bio')} className="input-field min-h-[100px]" placeholder="Quelques mots sur vous..."></textarea>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
