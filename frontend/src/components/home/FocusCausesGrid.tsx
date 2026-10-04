import React from 'react';

export default function FocusCausesGrid() {
  const axes = [
    { id: 'cancer', name: 'Cancer Infantile', image: '/axes/cancer.png', color: 'from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/20' },
    { id: 'faim', name: 'Lutter contre la Faim', image: '/axes/faim.png', color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/20' },
    { id: 'diabete', name: 'Diabète', image: '/axes/diabete.png', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
    { id: 'vue', name: 'La Vue', image: '/axes/vue.png', color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/20' },
    { id: 'environnement', name: 'Environnement', image: '/axes/environnement.png', color: 'from-green-400 to-green-600', shadow: 'shadow-green-500/20' },
    { id: 'jeunesse', name: 'La Jeunesse', image: '/axes/jeunesse.png', color: 'from-teal-400 to-teal-600', shadow: 'shadow-teal-500/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto my-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-display font-black text-gray-900 dark:text-white mb-4">
          Nos Axes Mondiaux
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Les Lions se concentrent sur ces causes mondiales pour répondre aux défis humanitaires majeurs d'aujourd'hui.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-4">
        {axes.map((axe) => (
          <div key={axe.id} className="group relative flex flex-col items-center">
            {/* Image Container with Glow Effect */}
            <div className={`relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-xl ${axe.shadow} mb-6 transition-transform duration-500 group-hover:-translate-y-4`}>
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${axe.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Outer Ring Animation */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700 scale-100 group-hover:scale-110 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
              
              <img 
                src={axe.image} 
                alt={axe.name} 
                className="w-3/4 h-3/4 object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Label */}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center tracking-tight transition-colors group-hover:text-lions-600 dark:group-hover:text-lions-400">
              {axe.name}
            </h3>
            
            {/* Decorative Line */}
            <div className={`w-8 h-1 mt-3 rounded-full bg-gradient-to-r ${axe.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
