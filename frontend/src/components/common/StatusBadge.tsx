import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'attended':
      case 'approved':
      case 'completed':
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      
      case 'pending':
      case 'scheduled':
      case 'maybe':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      
      case 'cancelled':
      case 'failed':
      case 'rejected':
      case 'absent':
      case 'no':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      
      case 'excused':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getLabel = () => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'Confirmé';
      case 'attended': return 'A assisté';
      case 'approved': return 'Approuvé';
      case 'completed': return 'Complété';
      case 'present': return 'Présent';
      
      case 'pending': return 'En attente';
      case 'scheduled': return 'Planifié';
      
      case 'cancelled': return 'Annulé';
      case 'failed': return 'Échoué';
      case 'rejected': return 'Rejeté';
      case 'absent': return 'Absent';
      
      case 'excused': return 'Excusé';
      
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {getLabel()}
    </span>
  );
}
