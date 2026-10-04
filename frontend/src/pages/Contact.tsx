import React from 'react';
import { Mail, Phone, MapPin, Send, Code2, User, Briefcase, ExternalLink, Github, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-lions-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="section-label mb-4 inline-flex items-center gap-2">
            <Mail className="w-4 h-4" /> Contact
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Restons en <span className="text-transparent bg-clip-text bg-gradient-to-r from-lions-600 to-lions-400">Contact</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Vous avez une question, une suggestion ou vous souhaitez rejoindre notre club ? N'hésitez pas à nous écrire ou à contacter le développeur de cette plateforme.
          </p>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Club Contact */}
            <div className="animate-slide-up">
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-lions-100 dark:bg-lions-900/30 flex items-center justify-center text-lions-600">
                  🦁
                </span>
                Lions Club Tunis Golfe
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-lions-600 flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Email</h3>
                    <a href="mailto:Lionsclubtunisgolfe@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-lions-600 transition-colors">
                      Lionsclubtunisgolfe@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-lions-600 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">Localisation</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Tunis, Tunisie
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Envoyez-nous un message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="label">Nom complet</label>
                    <input type="text" className="input-field" placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="label">Adresse Email</label>
                    <input type="email" className="input-field" placeholder="vous@exemple.com" />
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea className="input-field min-h-[120px] resize-y" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                  </div>
                  <button type="button" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <Send className="w-4 h-4" /> Envoyer le message
                  </button>
                </form>
              </div>
            </div>

            {/* Developer Contact (Freddy's Card) */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Code2 className="w-6 h-6" />
                </span>
                Développeur de l'App
              </h2>

              {/* Developer Business Card Recreated in Code */}
              <div className="relative group perspective">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-3xl transform rotate-2 group-hover:rotate-3 transition-transform duration-500 opacity-20 blur-xl"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
                  
                  {/* Card Header Design */}
                  <div className="h-32 bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#415a77] relative overflow-hidden">
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  </div>

                  <div className="p-8 pt-0 relative">
                    {/* Avatar / Profile Badge */}
                    <div className="flex justify-between items-end -mt-12 mb-6 relative z-10">
                      <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-4 border-white dark:border-gray-900 flex items-center justify-center overflow-hidden">
                        <img src="/developer_photo.jpg" alt="Feres Fatmi" className="w-full h-full object-cover" />
                      </div>
                      <div className="pb-2">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-800">
                          Créateur
                        </span>
                      </div>
                    </div>

                    {/* Developer Info */}
                    <div className="mb-8">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                        Feres Fatmi
                      </h3>
                      <p className="text-[#1b263b] dark:text-blue-400 font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Business Analyst & Developer
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">
                        AKA <strong className="text-gray-900 dark:text-white">Freddy</strong>. Passionné par la création de solutions numériques innovantes et élégantes.
                      </p>
                    </div>

                    {/* Contact Details List */}
                    <div className="space-y-4">
                      <a href="tel:+21696973479" className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/link">
                        <div className="w-10 h-10 rounded-lg bg-[#1b263b] text-white flex items-center justify-center shadow-md group-hover/link:scale-110 transition-transform">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Phone</p>
                          <p className="text-gray-900 dark:text-white font-medium">+216 96 973 479</p>
                        </div>
                      </a>

                      <a href="mailto:feresfatmi07@gmail.com" className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/link">
                        <div className="w-10 h-10 rounded-lg bg-[#1b263b] text-white flex items-center justify-center shadow-md group-hover/link:scale-110 transition-transform">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mail</p>
                          <p className="text-gray-900 dark:text-white font-medium">feresfatmi07@gmail.com</p>
                        </div>
                      </a>

                      <div className="flex items-center gap-4 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-[#1b263b] text-white flex items-center justify-center shadow-md">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Address</p>
                          <p className="text-gray-900 dark:text-white font-medium">Ariana, Tunis</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
