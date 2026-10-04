import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, FileText, Heart, ShieldAlert, LogOut, File, Clock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
    { name: 'Événements', href: '/admin/events', icon: Calendar },
    { name: 'Réunions', href: '/admin/meetings', icon: Users },
    { name: 'Membres & Utilisateurs', href: '/admin/members', icon: ShieldAlert },
    { name: 'Finances & Dons', href: '/admin/finances', icon: Heart },
    { name: 'Heures de service', href: '/admin/service-hours', icon: Clock },
    { name: 'Candidatures', href: '/admin/applications', icon: UserPlus },
    { name: 'Documents', href: '/admin/documents', icon: File },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 shadow-sm">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/LOGO OFFICIELLE.jpg" alt="Lions Club Tunis Golfe" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gray-900 dark:text-white leading-tight">
                Admin Panel
              </span>
            </Link>
          </div>
          
          <div className="px-4 mb-6">
            <div className="flex items-center p-3 bg-lions-50 dark:bg-gray-700/50 rounded-xl">
              {user?.avatar ? (
                <img src={`/${user.avatar}`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-lions-200 text-lions-800 flex items-center justify-center font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.firstName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-lions-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 w-full px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
