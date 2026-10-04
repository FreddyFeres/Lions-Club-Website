import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { Search, Mail, Phone, Briefcase } from 'lucide-react';

export default function MemberDirectory() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['directory', search],
    queryFn: () => userService.getDirectory({ search: search || undefined }),
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Annuaire des Membres</h1>
            <p className="text-gray-600 dark:text-gray-400">Retrouvez les coordonnées des membres du club.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="card p-6 animate-pulse flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((member: any) => (
              <div key={member.id} className="card p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {member.avatar ? (
                    <img src={`/${member.avatar}`} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-lions-50 dark:border-gray-700" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-lions-100 text-lions-800 flex items-center justify-center text-2xl font-bold border-4 border-lions-50 dark:border-gray-700">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={member.isActive ? 'Actif' : 'Inactif'}></div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-lions-50 text-lions-700 border border-lions-100 dark:bg-lions-900/30 dark:text-lions-300 dark:border-lions-800 capitalize">
                  {member.role.replace('_', ' ')}
                </span>
                
                <div className="w-full mt-5 space-y-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <a href={`mailto:${member.email}`} className="flex items-center text-sm text-gray-600 hover:text-lions-600 dark:text-gray-400 dark:hover:text-lions-400 transition-colors">
                    <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center text-sm text-gray-600 hover:text-lions-600 dark:text-gray-400 dark:hover:text-lions-400 transition-colors">
                      <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                  {member.profession && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span className="truncate">{member.profession}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun membre trouvé</h3>
          </div>
        )}
      </div>
    </div>
  );
}
