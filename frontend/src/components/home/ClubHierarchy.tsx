import React from 'react';

const members = [
  {
    name: 'Joud Cherif',
    role: 'Fondatrice',
    image: '/equipe/joud.jpg',
    initials: 'JC',
    color: 'from-amber-500 to-amber-700'
  },
  {
    name: 'Mouhib Barbouch',
    role: 'Président',
    image: '/equipe/mouhib.jpg',
    initials: 'MB',
    color: 'from-lions-600 to-lions-800'
  },
  {
    name: 'Ikram Jarraya',
    role: 'Vice Présidente',
    image: '/equipe/ikram.jpg',
    initials: 'IJ',
    color: 'from-blue-400 to-blue-600'
  },
  {
    name: 'Brahim Riahi',
    role: 'IPP',
    image: '/equipe/brahim.jpg',
    initials: 'BR',
    color: 'from-gray-500 to-gray-700'
  },
  {
    name: 'Asma Gharbi',
    role: 'Trésorière',
    image: '/equipe/asma.jpg',
    initials: 'AG',
    color: 'from-green-500 to-green-700'
  },
  {
    name: 'Salma Akili',
    role: 'Responsable Logistique',
    image: '/equipe/salma.jpg',
    initials: 'SA',
    color: 'from-pink-500 to-pink-700'
  },
  {
    name: 'Feres Fatmi',
    role: 'Responsable Marketing et Communication',
    image: '/equipe/feres.jpg',
    initials: 'FF',
    color: 'from-purple-500 to-purple-700'
  }
];

export default function ClubHierarchy() {
  return (
    <div className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-lions-600 dark:text-lions-400 font-semibold uppercase tracking-widest text-sm">Le Bureau</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mt-3">
            Bureau Élargi
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Découvrez l'équipe engagée qui dirige notre club et coordonne nos actions au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {members.map((member, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div className="relative mb-6">
                {/* Decorative border */}
                <div className="absolute inset-0 bg-gold-400 rounded-full scale-[1.05] opacity-0 group-hover:opacity-100 group-hover:scale-[1.1] transition-all duration-300"></div>
                
                {/* Avatar container */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-100 dark:bg-gray-800 z-10 flex items-center justify-center">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-5xl font-bold transition-transform duration-500 group-hover:scale-110`}>
                      {member.initials}
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                {member.name}
              </h3>
              <p className="text-lions-600 dark:text-lions-400 font-medium text-center text-sm uppercase tracking-wide">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
