/**
 * Kullanıcı yazarken binlik basamaklara otomatik nokta (.), ondalık kısma virgül (,) ekleyen biçimlendirici.
 * Örn: '1000' -> '1.000'
 * Örn: '1500000' -> '1.500.000'
 * Örn: '1500,50' -> '1.500,50'
 */
export function formatAmountInput(value: string): string {
  if (!value) return '';

  // Kullanıcı sadece virgül veya nokta bastıysa "0," başlat
  if (value === ',' || value === '.') return '0,';

  let hasDecimal = false;
  let integerPart = '';
  let decimalPart = '';

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char >= '0' && char <= '9') {
      if (!hasDecimal) {
        integerPart += char;
      } else if (decimalPart.length < 2) {
        // En fazla 2 ondalık hane (kuruş)
        decimalPart += char;
      }
    } else if ((char === ',' || char === '.') && !hasDecimal) {
      hasDecimal = true;
    }
  }

  // Baştaki fazlalık sıfırları temizle ("05" -> "5", ama "0" kalsın)
  if (integerPart.length > 1 && integerPart.startsWith('0')) {
    integerPart = integerPart.replace(/^0+/, '') || '0';
  }

  // Binlik basamaklara nokta koy
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (hasDecimal) {
    return `${formattedInteger || '0'},${decimalPart}`;
  }

  return formattedInteger;
}

/**
 * Biçimlendirilmiş metni (ör: '1.250.000,50') float sayıya çevirir.
 */
export function parseFormattedAmount(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
