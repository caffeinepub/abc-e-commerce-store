import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { 
  useGetCart, 
  useGetAllProducts, 
  useGetCartTotal,
  useClearCart 
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, CreditCard, Wallet, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart = [], isLoading: cartLoading } = useGetCart();
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: cartTotal = BigInt(0) } = useGetCartTotal();
  const clearCartMutation = useClearCart();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit-card',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);

  const isLoading = cartLoading || productsLoading;

  // Map cart items to products
  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return {
      ...cartItem,
      product,
    };
  }).filter(item => item.product);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Clear the cart
      await clearCartMutation.mutateAsync();
      
      // Show success state
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate({ to: '/' });
      }, 3000);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">
          Add some products to your cart before checking out
        </p>
        <Button asChild size="lg">
          <Link to="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-4xl font-display font-bold mb-4">Order Placed Successfully!</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Thank you for your purchase. You will be redirected shortly...
        </p>
        <Button asChild size="lg">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display font-bold mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex-1 cursor-pointer flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span>Credit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="debit-card" id="debit-card" />
                    <Label htmlFor="debit-card" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <span>Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                    <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>Bank Transfer</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-display">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map(({ productId, quantity, product }) => {
                    if (!product) return null;
                    
                    return (
                      <div key={productId.toString()} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.imageUrl || 'https://placehold.co/100x100/10b981/ffffff?text=Product'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {Number(quantity)}</p>
                          <p className="text-sm font-semibold text-primary">
                            ${(Number(product.price) * Number(quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

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

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={clearCartMutation.isPending}
                >
                  {clearCartMutation.isPending ? 'Processing...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
