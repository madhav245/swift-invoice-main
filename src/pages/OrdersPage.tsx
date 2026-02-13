import { useState, useEffect } from 'react';
import { Product, Client, OrderItem, Invoice } from '@/lib/types';
import { getProducts, getClients, addClient, addInvoice, getNextInvoiceNumber, getSettings } from '@/lib/storage';
import { downloadInvoicePDF } from '@/lib/pdf';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Minus, Plus, Search, MessageCircle, Download, ArrowLeft } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

type Step = 'products' | 'client' | 'summary';

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [step, setStep] = useState<Step>('products');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [discount, setDiscount] = useState(0);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, clientsData, settingsData] = await Promise.all([getProducts(), getClients(), getSettings()]);
        setProducts(productsData);
        setClients(clientsData);
        setSettings(settingsData);
      } catch (err) {
        console.error('Error loading order data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const cartItems: (OrderItem & { productId: string })[] = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = products.find(x => x.id === id)!;
      return { productId: id, title: p.title, price: p.price, quantity: qty };
    });

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = subtotal * (settings.taxRate / 100);
  const total = subtotal + taxAmount - discount;

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const selectClient = (c: Client) => {
    setSelectedClientId(c.id);
    setClientName(c.name);
    setClientPhone(c.phone);
    setClientAddress(c.address);
  };

  const handleCreateInvoice = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.error('Client name and phone are required');
      return;
    }

    try {
      // Save client if new
      let clientId = selectedClientId;
      if (!clientId) {
        clientId = uuid();
        await addClient({ id: clientId, name: clientName, phone: clientPhone, address: clientAddress, createdAt: new Date().toISOString() });
      }

      const invoiceNumber = await getNextInvoiceNumber();
      const invoice: Invoice = {
        id: uuid(),
        invoiceNumber,
        clientId,
        clientName,
        clientPhone,
        clientAddress,
        items: cartItems,
        subtotal,
        tax: taxAmount,
        discount,
        total,
        createdAt: new Date().toISOString(),
      };

      await addInvoice(invoice);
      setCreatedInvoice(invoice);
      toast.success(`Invoice ${invoice.invoiceNumber} created!`);
    } catch (err) {
      console.error('Error creating invoice:', err);
      toast.error('Error creating invoice');
    }
  };

  const handleDownload = () => {
    if (createdInvoice) downloadInvoicePDF(createdInvoice, settings);
  };

  const handleWhatsApp = () => {
    if (createdInvoice) {
      const link = generateWhatsAppLink(createdInvoice, settings);
      window.open(link, '_blank');
    }
  };

  const resetOrder = () => {
    setCart({});
    setStep('products');
    setSelectedClientId('');
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setDiscount(0);
    setCreatedInvoice(null);
  };

  if (loading || !settings) return <div className="pb-20 px-4 pt-4 text-center py-10">Loading...</div>;

  if (createdInvoice) {
    return (
      <div className="pb-20 px-4 pt-4">
        <div className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-border bg-secondary">
            <Check className="h-8 w-8 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Invoice Created!</h1>
          <p className="text-muted-foreground font-mono">#{createdInvoice.invoiceNumber}</p>
          <p className="text-lg font-bold font-mono">{settings.currency}{createdInvoice.total.toFixed(2)}</p>

          <div className="w-full max-w-sm space-y-2 mt-4">
            <Button onClick={handleDownload} className="w-full border-2 font-bold gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handleWhatsApp} variant="secondary" className="w-full border-2 font-bold gap-2">
              <MessageCircle className="h-4 w-4" /> Send via WhatsApp
            </Button>
            <Button onClick={resetOrder} variant="outline" className="w-full border-2 font-bold">
              New Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4">
      {step === 'products' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">New Order</h1>
            {cartItems.length > 0 && (
              <Button onClick={() => setStep('client')} className="border-2 font-bold gap-1">
                OK <Check className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-2" />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg font-bold">No products</p>
              <p className="text-sm">Add products first from the Products tab</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => {
                const qty = cart[p.id] || 0;
                return (
                  <div key={p.id} className="flex items-center gap-3 border-2 border-border bg-card p-3 shadow-2xs">
                    {p.image ? (
                      <div className="h-12 w-12 shrink-0 border-2 border-border overflow-hidden">
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-border bg-secondary font-bold">
                        {p.title.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.title}</p>
                      <p className="text-sm font-mono text-muted-foreground">{settings.currency}{p.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(p.id, -1)} className="flex h-8 w-8 items-center justify-center border-2 border-border hover:bg-secondary">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-bold font-mono">{qty}</span>
                      <button onClick={() => updateQty(p.id, 1)} className="flex h-8 w-8 items-center justify-center border-2 border-border hover:bg-secondary">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 border-t-2 border-border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{cartItems.length} items</span>
                <span className="text-lg font-bold font-mono">{settings.currency}{subtotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {step === 'client' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep('products')} className="p-1 border-2 border-border hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold">Client Details</h1>
          </div>

          {clients.length > 0 && (
            <div className="mb-4">
              <Label className="text-xs font-bold uppercase">Select Existing Client</Label>
              <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectClient(c)}
                    className={`w-full text-left p-2 border-2 text-sm ${selectedClientId === c.id ? 'border-foreground bg-secondary font-bold' : 'border-border hover:bg-secondary'}`}
                  >
                    {c.name} — {c.phone}
                  </button>
                ))}
              </div>
              <div className="my-3 flex items-center gap-2">
                <div className="flex-1 border-t-2 border-border" />
                <span className="text-xs text-muted-foreground font-bold">OR NEW</span>
                <div className="flex-1 border-t-2 border-border" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold uppercase">Name *</Label>
              <Input value={clientName} onChange={e => { setClientName(e.target.value); setSelectedClientId(''); }} className="border-2" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Phone *</Label>
              <Input type="tel" value={clientPhone} onChange={e => { setClientPhone(e.target.value); setSelectedClientId(''); }} className="border-2" />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Address</Label>
              <Input value={clientAddress} onChange={e => { setClientAddress(e.target.value); setSelectedClientId(''); }} className="border-2" />
            </div>
            <Button onClick={() => setStep('summary')} className="w-full border-2 font-bold" disabled={!clientName.trim() || !clientPhone.trim()}>
              Review Order
            </Button>
          </div>
        </>
      )}

      {step === 'summary' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep('client')} className="p-1 border-2 border-border hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold">Order Summary</h1>
          </div>

          <div className="border-2 border-border bg-card p-3 mb-4 shadow-2xs">
            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Client</p>
            <p className="font-bold">{clientName}</p>
            <p className="text-sm text-muted-foreground">{clientPhone}</p>
          </div>

          <div className="border-2 border-border bg-card shadow-2xs mb-4">
            <div className="p-3 border-b-2 border-border">
              <p className="text-xs font-bold uppercase text-muted-foreground">Items</p>
            </div>
            {cartItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} × {settings.currency}{item.price.toFixed(2)}</p>
                </div>
                <p className="font-bold font-mono">{settings.currency}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-2 border-border bg-card p-3 shadow-2xs space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-mono font-bold">{settings.currency}{subtotal.toFixed(2)}</span>
            </div>
            {settings.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({settings.taxRate}%)</span>
                <span className="font-mono">{settings.currency}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span>Discount</span>
              <Input
                type="number"
                min="0"
                value={discount || ''}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 border-2 text-right h-8 font-mono"
                placeholder="0"
              />
            </div>
            <div className="border-t-2 border-border pt-2 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold font-mono">{settings.currency}{total.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handleCreateInvoice} className="w-full border-2 font-bold text-lg py-5">
            Create Invoice
          </Button>
        </>
      )}
    </div>
  );
}
