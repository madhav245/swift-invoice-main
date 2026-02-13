import { useState, useEffect } from 'react';
import { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ClientFormProps {
  client?: Client | null;
  onSave: (c: Omit<Client, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export function ClientForm({ client, onSave, onClose }: ClientFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setAddress(client.address);
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }
    onSave({
      id: client?.id,
      name: name.trim(),
      phone: cleanPhone,
      address: address.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 sm:items-center">
      <div className="w-full max-w-md border-2 border-border bg-background p-5 shadow-md animate-in slide-in-from-bottom-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} className="p-1 border-2 border-border hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name" className="text-xs font-bold uppercase">Name *</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="border-2" required />
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs font-bold uppercase">Phone *</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} className="border-2" required />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <div>
            <Label htmlFor="address" className="text-xs font-bold uppercase">Address</Label>
            <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} className="border-2 resize-none" rows={2} />
          </div>
          <Button type="submit" className="w-full border-2 font-bold">
            {client ? 'Update' : 'Add'} Client
          </Button>
        </form>
      </div>
    </div>
  );
}
