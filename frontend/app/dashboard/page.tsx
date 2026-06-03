'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { getGrowth, getRoundups, getTransactions } from '@/lib/api';
import GrowthChart from '@/components/GrowthChart';
import Navbar from '@/components/Navbar';



export default function DashboardPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const { transactions, roundups, growth, setTransactions, setRoundups, setGrowth } = useAppStore();
    const router = useRouter();

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            const [txData, ruData, growthData] = await Promise.all([
                getTransactions(),
                getRoundups(),
                getGrowth(),
            ]);

            if (txData.transactions) setTransactions(txData.transactions);
            if (ruData.roundups) setRoundups(ruData.roundups);
            if (growthData.data) setGrowth(growthData);
        }

        fetchData();
    }, [isAuthenticated, hydrated]);


    const totalInvested = growth?.data?.balanced?.total_invested ?? 0;
    const currentValue = growth?.data?.balanced?.current_value ?? 0;
    const projections = growth?.data?.balanced?.projections;

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <Navbar active="dashboard" />

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <p className="text-muted-foreground">Your spare change portfolio overview</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                        <p className="text-3xl font-bold mt-1">{transactions.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Total Roundups</p>
                        <p className="text-3xl font-bold mt-1">{roundups.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <p className="text-sm text-muted-foreground">Total Invested</p>
                        <p className="text-3xl font-bold mt-1">£{totalInvested.toFixed(2)}</p>
                    </div>
                </div>

                {/* Growth Projections */}
                {projections && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="text-lg font-semibold mb-1">Growth Projections</h3>
                        <p className="text-sm text-muted-foreground mb-4">Based on balanced profile (8% annual return)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.entries(projections).map(([key, value]) => (
                                <div key={key} className="text-center">
                                    <p className="text-sm text-muted-foreground">{key}</p>
                                    <p className="text-xl font-bold mt-1">£{(value as number).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {growth?.data && (
                    <GrowthChart projections={{
                        conservative: growth.data.conservative.projections,
                        balanced: growth.data.balanced.projections,
                        aggressive: growth.data.aggressive.projections,
                    }} />
                )}

                {/* Recent Transactions */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                    {transactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No transactions yet. Upload a CSV to get started.</p>
                    ) : (
                        <div className="space-y-2">
                            {transactions.slice(0, 5).map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{tx.merchant_name}</p>
                                        <p className="text-xs text-muted-foreground">{tx.category} · {new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm font-medium">£{parseFloat(tx.amount).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}