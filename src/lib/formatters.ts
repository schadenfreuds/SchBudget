/**
 * Kullanıcı yazarken binlik basamaklara otomatik nokta (.), ondalık kısma virgül (,) ekleyen biçimlendirici.
 * Örn: '1000' -> '1.000'
 * Örn: '1500000' -> '1.500.000'
 * Örn: '1500,50' -> '1.500,50'
 */
export function formatAmountInput(value: string): string {
  if (!value) return '';

  // Kullanıcı sadece virgül bastıysa "0," başlat
  if (value === ',') return '0,';

  // 1. Önceki biçimlendirmeden kalan tüm noktaları (.) temizle (nokta binlik ayracıdır)
  const withoutDots = value.replace(/\./g, '');

  // 2. Virgül (ondalık) kontrolü
  const hasComma = withoutDots.includes(',');
  const parts = withoutDots.split(',');

  // Tamsayı kısmı (sadece rakamlar)
  let integerDigits = parts[0].replace(/[^\d]/g, '');

  // Baştaki fazlalık sıfırları temizle ("05" -> "5", ama "0" kalsın)
  if (integerDigits.length > 1 && integerDigits.startsWith('0')) {
    integerDigits = integerDigits.replace(/^0+/, '') || '0';
  }

  // Binlik basamaklara nokta koy
  const formattedInteger = integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (hasComma) {
    // Ondalık kısım (en fazla 2 hane kuruş)
    const decimalDigits = (parts[1] || '').replace(/[^\d]/g, '').slice(0, 2);
    return `${formattedInteger || '0'},${decimalDigits}`;
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
