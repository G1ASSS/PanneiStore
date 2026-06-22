'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AccountListingForm, AccountFormValues } from '@/components/admin/AccountListingForm';
import { adminFetch } from '@/lib/adminApi';
import { hasDevAdminSession, isDevAdminEnabled } from '@/lib/devAdmin';
import { createLocalListing, filesToImages } from '@/lib/localListings';

export default function AdminNewAccountPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';
  const useLocal = isDevAdminEnabled() && hasDevAdminSession() && !token;

  const handleSubmit = async (values: AccountFormValues, images: File[]) => {
    if (useLocal) {
      const imageData = await filesToImages(images);
      createLocalListing({
        listingCode: values.listingCode.trim(),
        title: values.title.trim(),
        titleMyanmar: values.titleMyanmar || undefined,
        description: values.description || undefined,
        price: Number(values.price),
        rank: values.rank,
        server: values.server.trim(),
        heroCount: Number(values.heroCount),
        skinCount: Number(values.skinCount),
        emblemCount: Number(values.emblemCount),
        winRate: Number(values.winRate),
        totalMatches: Number(values.totalMatches),
        level: Number(values.level),
        status: 'AVAILABLE',
        isFeatured: values.isFeatured,
        images: imageData,
      });
      router.push('/admin/accounts');
      return;
    }

    const form = new FormData();
    form.append('listingCode', values.listingCode.trim());
    form.append('title', values.title.trim());
    form.append('price', values.price);
    form.append('rank', values.rank);
    form.append('server', values.server.trim());
    form.append('heroCount', values.heroCount);
    form.append('skinCount', values.skinCount);
    form.append('emblemCount', values.emblemCount);
    form.append('winRate', values.winRate);
    form.append('totalMatches', values.totalMatches);
    form.append('level', values.level);
    if (values.titleMyanmar) form.append('titleMyanmar', values.titleMyanmar);
    if (values.description) form.append('description', values.description);
    if (values.isFeatured) form.append('isFeatured', 'true');
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
            {useLocal && ' (stored locally — no database)'}
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
