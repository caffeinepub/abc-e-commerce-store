import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface T {
    id: ProductId;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface T__2 {
    id: CategoryId;
    name: string;
    description: string;
}
export interface T__1 {
    productId: ProductId;
    quantity: bigint;
}
export type CategoryId = bigint;
export type ProductId = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: T__2): Promise<void>;
    addProduct(product: T): Promise<void>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    deleteCategory(categoryId: CategoryId): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAllCategories(): Promise<Array<T__2>>;
    getAllProducts(): Promise<Array<T>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCartTotal(): Promise<bigint>;
    getProductById(productId: ProductId): Promise<T | null>;
    getUserCart(): Promise<Array<T__1>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFromCart(productId: ProductId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<T>>;
    updateCartQuantity(productId: ProductId, quantity: bigint): Promise<void>;
    updateProduct(productId: ProductId, updatedProduct: T): Promise<void>;
}
