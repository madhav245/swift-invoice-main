import { Product } from '@/lib/types';
import { Pencil, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="border-2 border-border bg-card shadow-xs overflow-hidden">
      {product.image ? (
        <div className="h-32 w-full overflow-hidden bg-secondary">
          <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-secondary text-muted-foreground text-3xl font-bold">
          {product.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="p-3">
        <h3 className="font-bold text-foreground truncate">{product.title}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold font-mono text-foreground">₹{product.price.toFixed(2)}</span>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(product)}
              className="p-1.5 border-2 border-border bg-background hover:bg-secondary transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-1.5 border-2 border-border bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
