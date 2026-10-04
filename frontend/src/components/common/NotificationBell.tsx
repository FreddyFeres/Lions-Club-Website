import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'booking': return '🎟️';
      case 'meeting': return '🤝';
      case 'service_hours': return '⏱️';
      case 'finance': return '💰';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-lions-600 focus:outline-none focus:ring-2 focus:ring-lions-500 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse-slow"></span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden flex flex-col max-h-[80vh] dark:bg-gray-800 dark:ring-gray-700 animate-fade-in">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllAsRead()} className="text-xs text-lions-600 hover:text-lions-700 dark:text-lions-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 transition-colors ${notif.isRead ? 'opacity-70 bg-white dark:bg-gray-800' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1 text-lg leading-none">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {notif.link ? (
                          <Link to={notif.link} onClick={() => { markAsRead(notif.id); setIsOpen(false); }} className="block">
                            <p className={`text-sm font-medium text-gray-900 dark:text-white ${!notif.isRead && 'font-semibold'}`}>{notif.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">{notif.message}</p>
                          </Link>
                        ) : (
                          <div onClick={() => !notif.isRead && markAsRead(notif.id)} className="cursor-pointer">
                            <p className={`text-sm font-medium text-gray-900 dark:text-white ${!notif.isRead && 'font-semibold'}`}>{notif.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">{notif.message}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{dayjs(notif.createdAt).fromNow()}</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!notif.isRead && (
                          <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="text-lions-600 hover:text-lions-800 p-1 rounded-md hover:bg-lions-100" title="Marquer comme lu">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
