import { Link } from '@tanstack/react-router';
import { Search, ShoppingCart, User, Moon, Sun, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: cart } = useGetCart();
  const { identity, login, clear } = useInternetIdentity();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartItemCount = cart?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const isAuthenticated = !!identity;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: '/', search: { q: searchQuery } });
  };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      await login();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:scale-105 transition-transform">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground">ABC</span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Auth Button */}
              <Button
                onClick={handleAuthClick}
                variant={isAuthenticated ? "outline" : "default"}
                size="sm"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isAuthenticated ? 'Logout' : 'Login'}
                </span>
              </Button>

              {/* Admin Link (if authenticated) */}
              {isAuthenticated && (
                <Link to="/admin">
                  <Button variant="secondary" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-xl font-display font-bold">ABC</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © 2026. Built with <span className="text-primary">♥</span> using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
