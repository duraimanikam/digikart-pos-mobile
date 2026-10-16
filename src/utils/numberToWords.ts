/**
 * Utility to convert numbers to Indian Currency Words (Lakhs, Crores, Thousands, Rupees & Paise)
 * Standard requirement for statutory Indian GST Tax Invoices.
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === null || num === undefined) {
    return 'Zero Rupees Only';
  }

  const rounded = Math.round(num * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Zero Rupees Only';
  }

  let words = '';
  if (integerPart > 0) {
    words = convertIntegerToIndianWords(integerPart) + ' Rupees';
  }

  if (decimalPart > 0) {
    const paiseWords = convertTwoDigits(decimalPart);
    if (words) {
      words += ' and ' + paiseWords + ' Paise';
    } else {
      words = paiseWords + ' Paise';
    }
  }

  return words + ' Only';
}

function convertIntegerToIndianWords(n: number): string {
  if (n === 0) return 'Zero';

  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertTwoDigits(val: number): string {
    if (val < 20) return units[val];
    const ten = Math.floor(val / 10);
    const unit = val % 10;
    return tens[ten] + (unit ? ' ' + units[unit] : '');
  }

  function convertThreeDigits(val: number): string {
    let str = '';
    const hundred = Math.floor(val / 100);
    const rem = val % 100;
    if (hundred) {
      str += units[hundred] + ' Hundred';
      if (rem) str += ' and ';
    }
    if (rem) {
      str += convertTwoDigits(rem);
    }
    return str;
  }

  // Indian format chunks: Crores (10^7), Lakhs (10^5), Thousands (10^3), Hundreds
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  const remainder = n % 1000;

  let result = '';
  if (crore > 0) {
    result += convertIntegerToIndianWords(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    result += convertThreeDigits(remainder);
  }

  return result.trim();
}

function convertTwoDigits(val: number): string {
  const units = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (val < 20) return units[val];
  const ten = Math.floor(val / 10);
  const unit = val % 10;
  return tens[ten] + (unit ? ' ' + units[unit] : '');
}
