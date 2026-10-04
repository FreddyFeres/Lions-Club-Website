import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitApplication, getMyApplication, MembershipApplication } from '../services/application.service';
import { Briefcase, Heart, UserPlus, CheckCircle, Clock, Calendar as CalendarIcon, Zap, CheckSquare } from 'lucide-react';

export default function JoinClub() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    birthDate: '',
    statusType: '',
    fieldOfStudy: '',
    hasPastExperience: '',
    pastExperienceDetails: '',
    skills: '',
    motivation: '',
    readyForResponsibility: ''
  });
  const [discoveryChannel, setDiscoveryChannel] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingApp, setExistingApp] = useState<MembershipApplication | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/join');
      return;
    }

    const checkExisting = async () => {
      try {
        const res = await getMyApplication();
        if (res.data) {
          setExistingApp(res.data);
        }
      } catch (err) {
        console.error('Error fetching application status', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkExisting();
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (stateVar: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (stateVar.includes(value)) {
      setter(stateVar.filter(item => item !== value));
    } else {
      setter([...stateVar, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Custom validations can be added here if needed
    if (!formData.birthDate || !formData.statusType || !formData.fieldOfStudy || !formData.hasPastExperience || !formData.skills || !formData.motivation || !formData.readyForResponsibility) {
      setError('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        discoveryChannel,
        availability,
      };
      const res = await submitApplication(payload);
      setExistingApp(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lions-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 relative h-80 md:h-[400px] group">
          <img src="/volunteers.png" alt="Lions Volunteers" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-transparent flex flex-col justify-end p-8 md:p-12 text-left">
            <div className="inline-flex items-center justify-center p-3 bg-lions-600/90 backdrop-blur-md rounded-2xl mb-6 w-14 h-14 shadow-lg border border-white/20">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4 tracking-tight leading-tight">
              Rejoignez l'Aventure
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl leading-relaxed font-light">
              Le Lions Club Tunis Golfe est une association de service bénévole locale affiliée au Lions Clubs International. 
              Votre engagement fait la différence dans notre communauté.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">

        {existingApp ? (
          <div className="card p-8 text-center animate-fade-in">
            {/* Status messages omitted for brevity, same as before */}
            {existingApp.status === 'pending' && (
              <>
                <Clock className="w-16 h-16 text-lions-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Candidature en cours</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre demande est actuellement en cours d'examen par notre bureau. Nous vous contacterons bientôt !
                </p>
              </>
            )}
            {existingApp.status === 'interviewed' && (
              <>
                <UserPlus className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Entretien programmé</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Nous avons hâte d'échanger avec vous plus en détail sur votre motivation.
                </p>
              </>
            )}
            {existingApp.status === 'approved' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Félicitations !</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Votre candidature a été approuvée. Bienvenue dans le Lions Club Tunis Golfe !
                </p>
              </>
            )}
            {existingApp.status === 'rejected' && (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Candidature refusée</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Malheureusement, nous ne pouvons pas donner suite à votre candidature pour le moment.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="card p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* SECTION 1: Informations Personnelles (auto-remplies) */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Informations Personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500">1. Nom et prénom *</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">3. Adresse Email *</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{user?.email}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">4. Numéro de téléphone</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200 text-sm italic text-yellow-600">Renseignez votre téléphone dans votre profil si ce n'est pas déjà fait.</span>
                  </div>
                </div>
              </div>

              {/* 2. Date de naissance */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  2. Date de naissance <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="input-field max-w-sm"
                />
              </div>

              {/* 5. Statut */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  5. Tu es étudiant ou fonctionnaire ? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Etudiant', 'Fonctionnaire', 'Autre'].map(option => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="statusType"
                        value={option}
                        checked={formData.statusType === option}
                        onChange={handleInputChange}
                        required
                        className="form-radio h-4 w-4 text-lions-600 focus:ring-lions-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Domaine d'étude / travail */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  6. Quel est votre domaine d'étude / de travail ? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Votre réponse"
                />
              </div>

              {/* 7 & 8. Expérience associative */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  7. Avez-vous déjà eu une expérience dans la vie associative quelque soit avec Lions ou d'autres clubs ? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 mb-4">
                  {['oui', 'non'].map(option => (
                    <label key={option} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasPastExperience"
                        value={option}
                        checked={formData.hasPastExperience === option}
                        onChange={handleInputChange}
                        required
                        className="form-radio h-4 w-4 text-lions-600 focus:ring-lions-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{option}</span>
                    </label>
                  ))}
                </div>

                {formData.hasPastExperience === 'oui' && (
                  <div className="ml-6 border-l-2 border-lions-200 pl-4 animate-fade-in">
                    <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                      8. Si oui, précisez
                    </label>
                    <textarea
                      name="pastExperienceDetails"
                      rows={2}
                      value={formData.pastExperienceDetails}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Votre réponse"
                      required={formData.hasPastExperience === 'oui'}
                    />
                  </div>
                )}
              </div>

              {/* 9. Compétences */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  9. Quelles sont vos principales compétences ou talents que vous souhaitez mettre au service du club ? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="skills"
                  rows={3}
                  value={formData.skills}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Votre réponse"
                />
              </div>

              {/* 10. Motivation */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  10. Pourquoi souhaitez-vous rejoindre le Lions Club Tunis Golfe ? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="motivation"
                  rows={4}
                  value={formData.motivation}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Votre réponse"
                />
              </div>

              {/* 11. Comment avez-vous entendu parler */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  11. Comment avez-vous entendu parler de notre club?
                </label>
                <div className="space-y-2">
                  {[
                    'Par un membre du Club',
                    'Lors d\'un événement ou d\'une activité organisée par le Club',
                    'Via les réseaux sociaux (Facebook, Instagram, TikTok...)',
                    'Par une recherche personnelle sur Internet'
                  ].map(option => (
                    <label key={option} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discoveryChannel.includes(option)}
                        onChange={() => handleCheckboxChange(discoveryChannel, setDiscoveryChannel, option)}
                        className="form-checkbox h-4 w-4 text-lions-600 focus:ring-lions-500 mt-1"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 12. Disponibilité */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  12. Quels sont les moments où vous êtes le plus disponible pour des réunions ou des actions de club ? <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-2">(Plusieurs choix possibles)</p>
                <div className="space-y-2">
                  {[
                    'A. Les soirs de semaine (après 17h)',
                    'B. Les week-ends (Vendredi soir / Samedi / Dimanche)',
                    'C. En journée pendant la semaine',
                    'D. Ma disponibilité est très variable, mais je m\'engage à être présent pour les événements majeurs.'
                  ].map(option => (
                    <label key={option} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availability.includes(option)}
                        onChange={() => handleCheckboxChange(availability, setAvailability, option)}
                        className="form-checkbox h-4 w-4 text-lions-600 focus:ring-lions-500 mt-1"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 13. Responsabilités */}
              <div>
                <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  13. Êtes-vous prêt à prendre des responsabilités (Chef d'action, passage radio ou responsable département etc.) ? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    { label: "Oui, je suis prêt(e) à m'investir pleinement", val: 'oui' },
                    { label: "Non", val: 'non' }
                  ].map(option => (
                    <label key={option.val} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="readyForResponsibility"
                        value={option.val}
                        checked={formData.readyForResponsibility === option.val}
                        onChange={handleInputChange}
                        required
                        className="form-radio h-4 w-4 text-lions-600 focus:ring-lions-500"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={loading || availability.length === 0}
                  className="btn-primary w-full py-4 text-lg justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </button>
                {availability.length === 0 && (
                  <p className="text-red-500 text-sm text-center mt-2">Veuillez sélectionner au moins une disponibilité (Question 12).</p>
                )}
              </div>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
