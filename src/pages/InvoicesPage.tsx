import { useState, useEffect } from 'react';
import { Invoice } from '@/lib/types';
import { getInvoices, deleteInvoice, getSettings } from '@/lib/storage';
import { downloadInvoicePDF } from '@/lib/pdf';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Input } from '@/components/ui/input';
import { Search, Download, MessageCircle, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoicesData, settingsData] = await Promise.all([getInvoices(), getSettings()]);
        setInvoices(invoicesData);
        setSettings(settingsData);
      } catch (err) {
        console.error('Error loading invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = invoices
    .filter(i => i.clientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.includes(search))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      const updated = await getInvoices();
      setInvoices(updated);
      toast.success('Invoice deleted');
    } catch (err) {
      console.error('Error deleting invoice:', err);
      toast.error('Error deleting invoice');
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return;
    const headers = 'Invoice No,Client,Phone,Date,Subtotal,Tax,Discount,Total\n';
    const rows = invoices.map(i =>
      `${i.invoiceNumber},"${i.clientName}",${i.clientPhone},${new Date(i.createdAt).toLocaleDateString()},${i.subtotal},${i.tax},${i.discount},${i.total}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  if (loading || !settings) return <div className="pb-20 px-4 pt-4 text-center py-10">Loading invoices...</div>;

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {invoices.length > 0 && (
          <button onClick={handleExportCSV} className="p-2 border-2 border-border hover:bg-secondary text-xs font-bold">
            CSV
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-2" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="h-12 w-12 mb-2" />
          <p className="text-lg font-bold">No invoices yet</p>
          <p className="text-sm">Create orders to generate invoices</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <div key={inv.id} className="border-2 border-border bg-card p-3 shadow-2xs">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold font-mono text-sm">{inv.invoiceNumber}</p>
                  <p className="font-bold">{inv.clientName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-lg font-bold font-mono">{settings.currency}{inv.total.toFixed(2)}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => downloadInvoicePDF(inv, settings)}
                  className="flex-1 flex items-center justify-center gap-1 p-1.5 border-2 border-border text-xs font-bold hover:bg-secondary"
                >
                  <Download className="h-3 w-3" /> PDF
                </button>
                <button
                  onClick={() => window.open(generateWhatsAppLink(inv, settings), '_blank')}
                  className="flex-1 flex items-center justify-center gap-1 p-1.5 border-2 border-border text-xs font-bold hover:bg-secondary"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </button>
                <button
                  onClick={() => handleDelete(inv.id)}
                  className="p-1.5 border-2 border-border hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
