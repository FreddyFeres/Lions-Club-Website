import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboard.service';
import { Users, Calendar, Heart, Clock, TrendingUp, Bell } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: dashboardService.getStats,
  });

  const { data: charts, isLoading: loadingCharts } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: dashboardService.getCharts,
  });

  if (loadingStats || loadingCharts) return <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-lions-500 border-t-transparent rounded-full"></div></div>;

  const serviceHoursData = {
    labels: charts?.monthlyServiceHours?.map((d: any) => d.month) || [],
    datasets: [{
      label: 'Heures de service',
      data: charts?.monthlyServiceHours?.map((d: any) => d.hours) || [],
      borderColor: '#0c88e8',
      backgroundColor: 'rgba(12, 136, 232, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const financialData = {
    labels: charts?.monthlyFinancials?.map((d: any) => d.month) || [],
    datasets: [
      {
        label: 'Revenus',
        data: charts?.monthlyFinancials?.map((d: any) => d.income) || [],
        backgroundColor: '#10b981',
      },
      {
        label: 'Dépenses',
        data: charts?.monthlyFinancials?.map((d: any) => d.expense) || [],
        backgroundColor: '#ef4444',
      }
    ]
  };

  const roleData = {
    labels: charts?.roleBreakdown?.map((d: any) => d.role.replace('_', ' ').toUpperCase()) || [],
    datasets: [{
      data: charts?.roleBreakdown?.map((d: any) => d.count) || [],
      backgroundColor: ['#0c88e8', '#f59e0b', '#10b981', '#6b7280'],
    }]
  };

  const statCards = [
    { title: 'Utilisateurs Actifs', value: `${stats?.activeMembersCount || 0} / ${stats?.totalMembers || 0}`, icon: Users, color: 'bg-blue-500' },
    { title: 'Événements à venir', value: stats?.upcomingEvents || 0, icon: Calendar, color: 'bg-indigo-500' },
    { title: 'Revenus Annuels', value: `${stats?.financials?.income || 0} TND`, icon: Heart, color: 'bg-rose-500' },
    { title: 'Croissance Membres', value: `${stats?.memberGrowth > 0 ? '+' : ''}${stats?.memberGrowth || 0}%`, icon: TrendingUp, color: 'bg-emerald-500' },
    { title: 'Candidatures (Attente)', value: stats?.pendingApplications || 0, icon: Bell, color: 'bg-amber-500' },
    { title: 'Heures (Attente)', value: stats?.pendingServiceHours || 0, icon: Clock, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
        <p className="text-gray-600 dark:text-gray-400">Aperçu général des activités du club.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
              <div className={`${stat.color} p-4 rounded-xl text-white mr-4 shadow-sm`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Heures de Service (6 mois)</h3>
          <div className="h-64">
            <Line data={serviceHoursData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Aperçu Financier</h3>
          <div className="h-64">
            <Bar data={financialData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Distribution des Rôles</h3>
          <div className="h-64 flex justify-center">
            <Doughnut data={roleData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Événements les plus populaires</h3>
          <div className="space-y-4">
            {charts?.topEvents?.map((event: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-4">{event.title}</span>
                  <span className="text-gray-500 font-bold">{event.bookings} Réservations</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full bg-lions-500`} style={{ width: `${Math.min(100, (event.bookings / 50) * 100)}%` }}></div>
                </div>
              </div>
            ))}
            {!charts?.topEvents?.length && <p className="text-gray-500 text-sm">Données insuffisantes.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
