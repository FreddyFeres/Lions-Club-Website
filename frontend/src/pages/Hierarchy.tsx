import React from 'react';
import { 
  Users, Award, Briefcase, Calculator, PenTool, Flag, 
  HeartHandshake, UserPlus, Coins, Megaphone, Leaf
} from 'lucide-react';

export default function Hierarchy() {
  const boardMembers = [
    {
      role: 'Le Président',
      icon: Award,
      description: "Leader principal du club. Il préside toutes les réunions, inspire les membres et s'assure que le club atteint ses objectifs de service et de croissance.",
      color: 'from-amber-400 to-amber-600'
    },
    {
      role: 'Le 1er Vice-Président',
      icon: Briefcase,
      description: "Seconde le président dans ses tâches et se prépare à prendre la direction du club l'année suivante. Il supervise souvent l'avancement des commissions.",
      color: 'from-blue-400 to-blue-600'
    },
    {
      role: 'Le Secrétaire',
      icon: PenTool,
      description: "La mémoire du club. Il gère l'administration, rédige les procès-verbaux, tient à jour les dossiers des membres et gère les correspondances officielles.",
      color: 'from-green-400 to-green-600'
    },
    {
      role: 'Le Trésorier',
      icon: Calculator,
      description: "Gardien des finances. Il gère les cotisations (compte de fonctionnement) et les dons récoltés (compte d'œuvres) en toute transparence.",
      color: 'from-purple-400 to-purple-600'
    },
    {
      role: 'Le Chef de Protocole (Tail Twister)',
      icon: Flag,
      description: "Animateur des réunions. Il maintient l'enthousiasme, fait respecter le protocole Lions et veille à la cohésion amicale du groupe.",
      color: 'from-rose-400 to-rose-600'
    }
  ];

  const committees = [
    {
      name: 'Action Sociale & Œuvres',
      icon: HeartHandshake,
      description: "Cœur de notre engagement. Cette commission identifie les besoins de la communauté et planifie les actions caritatives et bénévoles.",
      color: 'text-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-100 dark:border-rose-800'
    },
    {
      name: 'Effectifs (Membership)',
      icon: UserPlus,
      description: "En charge du recrutement de nouveaux membres, de leur intégration et de la fidélisation des membres existants.",
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800'
    },
    {
      name: 'Finances & Levée de fonds',
      icon: Coins,
      description: "Organise les événements majeurs (galas, tournois, ventes) pour récolter les fonds nécessaires à la réalisation de nos actions sociales.",
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800'
    },
    {
      name: 'Communication & Relations Publiques',
      icon: Megaphone,
      description: "Gère l'image du club, les réseaux sociaux, le site web et les relations avec la presse pour faire rayonner nos actions.",
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-100 dark:border-purple-800'
    },
    {
      name: 'Jeunesse (Léo Club)',
      icon: Leaf,
      description: "Encadre et soutient les jeunes du Léo Club partenaire, en les guidant dans leurs propres actions de service communautaire.",
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800'
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-lions-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="section-label mb-4 inline-flex items-center gap-2">
            <Users className="w-4 h-4" /> Organisation
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Structure & <span className="text-transparent bg-clip-text bg-gradient-to-r from-lions-600 to-lions-400">Hiérarchie</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment notre club est organisé. Chaque membre joue un rôle clé dans notre mission commune : servir notre communauté avec efficacité et bienveillance.
          </p>
        </div>
      </section>

      {/* Board Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Le Bureau Exécutif (Le Board)</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Élu chaque année, le bureau exécutif est responsable de la gestion administrative, financière et morale du club.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardMembers.map((member, index) => (
              <div 
                key={index} 
                className={`card p-8 group hover:-translate-y-2 transition-all duration-300 animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-6 shadow-lg shadow-${member.color.split('-')[1]}-500/30 transform group-hover:scale-110 transition-transform duration-300`}>
                  <member.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{member.role}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committees Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Commissions & Départements</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Les forces vives du club. Chaque commission se concentre sur un domaine spécifique pour transformer nos idées en actions concrètes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {committees.map((committee, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl border ${committee.border} ${committee.bg} flex items-start gap-5 hover:shadow-soft-xl transition-shadow duration-300 animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${committee.color}`}>
                  <committee.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{committee.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {committee.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
