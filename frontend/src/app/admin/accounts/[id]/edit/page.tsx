'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AccountListingForm, AccountFormValues } from '@/components/admin/AccountListingForm';
import { adminFetch, AdminAccount } from '@/lib/adminApi';
import { hasDevAdminSession, isDevAdminEnabled } from '@/lib/devAdmin';


export default function AdminEditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = String(params.id);
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';

  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {

    if (!token) return;
    adminFetch<AdminAccount>(`/accounts/${accountId}`, { token })
      .then((res) => setAccount(res.data))
      .catch((err) => setError(err.message));
  }, [token, accountId]);

  const handleSubmit = async (values: AccountFormValues, images: File[]) => {


    const form = new FormData();
    form.append('listingCode', values.listingCode.trim());
    form.append('title', values.title.trim());
    form.append('price', values.price);
    form.append('rank', values.rank);
    form.append('server', values.server.trim());
    form.append('skinCount', values.skinCount);
    form.append('status', values.status);
    form.append('isFeatured', values.isFeatured ? 'true' : 'false');
    if (values.titleMyanmar) form.append('titleMyanmar', values.titleMyanmar);
    if (values.description) form.append('description', values.description);
    if (values.skins && values.skins.length > 0) form.append('skins', JSON.stringify(values.skins));
    images.forEach((file) => form.append('images', file));

    await adminFetch(`/accounts/${accountId}`, { token, method: 'PATCH', body: form });
    router.push('/admin/accounts');
  };

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  if (!account) {
    return <div className="admin-loading">Loading listing…</div>;
  }

  const initial: Partial<AccountFormValues> = {
    listingCode: account.listingCode ?? '',
    title: account.title,
    titleMyanmar: account.titleMyanmar ?? '',
    description: account.description ?? '',
    price: String(account.price),
    rank: account.rank,
    server: account.server,
    skinCount: String(account.skinCount),
    status: account.status,
    isFeatured: account.isFeatured,
    skins: account.skins?.map(s => ({
      heroName: s.heroName,
      skinName: s.skinName,
      isLegend: s.isLegend
    })) || [],
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Edit Listing</h2>
          <p>{account.listingCode || account.id}</p>
        </div>
        <Link href="/admin/accounts" className="btn-secondary">
          Back to Listings
        </Link>
      </div>

      <AccountListingForm
        mode="edit"
        initial={initial}
        requireImages={false}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/accounts')}
      />
    </>
  );
}
