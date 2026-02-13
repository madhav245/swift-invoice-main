import { useState, useCallback, useEffect } from 'react';
import { Client } from '@/lib/types';
import { getClients, addClient, updateClient, deleteClient } from '@/lib/storage';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Phone } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error('Error refreshing clients:', err);
    }
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSave = async (data: Omit<Client, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (data.id) {
        await updateClient({ ...data, id: data.id, createdAt: editClient!.createdAt } as Client);
      } else {
        await addClient({ ...data, id: uuid(), createdAt: new Date().toISOString() } as Client);
      }
      await refresh();
      setShowForm(false);
      setEditClient(null);
    } catch (err) {
      console.error('Error saving client:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      await refresh();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  if (loading) return <div className="pb-20 px-4 pt-4 text-center py-10">Loading clients...</div>;

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={() => { setEditClient(null); setShowForm(true); }} className="border-2 font-bold gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-2" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-bold">No clients yet</p>
          <p className="text-sm">Tap "Add" to add your first client</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-3 border-2 border-border bg-card p-3 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border bg-secondary font-bold text-foreground">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {c.phone}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditClient(c); setShowForm(true); }} className="p-1.5 border-2 border-border hover:bg-secondary">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 border-2 border-border hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ClientForm
          client={editClient}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditClient(null); }}
        />
      )}
    </div>
  );
}
