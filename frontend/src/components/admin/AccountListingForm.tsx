'use client';

import { useState } from 'react';
import { COLLECTOR_TIERS } from '@/data/collectorTiers';

export interface AccountFormValues {
  listingCode: string;
  title: string;
  titleMyanmar: string;
  description: string;
  price: string;
  rank: string;
  server: string;
  heroCount: string;
  skinCount: string;
  emblemCount: string;
  winRate: string;
  totalMatches: string;
  level: string;
  status: string;
  isFeatured: boolean;
}

const DEFAULT_VALUES: AccountFormValues = {
  listingCode: '',
  title: '',
  titleMyanmar: '',
  description: '',
  price: '',
  rank: COLLECTOR_TIERS[4],
  server: 'Myanmar (8872)',
  heroCount: '0',
  skinCount: '0',
  emblemCount: '0',
  winRate: '0',
  totalMatches: '0',
  level: '0',
  status: 'AVAILABLE',
  isFeatured: false,
};

const STATUS_OPTIONS = ['AVAILABLE', 'SOLD', 'PENDING', 'HIDDEN', 'REJECTED'];

interface AccountListingFormProps {
  initial?: Partial<AccountFormValues>;
  mode: 'create' | 'edit';
  requireImages?: boolean;
  onSubmit: (values: AccountFormValues, images: File[]) => Promise<void>;
  onCancel: () => void;
}

export function AccountListingForm({
  initial,
  mode,
  requireImages = mode === 'create',
  onSubmit,
  onCancel,
}: AccountListingFormProps) {
  const [values, setValues] = useState<AccountFormValues>({
    ...DEFAULT_VALUES,
    ...initial,
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof AccountFormValues, val: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!values.listingCode.trim()) {
      setError('Listing ID is required (e.g. PS-001)');
      return;
    }
    if (!values.title.trim()) {
      setError('Title is required');
      return;
    }
    if (requireImages && images.length === 0) {
      setError('At least one image is required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(values, images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label htmlFor="listingCode">Listing ID *</label>
          <input
            id="listingCode"
            value={values.listingCode}
            onChange={(e) => set('listingCode', e.target.value.toUpperCase())}
            placeholder="PS-001"
            required
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="price">Price (MMK) *</label>
          <input
            id="price"
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => set('price', e.target.value)}
            required
          />
        </div>

        <div className="admin-form-group full-width">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="MLBB Mythical Glory | 120 Skins"
            required
          />
        </div>

        <div className="admin-form-group full-width">
          <label htmlFor="titleMyanmar">Title (Myanmar)</label>
          <input
            id="titleMyanmar"
            value={values.titleMyanmar}
            onChange={(e) => set('titleMyanmar', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="rank">Collector Tier *</label>
          <select id="rank" value={values.rank} onChange={(e) => set('rank', e.target.value)}>
            {COLLECTOR_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-form-group">
          <label htmlFor="server">Server *</label>
          <input
            id="server"
            value={values.server}
            onChange={(e) => set('server', e.target.value)}
            required
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="heroCount">Hero Count</label>
          <input
            id="heroCount"
            type="number"
            min="0"
            value={values.heroCount}
            onChange={(e) => set('heroCount', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="skinCount">Skin Count</label>
          <input
            id="skinCount"
            type="number"
            min="0"
            value={values.skinCount}
            onChange={(e) => set('skinCount', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="emblemCount">Emblem Count</label>
          <input
            id="emblemCount"
            type="number"
            min="0"
            value={values.emblemCount}
            onChange={(e) => set('emblemCount', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="winRate">Win Rate (%)</label>
          <input
            id="winRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={values.winRate}
            onChange={(e) => set('winRate', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="totalMatches">Total Matches</label>
          <input
            id="totalMatches"
            type="number"
            min="0"
            value={values.totalMatches}
            onChange={(e) => set('totalMatches', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label htmlFor="level">Level</label>
          <input
            id="level"
            type="number"
            min="0"
            value={values.level}
            onChange={(e) => set('level', e.target.value)}
          />
        </div>

        {mode === 'edit' && (
          <>
            <div className="admin-form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={values.status} onChange={(e) => set('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input
                id="isFeatured"
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
              />
              <label htmlFor="isFeatured" style={{ margin: 0 }}>
                Featured listing
              </label>
            </div>
          </>
        )}

        <div className="admin-form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
          />
        </div>

        <div className="admin-form-group full-width">
          <label htmlFor="images">
            {mode === 'create' ? 'Images *' : 'Add new images (optional)'}
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          />
          {images.length > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {images.length} file(s) selected
            </p>
          )}
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Create Listing' : 'Save Changes'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
