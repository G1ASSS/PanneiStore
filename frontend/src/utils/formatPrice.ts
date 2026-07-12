export function formatPrice(price: number, language: string): string {
  if (language !== 'my') {
    return price.toLocaleString();
  }
  return formatMyanmarPrice(price);
}

const myanmarNumbers = ['သုည', 'တစ်', 'နှစ်', 'သုံး', 'လေး', 'ငါး', 'ခြောက်', 'ခုနစ်', 'ရှစ်', 'ကိုး'];

export function formatMyanmarPrice(amount: number): string {
  // If price is 100k or more, format as Thein (သိန်း)
  if (amount >= 100000) {
    const lakhs = Math.floor(amount / 100000);
    const remainder = amount % 100000;
    
    let text = '';
    
    if (lakhs === 10) {
      text = 'ဆယ်သိန်း';
    } else if (lakhs > 10) {
      text = 'သိန်း ' + convertToBurmeseDigits(lakhs);
    } else {
      text = myanmarNumbers[lakhs] + 'သိန်း';
    }
    
    if (remainder === 0) return text;
    if (remainder === 50000) return text + 'ခွဲ';
    
    // For clean 10k remainders (e.g., 20k = နှစ်သောင်း)
    if (remainder % 10000 === 0) {
       const thaung = remainder / 10000;
       return text + myanmarNumbers[thaung] + 'သောင်း';
    }
    
    // If it's a weird exact amount like 123,450 just show in Burmese digits
    return convertToBurmeseDigits(amount);
  }
  
  // For amounts < 100,000
  if (amount % 10000 === 0 && amount > 0) {
    const thaung = amount / 10000;
    return myanmarNumbers[thaung] + 'သောင်း';
  }
  if (amount % 1000 === 0 && amount > 0) {
    const thaung = Math.floor(amount / 10000);
    const htaung = (amount % 10000) / 1000;
    let res = '';
    if (thaung > 0) res += myanmarNumbers[thaung] + 'သောင်း';
    if (htaung > 0) res += myanmarNumbers[htaung] + 'ထောင်';
    return res;
  }
  
  return convertToBurmeseDigits(amount);
}

function convertToBurmeseDigits(num: number): string {
    const digits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toLocaleString().split('').map(char => {
      if (/[0-9]/.test(char)) {
        return digits[parseInt(char)];
      }
      return char;
    }).join('');
}
