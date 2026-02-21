import { useState, useMemo } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useGetAllProducts, useGetAllCategories, useAddToCart } from '../hooks/useQueries';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { T as Product } from '../backend.d';

export default function HomePage() {
  const search = useSearch({ strict: false }) as { q?: string };
  const { data: products = [], isLoading: productsLoading } = useGetAllProducts();
  const { data: categories = [] } = useGetAllCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const addToCartMutation = useAddToCart();

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply search filter
    if (search.q) {
      const query = search.q.toLowerCase();
      filtered = filtered.filter(
        p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, search.q]);

  // Get featured products (first 3 products)
  const featuredProducts = useMemo(() => products.slice(0, 3), [products]);

  const handleAddToCart = async (productId: bigint, productName: string) => {
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: BigInt(1) });
      toast.success(`${productName} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Promotional Banner */}
      {featuredProducts.length > 0 && (
        <section className="mb-12 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Featured Products
              </h2>
            </div>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Discover our handpicked selection of premium products
            </p>

            {/* Featured Products Grid - Diagonal Layout */}
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id.toString()}
                  to="/product/$productId"
                  params={{ productId: product.id.toString() }}
                  className="group"
                  style={{ transform: `translateY(${index * 12}px)` }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card/80 backdrop-blur">
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={product.imageUrl || 'https://placehold.co/400x400/10b981/ffffff?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge className="mb-2">{product.category}</Badge>
                      <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary">
                        ${(Number(product.price) / 100).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filters */}
      <div className="mb-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="all" className="rounded-full">
              All Products
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id.toString()} 
                value={category.name}
                className="rounded-full"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Search Results Info */}
      {search.q && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found <span className="font-semibold text-foreground">{filteredProducts.length}</span> result(s) for{' '}
            <span className="font-semibold text-primary">"{search.q}"</span>
          </p>
        </div>
      )}

      {/* Product Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-display font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {search.q ? 'Try adjusting your search terms' : 'Check back later for new products'}
          </p>
          {search.q && (
            <Button asChild variant="outline">
              <Link to="/">Clear Search</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id.toString()} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <Link
                to="/product/$productId"
                params={{ productId: product.id.toString() }}
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x400/10b981/ffffff?text=Product'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ${(Number(product.price) / 100).toFixed(2)}
                  </p>
                </CardContent>
              </Link>
              <CardFooter className="p-4 pt-0">
                <Button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={addToCartMutation.isPending}
                  className="w-full gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
