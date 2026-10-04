import React, { useState, useEffect } from 'react';
import { getAllApplications, updateApplicationStatus, MembershipApplication } from '../../services/application.service';
import { CheckCircle, XCircle, Clock, Eye, Mail, Phone } from 'lucide-react';
import dayjs from 'dayjs';

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await getAllApplications();
      setApplications(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'interviewed' | 'approved' | 'rejected') => {
    try {
      await updateApplicationStatus(id, status);
      // Update local state
      setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1"/> En attente</span>;
      case 'interviewed': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center"><Eye className="w-3 h-3 mr-1"/> Entretien</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Approuvé</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center"><XCircle className="w-3 h-3 mr-1"/> Refusé</span>;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Candidatures</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profession</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucune candidature trouvée.</td>
                    </tr>
                  ) : applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.user?.firstName} {app.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{app.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {app.statusType} / {app.fieldOfStudy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {dayjs(app.createdAt).format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-lions-600 hover:text-lions-900 dark:text-lions-400 dark:hover:text-lions-300"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Détails Sidebar */}
        <div className="lg:col-span-1">
          {selectedApp ? (
            <div className="card p-6 sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Détails du candidat</h2>
                {getStatusBadge(selectedApp.status)}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Candidat</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedApp.user?.firstName} {selectedApp.user?.lastName}</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <a href={`mailto:${selectedApp.user?.email}`} className="text-sm text-lions-600 flex items-center">
                    <Mail className="w-4 h-4 mr-2" /> {selectedApp.user?.email}
                  </a>
                  {selectedApp.user?.phone && (
                    <a href={`tel:${selectedApp.user?.phone}`} className="text-sm text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-2" /> {selectedApp.user?.phone}
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Date de naissance</p>
                  <p className="text-gray-900 dark:text-gray-300 text-sm font-medium">{dayjs(selectedApp.birthDate).format('DD MMM YYYY')}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Statut & Domaine</p>
                  <p className="text-gray-900 dark:text-gray-300 text-sm font-medium">{selectedApp.statusType} - {selectedApp.fieldOfStudy}</p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expérience Associative</p>
                  <p className="text-gray-900 dark:text-gray-300 text-sm font-medium">
                    {selectedApp.hasPastExperience ? 'Oui' : 'Non'}
                  </p>
                  {selectedApp.hasPastExperience && selectedApp.pastExperienceDetails && (
                    <p className="text-gray-700 dark:text-gray-400 text-sm mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {selectedApp.pastExperienceDetails}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Compétences / Talents</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedApp.skills}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Motivations</p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedApp.motivation}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">A connu le club via :</p>
                  <ul className="list-disc list-inside text-sm text-gray-900 dark:text-gray-300">
                    {selectedApp.discoveryChannel?.map((channel, i) => <li key={i}>{channel}</li>)}
                    {!selectedApp.discoveryChannel?.length && <li>Non spécifié</li>}
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Disponibilités :</p>
                  <ul className="list-disc list-inside text-sm text-gray-900 dark:text-gray-300">
                    {selectedApp.availability?.map((avail, i) => <li key={i}>{avail}</li>)}
                    {!selectedApp.availability?.length && <li>Non spécifié</li>}
                  </ul>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Prêt pour des responsabilités ?</p>
                  <p className={`text-sm font-medium ${selectedApp.readyForResponsibility ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedApp.readyForResponsibility ? "Oui, s'investit pleinement" : "Non"}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Changer le statut :</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedApp.id, 'interviewed')}
                      className={`btn-secondary text-xs py-2 ${selectedApp.status === 'interviewed' ? 'border-blue-500 text-blue-600' : ''}`}
                    >
                      Entretien
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedApp.id, 'approved')}
                      className={`btn-secondary text-xs py-2 ${selectedApp.status === 'approved' ? 'border-green-500 text-green-600' : ''} hover:text-green-600 hover:border-green-300`}
                    >
                      Approuver
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                      className={`btn-secondary text-xs py-2 ${selectedApp.status === 'rejected' ? 'border-red-500 text-red-600' : ''} hover:text-red-600 hover:border-red-300`}
                    >
                      Refuser
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedApp.id, 'pending')}
                      className={`btn-secondary text-xs py-2 ${selectedApp.status === 'pending' ? 'border-yellow-500 text-yellow-600' : ''}`}
                    >
                      En attente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center text-gray-500 h-64">
              <Eye className="w-12 h-12 text-gray-300 mb-2" />
              <p>Sélectionnez une candidature pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
