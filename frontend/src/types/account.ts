export interface AccountDetail {
  id: string;
  listingCode?: string | null;
  title: string;
  titleMyanmar?: string;
  description?: string;
  descMyanmar?: string;
  price: number;
  rank: string;
  heroCount: number;
  skinCount: number;
  emblemCount: number;
  winRate: number;
  totalMatches: number;
  level: number;
  server: string;
  status: string;
  isFeatured: boolean;
  images: { url: string; isPrimary: boolean; order: number }[];
  heroes: { heroName: string; specialty: string }[];
  skins: { skinName: string; heroName: string; isLegend: boolean }[];
  seller: {
    id: string;
    shopName: string;
    rating: number;
    reviewCount: number;
    totalSales: number;
    isApproved: boolean;
    avatar?: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment?: string;
    buyer: { name: string; avatar?: string };
    createdAt: string;
  }[];
}
