import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/lib/types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/storage';
import { ProductCard } from '@/components/ProductCard';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { v4 as uuid } from 'uuid';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error refreshing products:', err);
    }
  }, []);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (data.id) {
        await updateProduct({ ...data, id: data.id, createdAt: editProduct!.createdAt } as Product);
      } else {
        await addProduct({ ...data, id: uuid(), createdAt: new Date().toISOString() } as Product);
      }
      await refresh();
      setShowForm(false);
      setEditProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await refresh();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  if (loading) return <div className="pb-20 px-4 pt-4 text-center py-10">Loading products...</div>;

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditProduct(null); setShowForm(true); }} className="border-2 font-bold gap-1">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 border-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-bold">No products yet</p>
          <p className="text-sm">Tap "Add" to create your first product</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={p => { setEditProduct(p); setShowForm(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}
