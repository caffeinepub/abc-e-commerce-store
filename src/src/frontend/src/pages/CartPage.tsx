import { Link } from '@tanstack/react-router';
import { 
  useGetCart, 
  useGetAllProducts, 
  useUpdateCartQuantity, 
  useRemoveFromCart,
  useGetCartTotal 
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { data: cart = [], isLoading: cartLoading } = useGetCart();
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: cartTotal = BigInt(0) } = useGetCartTotal();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  const isLoading = cartLoading || productsLoading;

  // Map cart items to products
  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return {
      ...cartItem,
      product,
    };
  }).filter(item => item.product);

  const handleUpdateQuantity = async (productId: bigint, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateQuantityMutation.mutateAsync({ 
        productId, 
        quantity: BigInt(newQuantity) 
      });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: bigint, productName: string) => {
    try {
      await removeFromCartMutation.mutateAsync(productId);
      toast.success(`${productName} removed from cart`);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Start shopping and add some products to your cart!
        </p>
        <Button asChild size="lg">
          <Link to="/">
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ productId, quantity, product }) => {
            if (!product) return null;
            
            const itemTotal = Number(product.price) * Number(quantity);

            return (
              <Card key={productId.toString()}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to="/product/$productId"
                      params={{ productId: productId.toString() }}
                      className="shrink-0"
                    >
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={product.imageUrl || 'https://placehold.co/200x200/10b981/ffffff?text=Product'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/product/$productId"
                        params={{ productId: productId.toString() }}
                      >
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(productId, Number(quantity) - 1)}
                            disabled={Number(quantity) <= 1 || updateQuantityMutation.isPending}
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-lg font-semibold w-12 text-center">
                            {Number(quantity)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(productId, Number(quantity) + 1)}
                            disabled={updateQuantityMutation.isPending}
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center gap-4">
                          <p className="text-xl font-bold text-primary">
                            ${(itemTotal / 100).toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(productId, product.name)}
                            disabled={removeFromCartMutation.isPending}
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-display font-bold">Order Summary</h2>
              
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${(Number(cartTotal) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">${(Number(cartTotal) / 100).toFixed(2)}</span>
              </div>

              <Button asChild size="lg" className="w-full gap-2">
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/">
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
