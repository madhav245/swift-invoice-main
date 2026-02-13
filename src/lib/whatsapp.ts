import { Invoice, AppSettings } from './types';

export function generateWhatsAppLink(invoice: Invoice, settings: AppSettings): string {
  const currency = settings.currency || '₹';
  const message = `Hello ${invoice.clientName},

Your order is confirmed! ✅

📋 Invoice No: #${invoice.invoiceNumber}
📅 Date: ${new Date(invoice.createdAt).toLocaleDateString()}

Items:
${invoice.items.map(i => `• ${i.title} x${i.quantity} = ${currency}${(i.price * i.quantity).toFixed(2)}`).join('\n')}

💰 Total: ${currency}${invoice.total.toFixed(2)}

Thank you for your business!
— ${settings.companyName}`;

  const phone = invoice.clientPhone.replace(/[^0-9]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
