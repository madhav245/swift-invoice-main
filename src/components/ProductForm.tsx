import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSave: (p: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

export function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(product.price.toString());
      setImage(product.image || '');
    }
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;
    onSave({
      id: product?.id,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: image || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 sm:items-center">
      <div className="w-full max-w-md border-2 border-border bg-background p-5 shadow-md animate-in slide-in-from-bottom-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-1 border-2 border-border hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title" className="text-xs font-bold uppercase">Title *</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="border-2" required />
          </div>
          <div>
            <Label htmlFor="desc" className="text-xs font-bold uppercase">Description</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} className="border-2 resize-none" rows={2} />
          </div>
          <div>
            <Label htmlFor="price" className="text-xs font-bold uppercase">Price (₹) *</Label>
            <Input id="price" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="border-2" required />
          </div>
          <div>
            <Label htmlFor="img" className="text-xs font-bold uppercase">Image</Label>
            <Input id="img" type="file" accept="image/*" onChange={handleImageUpload} className="border-2" />
            {image && (
              <div className="mt-2 h-20 w-20 border-2 border-border overflow-hidden">
                <img src={image} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <Button type="submit" className="w-full border-2 font-bold">
            {product ? 'Update' : 'Add'} Product
          </Button>
        </form>
      </div>
    </div>
  );
}
