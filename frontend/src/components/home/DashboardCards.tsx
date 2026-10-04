import React from 'react';
import { Users, Calendar, Clock, BarChart2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardCards() {
  const cards = [
    {
      title: 'TOTAL PERSONNES SERVICES',
      value: '3,713',
      trend: '+43%',
      isPositive: true,
      previousValue: '2,591',
      previousYear: '2025',
      Icon: Users
    },
    {
      title: "NOMBRE D'ACTIVITÉS",
      value: '24',
      trend: '+20%',
      isPositive: true,
      previousValue: '20',
      previousYear: '2025',
      Icon: Calendar
    },
    {
      title: 'HEURES DE BÉNÉVOLAT',
      value: '3,033 h',
      trend: '-23%',
      isPositive: false,
      previousValue: '3,991 h',
      previousYear: '2025',
      Icon: Clock
    }
  ];

  return (
    <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 my-10 max-w-6xl mx-auto px-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-blue-100 dark:border-gray-700 flex-1 min-w-[300px] max-w-sm relative overflow-hidden">
          {/* Top border glow effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-50"></div>
          
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
            <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400">{card.title}</h3>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-full">
              <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="text-blue-700 dark:text-blue-500 mt-1">
              <card.Icon className="w-12 h-12 stroke-[1.5]" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{card.value}</span>
                <span className={`flex items-center text-sm font-bold ${card.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  {card.isPositive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                  {card.trend}
                </span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                {card.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1 text-green-600" /> : <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />}
                {card.previousValue} ({card.previousYear})
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
