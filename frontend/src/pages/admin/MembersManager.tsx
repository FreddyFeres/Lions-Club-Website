import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { Search, Download, ShieldAlert, Ban, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function MembersManager() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => userService.getAll({ search: search || undefined }),
  });

  const promoteMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => userService.promote(id, role),
    onSuccess: () => {
      toast.success('Rôle mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour du rôle')
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => userService.deactivate(id, isActive),
    onSuccess: () => {
      toast.success('Statut du compte mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Erreur')
  });

  const handleExport = async () => {
    try {
      const blob = await userService.exportMembers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lions_members_${dayjs().format('YYYYMMDD')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Export réussi');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Membres & Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les rôles, les adhésions et l'accès au portail.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary bg-white">
          <Download className="w-5 h-5 mr-2" /> Exporter (CSV)
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher (nom, email)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle & Adhésion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((user: any) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center font-bold text-gray-500">
                        {user.avatar ? <img src={`/${user.avatar}`} alt="" className="h-full w-full object-cover" /> : `${user.firstName[0]}${user.lastName[0]}`}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">Inscrit le {dayjs(user.createdAt).format('DD/MM/YYYY')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={user.role} 
                      onChange={(e) => promoteMutation.mutate({ id: user.id, role: e.target.value })}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-lions-500 focus:border-lions-500 dark:bg-gray-800 py-1 pl-2 pr-8"
                    >
                      <option value="normal_user">Utilisateur Normal</option>
                      <option value="club_member">Membre du Club</option>
                      <option value="board_member">Membre du Bureau (Board)</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    {user.membershipNumber && (
                      <div className="text-xs text-gray-500 mt-1">N°: {user.membershipNumber}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                    {!user.isActive && user.accessCode && (
                      <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded border border-amber-200 dark:border-amber-800 flex flex-col items-start gap-0.5">
                        <span className="opacity-80">Code d'accès:</span>
                        <span className="text-sm font-bold tracking-wider">{user.accessCode}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleStatusMutation.mutate({ id: user.id, isActive: !user.isActive })}
                      className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={user.isActive ? "Désactiver le compte" : "Réactiver le compte"}
                    >
                      {user.isActive ? <Ban className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
