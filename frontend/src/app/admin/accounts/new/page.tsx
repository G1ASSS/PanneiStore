'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AccountListingForm, AccountFormValues } from '@/components/admin/AccountListingForm';
import { adminFetch } from '@/lib/adminApi';

export default function AdminNewAccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';

  const handleSubmit = async (values: AccountFormValues, images: File[]) => {
    const form = new FormData();
    form.append('listingCode', values.listingCode.trim());
    form.append('title', values.title.trim());
    form.append('price', values.price);
    form.append('rank', values.rank);
    form.append('server', values.server.trim());
    form.append('skinCount', values.skinCount);
    if (values.titleMyanmar) form.append('titleMyanmar', values.titleMyanmar);
    if (values.description) form.append('description', values.description);
    if (values.isFeatured) form.append('isFeatured', 'true');
    if (values.skins && values.skins.length > 0) form.append('skins', JSON.stringify(values.skins));
    images.forEach((file) => form.append('images', file));

    await adminFetch('/admin/accounts', { token, method: 'POST', body: form });
    router.push('/admin/accounts');
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>New Listing</h2>
          <p>
            Create a listing with a custom Listing ID for Telegram inquiries
          </p>
        </div>
        <Link href="/admin/accounts" className="btn-secondary">
          Back to Listings
        </Link>
      </div>

      <AccountListingForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/accounts')}
      />
    </>
  );
}
