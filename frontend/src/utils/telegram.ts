export const OWNER_TELEGRAM_USERNAME = 'panneisan2002';

export function buildOwnerTelegramUrl(message?: string): string {
  const base = `https://t.me/${OWNER_TELEGRAM_USERNAME}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function openOwnerTelegramChat(message?: string): void {
  window.open(buildOwnerTelegramUrl(message), '_blank', 'noopener,noreferrer');
}

export function buildAccountInquiryMessage(account: {
  id: string;
  listingCode?: string | null;
  title: string;
  price: number | string;
}): string {
  const price = Number(account.price).toLocaleString();
  const listingId = account.listingCode?.trim() || account.id;
  return [
    'Hi, I want to buy this MLBB account from PanneiStore:',
    '',
    account.title,
    `Listing ID: ${listingId}`,
    `Price: ${price} MMK`,
    '',
    'Please let me know if it is still available. Thank you!',
  ].join('\n');
}
