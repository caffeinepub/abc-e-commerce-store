import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId: string };
  const { data: product, isLoading } = useGetProduct(BigInt(productId));
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCartMutation.mutateAsync({ 
        productId: product.id, 
        quantity: BigInt(quantity) 
      });
      toast.success(`${quantity} x ${product.name} added to cart!`);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-display font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8 gap-2">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-xl">
            <img
              src={product.imageUrl || 'https://placehold.co/800x800/10b981/ffffff?text=Product'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-3">{product.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              {product.name}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price */}
          <Card className="bg-accent/50 border-accent">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="text-4xl font-bold text-primary">
                ${(Number(product.price) / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="rounded-full h-12 w-12"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-semibold w-16 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                className="rounded-full h-12 w-12"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
            size="lg"
            className="w-full text-lg h-14 gap-3"
          >
            <ShoppingCart className="h-5 w-5" />
            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>

          {/* Stock Info */}
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">In Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
