'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminFetch } from '@/lib/adminApi';

interface UserRow {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      const res = await adminFetch<{ users: UserRow[] }>(`/admin/users?${params}`, { token });
      setUsers(res.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const toggleStatus = async (user: UserRow) => {
    try {
      await adminFetch(`/admin/users/${user.id}/status`, {
        token,
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Users</h2>
          <p>Manage registered users</p>
        </div>
      </div>

      <div className="admin-search-row">
        <input
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button type="button" className="btn-secondary" onClick={load}>
          Search
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={`admin-badge ${user.isActive ? 'available' : 'sold'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-sm"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
