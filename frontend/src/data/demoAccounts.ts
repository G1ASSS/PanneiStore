import { AccountData } from "@/components/ui/AccountCard";
import { AccountDetail } from "@/types/account";

const IMG = {
  gaming1:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
  gaming2:
    "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=800",
  gaming3:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
  gaming4:
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=800",
};

export const DEMO_ACCOUNT_IDS = new Set(["acc-1", "acc-2", "acc-3"]);

const demoAccountDetails: AccountDetail[] = [
  {
    id: "acc-1",
    title: "MLBB Mythical Glory | 120 Skins | Gusion KOF, Chou Iori",
    titleMyanmar:
      "ဂလိုရီအကောင့် | စကင် ၁၂၀ ပါ | KOF Gusion, Iori Chou ပါဝင်သည်",
    description:
      "Premium Mythical Glory account with 120 skins including rare KOF Gusion and Iori Chou skins. All emblem pages maxed, strong hero pool for ranked and classic modes. Clean bind, ready for immediate transfer via PanneiStore escrow.",
    descMyanmar:
      "KOF Gusion နှင့် Iori Chou စကင်များ ပါဝင်သော Mythical Glory အကောင့်။ Emblem အကုန်ပြည့်စုံပြီး ranked ကစားရန် အဆင်သင့်။",
    price: 320000,
    rank: "Renowned Collector",
    heroCount: 98,
    skinCount: 120,
    emblemCount: 64,
    winRate: 64.8,
    totalMatches: 4280,
    level: 87,
    server: "Myanmar (8872)",
    status: "AVAILABLE",
    isFeatured: true,
    images: [
      { url: IMG.gaming1, isPrimary: true, order: 0 },
      { url: IMG.gaming4, isPrimary: false, order: 1 },
      { url: IMG.gaming2, isPrimary: false, order: 2 },
    ],
    heroes: [
      { heroName: "Gusion", specialty: "Assassin" },
      { heroName: "Chou", specialty: "Fighter" },
      { heroName: "Ling", specialty: "Assassin" },
      { heroName: "Fanny", specialty: "Assassin" },
      { heroName: "Granger", specialty: "Marksman" },
      { heroName: "Wanwan", specialty: "Marksman" },
      { heroName: "Khaleed", specialty: "Fighter" },
      { heroName: "Paquito", specialty: "Fighter" },
    ],
    skins: [
      { skinName: "KOF Gusion", heroName: "Gusion", isLegend: true },
      { skinName: "Iori Yagami Chou", heroName: "Chou", isLegend: true },
      { skinName: "Collector Granger", heroName: "Granger", isLegend: true },
      { skinName: "Lightborn Fanny", heroName: "Fanny", isLegend: true },
      { skinName: "Skylark Ling", heroName: "Ling", isLegend: false },
      { skinName: "M-World Wanwan", heroName: "Wanwan", isLegend: true },
    ],
    seller: {
      id: "seller-kof",
      shopName: "KOF_Store_MM",
      rating: 4.9,
      reviewCount: 128,
      totalSales: 540,
      isApproved: true,
    },
    reviews: [
      {
        id: "rev-1a",
        rating: 5,
        comment: "Fast delivery, account exactly as described. Gusion KOF skin confirmed!",
        buyer: { name: "MinKo" },
        createdAt: "2026-04-12T10:30:00Z",
      },
      {
        id: "rev-1b",
        rating: 5,
        comment: "Trusted seller. Escrow process was smooth.",
        buyer: { name: "Thura" },
        createdAt: "2026-03-28T14:15:00Z",
      },
    ],
  },
  {
    id: "acc-2",
    title: "Fanny Fast Hand Dream | 85 Skins | Skylark & Lightborn",
    titleMyanmar:
      "ဖန်နီဝါသနာရှင်များအတွက် | စကင် ၈၅ ခု | Skylark နှင့် Lightborn ပါ",
    description:
      "Built for Fanny mains — Skylark and Lightborn included with a solid 85-skin collection. Mythic-active rank with clean cable stats and stable ping on Global server. Ideal for players who want a ready-to-climb jungle account.",
    descMyanmar:
      "ဖန်နီအဓိကကစားသူများအတွက် Skylark နှင့် Lightborn ပါဝင်သော အကောင့်။ Global server တွင် Mythic active rank ရှိပြီး ချက်ချင်းလွှဲပြောင်းနိုင်သည်။",
    price: 180000,
    rank: "Seasoned Collector",
    heroCount: 80,
    skinCount: 85,
    emblemCount: 48,
    winRate: 59.2,
    totalMatches: 3120,
    level: 72,
    server: "Global (3021)",
    status: "AVAILABLE",
    isFeatured: false,
    images: [
      { url: IMG.gaming2, isPrimary: true, order: 0 },
      { url: IMG.gaming1, isPrimary: false, order: 1 },
    ],
    heroes: [
      { heroName: "Fanny", specialty: "Assassin" },
      { heroName: "Hayabusa", specialty: "Assassin" },
      { heroName: "Lancelot", specialty: "Assassin" },
      { heroName: "Selena", specialty: "Assassin" },
      { heroName: "Natalia", specialty: "Assassin" },
      { heroName: "Karina", specialty: "Assassin" },
    ],
    skins: [
      { skinName: "Skylark Fanny", heroName: "Fanny", isLegend: true },
      { skinName: "Lightborn Fanny", heroName: "Fanny", isLegend: true },
      { skinName: "Shadow of Obscurity Hayabusa", heroName: "Hayabusa", isLegend: false },
      { skinName: "Apocalypse Agent Selena", heroName: "Selena", isLegend: false },
    ],
    seller: {
      id: "seller-fanny",
      shopName: "FannyGod_Resell",
      rating: 4.7,
      reviewCount: 86,
      totalSales: 312,
      isApproved: true,
    },
    reviews: [
      {
        id: "rev-2a",
        rating: 5,
        comment: "Perfect Fanny account. Both premium skins included.",
        buyer: { name: "AungLay" },
        createdAt: "2026-04-05T09:00:00Z",
      },
    ],
  },
  {
    id: "acc-3",
    title: "All Heroes Unlocked | 240 Skins | Collector Granger & Wanwan",
    titleMyanmar:
      "ဟီးရိုးအကုန်ပါ | စကင် ၂၄၀ | Granger Collector, Wanwan Collector ပါ",
    description:
      "Whale-tier collector account with every hero unlocked and 240 skins including Collector Granger and Wanwan. Mythical Immortal peak rank history, high win rate, and full emblem sets. Best choice for collectors who want a complete inventory.",
    descMyanmar:
      "ဟီးရိုးအကုန်နှင့် စကင် ၂၄၀ ပါဝင်သော collector အကောင့်။ Granger Collector နှင့် Wanwan Collector ပါဝင်ပြီး Mythical Immortal ရောက်ဖူးသော high-tier account ဖြစ်သည်။",
    price: 950000,
    rank: "Universe/Galaxy Collector",
    heroCount: 125,
    skinCount: 240,
    emblemCount: 64,
    winRate: 72.1,
    totalMatches: 6890,
    level: 99,
    server: "Myanmar (9912)",
    status: "AVAILABLE",
    isFeatured: true,
    images: [
      { url: IMG.gaming3, isPrimary: true, order: 0 },
      { url: IMG.gaming4, isPrimary: false, order: 1 },
      { url: IMG.gaming1, isPrimary: false, order: 2 },
      { url: IMG.gaming2, isPrimary: false, order: 3 },
    ],
    heroes: [
      { heroName: "Granger", specialty: "Marksman" },
      { heroName: "Wanwan", specialty: "Marksman" },
      { heroName: "Gusion", specialty: "Assassin" },
      { heroName: "Lunox", specialty: "Mage" },
      { heroName: "Harley", specialty: "Assassin" },
      { heroName: "Kagura", specialty: "Mage" },
    ],
    skins: [
      { skinName: "Collector Granger", heroName: "Granger", isLegend: true },
      { skinName: "Collector Wanwan", heroName: "Wanwan", isLegend: true },
      { skinName: "KOF Gusion", heroName: "Gusion", isLegend: true },
      { skinName: "Sanrio Harley", heroName: "Harley", isLegend: true },
      { skinName: "Exorcist Kagura", heroName: "Kagura", isLegend: true },
      { skinName: "Cosmic Goddess Lunox", heroName: "Lunox", isLegend: true },
    ],
    seller: {
      id: "seller-pannei",
      shopName: "Pannei_Official",
      rating: 5.0,
      reviewCount: 412,
      totalSales: 1280,
      isApproved: true,
    },
    reviews: [
      {
        id: "rev-3a",
        rating: 5,
        comment: "Insane collection. Every collector skin I wanted was there.",
        buyer: { name: "ZawWin" },
        createdAt: "2026-05-01T16:45:00Z",
      },
      {
        id: "rev-3b",
        rating: 5,
        comment: "Official store delivery was instant. Highly recommend.",
        buyer: { name: "Nyein" },
        createdAt: "2026-04-20T11:20:00Z",
      },
      {
        id: "rev-3c",
        rating: 5,
        comment: "Worth every kyat for a complete whale account.",
        buyer: { name: "Hein" },
        createdAt: "2026-04-08T08:10:00Z",
      },
    ],
  },
];

export const DEMO_POPULAR_ACCOUNTS: AccountData[] = demoAccountDetails.map(
  ({
    id,
    title,
    titleMyanmar,
    price,
    rank,
    heroCount,
    skinCount,
    winRate,
    server,
    images,
    seller,
  }) => ({
    id,
    title,
    titleMyanmar,
    price,
    rank,
    heroCount,
    skinCount,
    winRate,
    server,
    images: images.map(({ url, isPrimary }) => ({ url, isPrimary })),
    seller: { shopName: seller.shopName, rating: seller.rating },
  })
);

export function getDemoAccountById(id: string): AccountDetail | null {
  return demoAccountDetails.find((account) => account.id === id) ?? null;
}
