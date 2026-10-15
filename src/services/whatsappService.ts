import { Linking, Platform } from 'react-native';
import { Invoice } from '../types';

export const generateWhatsAppReceiptText = (
  invoice: Invoice,
  shopDetails?: { shopName?: string; phone?: string; gstin?: string; address?: string }
): string => {
  const storeName = shopDetails?.shopName || 'DigiKart Super Market';
  const address = shopDetails?.address || 'No. 123, Main Road, Chennai - 600001';
  const gstin = shopDetails?.gstin || '33ABCDE1234F1Z5';
  const phone = shopDetails?.phone || '98765 43210';

  const itemsList = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}* (${item.unit || ''})\n   Qty: ${item.quantity} x ₹${item.unitPrice.toFixed(
          2
        )} = ₹${item.totalAmount.toFixed(2)}`
    )
    .join('\n');

  return (
    `🧾 *${storeName.toUpperCase()}*\n` +
    `📍 ${address}\n` +
    `📞 Phone: ${phone}\n` +
    `🔖 GSTIN: ${gstin}\n` +
    `-----------------------------------------\n` +
    `*TAX INVOICE*: #${invoice.invoiceNo}\n` +
    `*Date*: ${invoice.date}\n` +
    `*Customer*: ${invoice.customerName || 'Walk-in Customer'}\n` +
    (invoice.customerPhone ? `*Phone*: ${invoice.customerPhone}\n` : '') +
    `-----------------------------------------\n` +
    `*ITEMS PURCHASED:*\n` +
    `${itemsList}\n` +
    `-----------------------------------------\n` +
    `*Total Items*: ${invoice.items.length}\n` +
    `*Total Qty*: ${invoice.items.reduce((s, i) => s + i.quantity, 0)}\n` +
    `*TOTAL AMOUNT*: ₹${invoice.grandTotal.toFixed(2)}\n` +
    `*Payment Mode*: ${invoice.paymentMode}\n` +
    (invoice.cashTendered ? `*Paid (Cash)*: ₹${invoice.cashTendered.toFixed(2)}\n` : '') +
    (invoice.changeDue ? `*Balance Returned*: ₹${invoice.changeDue.toFixed(2)}\n` : '') +
    `-----------------------------------------\n` +
    `✨ *Thank You! Visit Again.*\n` +
    `📱 _Billed via DigiKart POS_`
  );
};

export const shareOnWhatsApp = async (
  invoice: Invoice,
  recipientPhone?: string,
  shopDetails?: { shopName?: string; phone?: string; gstin?: string; address?: string }
): Promise<boolean> => {
  try {
    const text = generateWhatsAppReceiptText(invoice, shopDetails);
    const encodedText = encodeURIComponent(text);

    // Normalize phone number (strip whitespace, ensure India 91 prefix if 10 digits)
    let phone = (recipientPhone || invoice.customerPhone || '').replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = '91' + phone;
    }

    let url = '';
    if (phone) {
      url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return true;
      }
    }

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    } else {
      const fallbackUrl = `https://wa.me/${phone}?text=${encodedText}`;
      await Linking.openURL(fallbackUrl);
      return true;
    }
  } catch (err) {
    console.error('Failed to share via WhatsApp:', err);
    return false;
  }
};
