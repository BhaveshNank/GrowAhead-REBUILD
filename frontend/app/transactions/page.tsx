'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { getTransactions, uploadCSV } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function TransactionsPage() {
  const { isAuthenticated, hydrated } = useAuthStore();
  const { transactions, setTransactions } = useAppStore();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  

  useEffect(() => {
  if (!hydrated) return;
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }

    async function fetchTransactions() {
      const data = await getTransactions();
      if (data.transactions) setTransactions(data.transactions);
    }

    fetchTransactions();
  }, [isAuthenticated, hydrated]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const data = await uploadCSV(file);

    if (data.message) {
      setMessage(data.message);
      const updated = await getTransactions();
      if (updated.transactions) setTransactions(updated.transactions);
    }

    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar active="transactions" />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-muted-foreground">All your imported bank transactions</p>
          </div>

          {/* CSV Upload */}
          <label className="cursor-pointer py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90">
            {uploading ? 'Uploading...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}

        {/* Transactions Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Merchant</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No transactions yet. Upload a CSV to get started.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{tx.merchant_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tx.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">£{parseFloat(tx.amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}