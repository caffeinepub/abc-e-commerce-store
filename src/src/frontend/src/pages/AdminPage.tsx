import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetAllProducts,
  useGetAllCategories,
  useAddProduct,
  useDeleteProduct,
  useAddCategory,
  useDeleteCategory,
  useIsCallerAdmin,
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Package, Tags, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { T as Product, T__2 as Category } from '../backend.d';

export default function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const { data: products = [] } = useGetAllProducts();
  const { data: categories = [] } = useGetAllCategories();
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');

  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: BigInt(0),
    category: '',
    imageUrl: '',
  });

  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    name: '',
    description: '',
  });

  const isAuthenticated = !!identity;

  // Check if we need to show profile setup
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({ name: profileName });
      setShowProfileSetup(false);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newProduct: Product = {
        id: BigInt(Date.now()), // Temporary ID
        ...productForm,
      };
      await addProductMutation.mutateAsync(newProduct);
      toast.success('Product added successfully!');
      setProductForm({
        name: '',
        description: '',
        price: BigInt(0),
        category: '',
        imageUrl: '',
      });
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: bigint, productName: string) => {
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success(`${productName} deleted`);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const newCategory: Category = {
        id: BigInt(Date.now()), // Temporary ID
        ...categoryForm,
      };
      await addCategoryMutation.mutateAsync(newCategory);
      toast.success('Category added successfully!');
      setCategoryForm({ name: '', description: '' });
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId: bigint, categoryName: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast.success(`${categoryName} deleted`);
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Profile Setup Modal
  if (showProfileSetup) {
    return (
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Welcome!</DialogTitle>
            <DialogDescription>
              Please tell us your name to get started.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Your Name</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={saveProfileMutation.isPending}>
              {saveProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
          <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-8">
          Please login to access the admin dashboard
        </p>
        <Button onClick={login} size="lg">
          Login
        </Button>
      </div>
    );
  }

  // Loading admin status
  if (isAdminLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 mb-6">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage products and categories</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tags className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productCategory">Category *</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger id="productCategory">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id.toString()} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productDescription">Description</Label>
                  <Textarea
                    id="productDescription"
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productPrice">Price (in cents) *</Label>
                    <Input
                      id="productPrice"
                      type="number"
                      min="0"
                      value={Number(productForm.price)}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: BigInt(e.target.value || 0) }))}
                      placeholder="2999 = $29.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productImage">Image URL</Label>
                    <Input
                      id="productImage"
                      type="url"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={addProductMutation.isPending}>
                  {addProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Product
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">All Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No products yet. Add your first product above!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id.toString()}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {product.category}
                            </span>
                          </TableCell>
                          <TableCell>${(Number(product.price) / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={deleteProductMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          {/* Add Category Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Electronics, Clothing"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                    rows={2}
                  />
                </div>

                <Button type="submit" disabled={addCategoryMutation.isPending}>
                  {addCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Category
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No categories yet. Add your first category above!
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id.toString()}>
                      <CardContent className="p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          disabled={deleteCategoryMutation.isPending}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
