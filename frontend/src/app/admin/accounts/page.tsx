'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { adminFetch, AdminAccount } from '@/lib/adminApi';
import { ToastNotification } from '@/components/admin/ToastNotification';
import { useToast } from '@/hooks/useToast';
import {
  deleteLocalListing,
  getLocalListings,
  localListingToCard,
  LocalListing,
} from '@/lib/localListings';
import { isDevAdminEnabled, hasDevAdminSession } from '@/lib/devAdmin';

export default function AdminAccountsPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const useLocal = false; // always use real DB
  const { toast, success, error: toastError } = useToast();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [localAccounts, setLocalAccounts] = useState<LocalListing[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLocal = useCallback(() => {
    let items = getLocalListings();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.listingCode.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q)
      );
    }
    if (status !== 'ALL') {
      items = items.filter((a) => a.status === status);
    }
    setLocalAccounts(items);
    setLoading(false);
  }, [search, status]);

  const load = useCallback(async () => {
    if (useLocal) {
      loadLocal();
      return;
    }
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status,
        limit: '50',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (search.trim()) params.set('search', search.trim());
      const res = await adminFetch<{ accounts: AdminAccount[] }>(
        `/accounts?${params}`,
        { token }
      );
      setAccounts(res.data.accounts);
    } catch (err) {
      if (isDevAdminEnabled() && hasDevAdminSession()) {
        loadLocal();
        setError('');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      }
    } finally {
      setLoading(false);
    }
  }, [token, search, status, useLocal, loadLocal]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteAccount = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    try {
      if (useLocal || id.startsWith('local-')) {
        deleteLocalListing(id);
        loadLocal();
        return;
      }
      await adminFetch(`/accounts/${id}`, { token, method: 'DELETE' });
      load();
      success('Listing deleted successfully.');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const rows = useLocal
    ? localAccounts
    : accounts;

  return (
    <>
      <ToastNotification toast={toast} />
      <div className="admin-page-header">
        <div>
          <h2>Listings</h2>
          <p>
            Manage MLBB account listings and Listing IDs
            {useLocal && ' (saved locally in your browser)'}
          </p>
        </div>
        <Link href="/admin/accounts/new" className="btn-primary">
          + New Listing
        </Link>
      </div>

      <div className="admin-search-row">
        <input
          type="search"
          placeholder="Search by Listing ID, title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="SOLD">Sold</option>
          <option value="PENDING">Pending</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <button type="button" className="btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">Loading listings…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No listings found</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Listing ID</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {useLocal
                  ? localAccounts.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.listingCode}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {account.images?.[0]?.url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={account.images[0].url} alt="" className="admin-thumb" />
                            )}
                            <span>{account.title}</span>
                          </div>
                        </td>
                        <td>MMK {Number(account.price).toLocaleString()}</td>
                        <td>{account.rank}</td>
                        <td>
                          <span className={`admin-badge ${account.status.toLowerCase()}`}>
                            {account.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <Link href={`/market/${account.listingCode}`} className="btn-sm" target="_blank">
                              View
                            </Link>
                            <Link href={`/admin/accounts/${account.id}/edit`} className="btn-sm">
                              Edit
                            </Link>
                            <button type="button" className="btn-sm btn-danger" onClick={() => deleteAccount(account.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : accounts.map((account) => (
                      <tr key={account.id}>
                        <td><strong>{account.listingCode || '—'}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {account.images?.[0]?.url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={account.images[0].url} alt="" className="admin-thumb" />
                            )}
                            <span>{account.title}</span>
                          </div>
                        </td>
                        <td>MMK {Number(account.price).toLocaleString()}</td>
                        <td>{account.rank}</td>
                        <td>
                          <span className={`admin-badge ${account.status.toLowerCase()}`}>
                            {account.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <Link href={`/market/${account.listingCode || account.id}`} className="btn-sm" target="_blank">
                              View
                            </Link>
                            <Link href={`/admin/accounts/${account.id}/edit`} className="btn-sm">
                              Edit
                            </Link>
                            <button type="button" className="btn-sm btn-danger" onClick={() => deleteAccount(account.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
