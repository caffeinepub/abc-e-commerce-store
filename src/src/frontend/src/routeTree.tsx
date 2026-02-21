import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetailPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
]);
