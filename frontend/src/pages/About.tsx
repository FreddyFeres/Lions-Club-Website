import React from 'react';
import { Globe, Heart, Users, Target, ShieldCheck, Handshake } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-lions-500/10 dark:bg-lions-900/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="section-label mb-4 inline-flex items-center gap-2">
              <Globe className="w-4 h-4" /> Lions Clubs International
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-gray-900 dark:text-white mb-6 tracking-tight">
              Nous Servons.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lions-600 to-lions-400">
                Où il y a un besoin, il y a un Lion.
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Le Lions Clubs International est la plus grande organisation de clubs philanthropiques au monde. Depuis plus d'un siècle, nous servons nos communautés locales et participons à des actions mondiales pour améliorer la santé et le bien-être, renforcer les communautés et soutenir les personnes dans le besoin.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Images */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Block 1 */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-soft-2xl aspect-[4/3]">
                <img 
                  src="/images/about-globe.png" 
                  alt="Réseau Mondial Lions" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Un Réseau Mondial</h3>
                  <p className="text-gray-200">1.4 million de membres unis par la même passion de servir.</p>
                </div>
              </div>
            </div>

            {/* Text Block 1 */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                Notre Histoire
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Fondé en 1917 par Melvin Jones, le Lions Clubs International s'est développé avec la conviction que nous pouvons réaliser bien plus ensemble que seuls. Ce qui a commencé comme une petite idée à Chicago est devenu une immense communauté mondiale active dans plus de 200 pays et aires géographiques.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Au fil des décennies, les Lions se sont distingués par des campagnes mondiales majeures, notamment pour la préservation de la vue, la lutte contre le diabète, la protection de l'environnement, le soutien à la jeunesse et l'aide aux victimes de catastrophes.
              </p>
            </div>

            {/* Text Block 2 */}
            <div className="space-y-6 order-2 lg:order-1 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                Lions Club Tunis Golfe
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Notre club, le Lions Club Tunis Golfe, est un maillon fort de cette chaîne mondiale. Nous concentrons nos efforts sur les besoins spécifiques de la communauté en Tunisie. Nos actions vont du soutien aux écoles rurales, aux campagnes de dépistage médical, en passant par l'aide alimentaire et les grands événements de collecte de fonds.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Rejoindre notre club, c'est intégrer une famille engagée, où chaque membre apporte son expertise, son temps et son cœur pour créer un impact positif et durable dans notre pays.
              </p>
            </div>

            {/* Image Block 2 */}
            <div className="relative order-1 lg:order-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative rounded-3xl overflow-hidden shadow-soft-2xl aspect-[4/3]">
                <img 
                  src="/images/about-service.png" 
                  alt="Service Communautaire" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Service Communautaire</h3>
                  <p className="text-gray-200">Des actions concrètes pour un impact réel et immédiat.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="py-20 bg-lions-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Notre Impact Mondial</h2>
            <p className="text-lions-200 max-w-2xl mx-auto">Quelques chiffres qui illustrent la portée incroyable de notre réseau de bénévoles à travers le globe.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Membres Actifs', value: '1.4M+', icon: Users },
              { label: 'Clubs Locaux', value: '48 000+', icon: ShieldCheck },
              { label: 'Pays & Territoires', value: '200+', icon: Globe },
              { label: 'Personnes Aidées/An', value: '275M+', icon: Heart },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <stat.icon className="w-10 h-10 text-lions-400 mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-display font-black text-white mb-2">{stat.value}</div>
                <div className="text-lions-200 font-medium text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
