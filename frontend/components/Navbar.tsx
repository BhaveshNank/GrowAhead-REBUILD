'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Props {
  active: 'dashboard' | 'transactions' | 'roundups';
}

export default function Navbar({ active }: Props) {
  const { logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
      <h1 className="text-lg font-bold">GrowAhead</h1>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={`text-sm ${active === 'dashboard' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Dashboard
        </Link>
        <Link
          href="/transactions"
          className={`text-sm ${active === 'transactions' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Transactions
        </Link>
        <Link
          href="/roundups"
          className={`text-sm ${active === 'roundups' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Roundups
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-destructive hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}