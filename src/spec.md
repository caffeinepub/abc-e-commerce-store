# ABC E-commerce Website

## Current State

This is a fresh Caffeine project with:
- React frontend scaffolding with Internet Identity authentication
- No backend APIs yet
- No application-specific UI components
- shadcn/ui component library available

## Requested Changes (Diff)

### Add

**Backend:**
- Product management system with fields: id, name, description, price, category, imageUrl
- Category management system
- Shopping cart functionality per user
- Product search by keywords
- CRUD operations for products and categories (admin functions)
- Cart operations: add item, remove item, update quantity, get cart contents, clear cart

**Frontend:**
- Admin dashboard for adding/editing products and managing categories
- Product catalog page with grid layout displaying all products
- Top banner ad section for promotional products (configurable)
- Search bar with keyword filtering
- Product detail view
- Shopping cart page with quantity controls
- Checkout/payment page with order summary
- Category filter/navigation
- Green color theme throughout the application

### Modify

- Replace default App component with e-commerce routing structure
- Apply green theme using Tailwind customization

### Remove

- No existing functionality to remove

## Implementation Plan

**Phase 1: Backend API**
1. Generate Motoko backend with:
   - Product data model (id, name, description, price, category, imageUrl, stock)
   - Category data model (id, name, description)
   - Shopping cart data model per user (principal-based)
   - Functions to create/read/update/delete products
   - Functions to create/read/update/delete categories
   - Functions to add/remove/update cart items
   - Function to search products by keyword (name/description)
   - Function to filter products by category
   - Function to get cart contents for current user

**Phase 2: Frontend Implementation**
1. Create routing structure with pages:
   - Home page (product catalog with search and category filter)
   - Admin page (product and category management)
   - Product detail page
   - Cart page
   - Checkout page

2. Implement top-level components:
   - Header with logo "ABC", search bar, cart icon with item count
   - Promotional banner ad at top (configurable featured products)
   - Footer

3. Product catalog features:
   - Grid layout of product cards
   - Category navigation/filter sidebar or tabs
   - Search bar that filters by keywords
   - Add to cart button on each product card

4. Admin dashboard:
   - Form to add new products (name, description, price, category, image URL)
   - Product list with edit/delete controls
   - Category management section

5. Shopping cart:
   - List of cart items with images, names, prices
   - Quantity adjustment controls (+/- buttons)
   - Remove item button
   - Subtotal and total calculation
   - Proceed to checkout button

6. Checkout page:
   - Order summary
   - Simple payment form UI (name, address, payment method selection)
   - Place order button (clears cart)

7. Apply green theme:
   - Primary green color for buttons, headers, links
   - Green accents throughout UI
   - Maintain good contrast and readability

## UX Notes

- **Green Theme**: Use various shades of green for branding (emerald/green-600 as primary, lighter greens for backgrounds, darker greens for text)
- **Product Cards**: Include product image, name, price, category badge, and "Add to Cart" button
- **Search**: Real-time filtering as user types keywords
- **Cart Badge**: Show item count on cart icon in header
- **Admin Access**: Use Internet Identity authentication to protect admin routes
- **Responsive Design**: Mobile-friendly grid layouts (1 column on mobile, 2-3 on tablet, 4 on desktop)
- **Loading States**: Show skeletons while fetching products
- **Empty States**: Friendly messages when cart is empty or no products found
- **Ad Banner**: Prominent banner at top of home page showcasing 1-3 featured/promotional products with images and "Shop Now" CTAs
