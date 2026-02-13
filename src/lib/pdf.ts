import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, AppSettings } from './types';

export function generateInvoicePDF(invoice: Invoice, settings: AppSettings): jsPDF {
  const doc = new jsPDF();
  const currency = settings.currency || '₹';

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'My Business', 14, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (settings.companyAddress) doc.text(settings.companyAddress, 14, 33);
  if (settings.companyPhone) doc.text(`Phone: ${settings.companyPhone}`, 14, 39);

  // Invoice info
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 196, 25, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 196, 33, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 196, 39, { align: 'right' });

  // Divider
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // Client info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName, 14, 62);
  doc.text(`Phone: ${invoice.clientPhone}`, 14, 68);
  if (invoice.clientAddress) doc.text(invoice.clientAddress, 14, 74);

  // Table
  const tableData = invoice.items.map(item => [
    item.title,
    item.quantity.toString(),
    `${currency}${item.price.toFixed(2)}`,
    `${currency}${(item.price * item.quantity).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 82,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // Totals
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  const rightX = 196;
  const labelX = 140;

  doc.text('Subtotal:', labelX, finalY);
  doc.text(`${currency}${invoice.subtotal.toFixed(2)}`, rightX, finalY, { align: 'right' });

  if (invoice.tax > 0) {
    doc.text('Tax:', labelX, finalY + 7);
    doc.text(`${currency}${invoice.tax.toFixed(2)}`, rightX, finalY + 7, { align: 'right' });
  }

  if (invoice.discount > 0) {
    doc.text('Discount:', labelX, finalY + 14);
    doc.text(`-${currency}${invoice.discount.toFixed(2)}`, rightX, finalY + 14, { align: 'right' });
  }

  const totalY = finalY + (invoice.tax > 0 ? 7 : 0) + (invoice.discount > 0 ? 7 : 0) + 7;
  doc.setLineWidth(0.5);
  doc.line(labelX, totalY - 3, rightX, totalY - 3);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', labelX, totalY + 4);
  doc.text(`${currency}${invoice.total.toFixed(2)}`, rightX, totalY + 4, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  return doc;
}

export function downloadInvoicePDF(invoice: Invoice, settings: AppSettings) {
  const doc = generateInvoicePDF(invoice, settings);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
