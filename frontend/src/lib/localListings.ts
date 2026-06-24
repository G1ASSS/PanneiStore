import { AccountDetail } from '@/types/account';

export interface LocalListing extends AccountDetail {
  listingCode: string;
  createdAt: string;
}

const STORAGE_KEY = 'panneistore-local-listings';

function readAll(): LocalListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalListing[]) : [];
  } catch {
    return [];
  }
}

function writeAll(listings: LocalListing[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

export function getLocalListings(): LocalListing[] {
  return readAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalListingById(idOrCode: string): LocalListing | null {
  return (
    readAll().find(
      (l) => l.id === idOrCode || l.listingCode === idOrCode
    ) ?? null
  );
}

export async function filesToImages(files: File[]): Promise<LocalListing['images']> {
  const images: LocalListing['images'] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    images.push({ url, isPrimary: i === 0, order: i });
  }
  return images;
}

export function createLocalListing(
  data: Omit<LocalListing, 'id' | 'createdAt' | 'seller' | 'heroes' | 'reviews'> & {
    images: LocalListing['images'];
  }
): LocalListing {
  const listings = readAll();
  const code = data.listingCode.trim().toUpperCase();
  if (listings.some((l) => l.listingCode === code)) {
    throw new Error('Listing ID is already in use');
  }

  const listing: LocalListing = {
    ...data,
    id: `local-${code}`,
    listingCode: code,
    heroes: [],
    skins: data.skins || [],
    reviews: [],
    seller: {
      id: 'panneistore',
      shopName: 'PanneiStore',
      rating: 5,
      reviewCount: 0,
      totalSales: 0,
      isApproved: true,
    },
    createdAt: new Date().toISOString(),
  };

  listings.push(listing);
  writeAll(listings);
  return listing;
}

export function updateLocalListing(
  id: string,
  patch: Partial<LocalListing> & { images?: LocalListing['images'] }
): LocalListing {
  const listings = readAll();
  const index = listings.findIndex((l) => l.id === id);
  if (index === -1) throw new Error('Listing not found');

  if (patch.listingCode) {
    const code = patch.listingCode.trim().toUpperCase();
    if (listings.some((l) => l.listingCode === code && l.id !== id)) {
      throw new Error('Listing ID is already in use');
    }
    patch.listingCode = code;
  }

  listings[index] = {
    ...listings[index],
    ...patch,
    images: patch.images?.length ? patch.images : listings[index].images,
  };
  writeAll(listings);
  return listings[index];
}

export function deleteLocalListing(id: string): void {
  writeAll(readAll().filter((l) => l.id !== id));
}

export function localListingToCard(listing: LocalListing) {
  return {
    id: listing.listingCode || listing.id,
    title: listing.title,
    titleMyanmar: listing.titleMyanmar,
    price: Number(listing.price),
    rank: listing.rank,
    heroCount: listing.heroCount,
    skinCount: listing.skinCount,
    winRate: listing.winRate,
    server: listing.server,
    isFeatured: listing.isFeatured,
    images: listing.images.map(({ url, isPrimary }) => ({ url, isPrimary })),
    seller: {
      shopName: listing.seller.shopName,
      rating: listing.seller.rating,
      isApproved: listing.seller.isApproved,
    },
  };
}
