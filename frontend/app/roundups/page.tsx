'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { getRoundups, calculateRoundups } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function RoundupsPage() {
  const { isAuthenticated, hydrated } = useAuthStore();
  const { roundups, setRoundups } = useAppStore();
  const router = useRouter();
  const [calculating, setCalculating] = useState(false);
  const [message, setMessage] = useState('');
  

  useEffect(() => {
  if (!hydrated) return;
  if (!isAuthenticated) {
    router.push('/login');
    return;
  }

    async function fetchRoundups() {
      const data = await getRoundups();
      if (data.roundups) setRoundups(data.roundups);
    }

    fetchRoundups();
  }, [isAuthenticated, hydrated]);

  async function handleCalculate() {
    setCalculating(true);
    setMessage('');

    const data = await calculateRoundups();

    if (data.message) {
      setMessage(data.message);
      const updated = await getRoundups();
      if (updated.roundups) setRoundups(updated.roundups);
    }

    setCalculating(false);
  }

  const totalRoundups = roundups.reduce((sum, ru) => {
    return sum + parseFloat(ru.roundup_amount);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar active="roundups" />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Roundups</h2>
            <p className="text-muted-foreground">Your spare change calculations</p>
          </div>

          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {calculating ? 'Calculating...' : 'Calculate Roundups'}
          </button>
        </div>

        {message && (
          <p className="text-sm text-green-600">{message}</p>
        )}

        {/* Summary Card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Spare Change</p>
          <p className="text-3xl font-bold mt-1">£{totalRoundups.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">{roundups.length} roundups calculated</p>
        </div>

        {/* Roundups Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Roundup ID</th>
                <th className="text-left px-4 py-3 font-medium">Transaction ID</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Roundup Amount</th>
              </tr>
            </thead>
            <tbody>
              {roundups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No roundups yet. Click Calculate Roundups to get started.
                  </td>
                </tr>
              ) : (
                roundups.map((ru) => (
                  <tr key={ru.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground">#{ru.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">#{ru.transaction_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(ru.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      £{parseFloat(ru.roundup_amount).toFixed(2)}
                    </td>
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