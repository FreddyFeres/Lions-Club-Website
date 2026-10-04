import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeService } from '../../services/finance.service';
import { DollarSign, Download, Filter, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import dayjs from 'dayjs';
import TransactionFormModal from '../../components/admin/TransactionFormModal';

export default function FinanceLedger() {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['admin-finance-summary'],
    queryFn: financeService.getSummary,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', filter],
    queryFn: () => financeService.getTransactions({ type: filter || undefined }),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Livre de Comptes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les finances, dons et dépenses du club.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <DollarSign className="w-5 h-5 mr-2" /> Nouvelle Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center text-green-500 mb-2">
            <TrendingUp className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Revenus (Total)</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">{summary?.totalIncome || 0} TND</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center text-red-500 mb-2">
            <TrendingDown className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Dépenses (Total)</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">{summary?.totalExpense || 0} TND</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm bg-gradient-to-br from-lions-50 to-white dark:from-gray-800 dark:to-gray-900 border-lions-200">
          <div className="flex items-center text-lions-600 dark:text-lions-400 mb-2">
            <DollarSign className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">Solde Net</h3>
          </div>
          <p className="text-2xl font-bold text-lions-700 dark:text-lions-300">{(summary?.totalIncome || 0) - (summary?.totalExpense || 0)} TND</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field max-w-xs">
            <option value="">Toutes les transactions</option>
            <option value="income">Revenus (Dons, Cotisations)</option>
            <option value="expense">Dépenses</option>
          </select>
          <button className="text-gray-500 hover:text-lions-600 flex items-center text-sm font-medium">
            <Download className="w-4 h-4 mr-1" /> Exporter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reçu</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Chargement...</td></tr>
              ) : data?.data?.map((tx: any) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dayjs(tx.transactionDate).format('DD/MM/YYYY')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</div>
                    {tx.user && <div className="text-xs text-gray-500">{tx.user.firstName} {tx.user.lastName}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{tx.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                    <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount} TND
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {tx.receiptPath ? (
                      <a href={`/${tx.receiptPath}`} target="_blank" rel="noreferrer" className="text-lions-600 hover:text-lions-800 mx-auto block w-max">
                        <FileText className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
