import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ProductId = Nat;
  type CategoryId = Nat;
  type CartId = Nat;
  type UserId = Principal;

  module Product {
    public type T = {
      id : ProductId;
      name : Text;
      description : Text;
      price : Nat;
      category : Text;
      imageUrl : Text;
    };

    public func compare(p1 : T, p2 : T) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  module Category {
    public type T = {
      id : CategoryId;
      name : Text;
      description : Text;
    };

    public func compare(c1 : T, c2 : T) : Order.Order {
      Nat.compare(c1.id, c2.id);
    };
  };

  module CartItem {
    public type T = {
      productId : ProductId;
      quantity : Nat;
    };

    public func compare(item1 : T, item2 : T) : Order.Order {
      Nat.compare(item1.productId, item2.productId);
    };
  };

  module Cart {
    public type T = {
      userId : UserId;
      items : [CartItem.T];
    };
  };

  public type UserProfile = {
    name : Text;
  };

  var nextProductId = 1;
  var nextCategoryId = 1;
  var nextCartId = 1;

  // Persistent Storage using Mutable Maps
  let products = Map.empty<ProductId, Product.T>();
  let categories = Map.empty<CategoryId, Category.T>();
  let userCarts = Map.empty<UserId, [CartItem.T]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----------- User Profile Management ----------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ----------- Product Management ----------------

  public shared ({ caller }) func addProduct(product : Product.T) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    let newProduct = { product with id = productId };
    products.add(productId, newProduct);
    nextProductId += 1;
  };

  public query func getAllProducts() : async [Product.T] {
    products.values().toArray().sort();
  };

  public query func getProductById(productId : ProductId) : async ?Product.T {
    products.get(productId);
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, updatedProduct : Product.T) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        products.add(productId, { updatedProduct with id = productId });
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    products.remove(productId);
  };

  public query func searchProducts(searchText : Text) : async [Product.T] {
    let filtered = products.values().toArray().filter(
      func(product) {
        product.name.contains(#text searchText) or product.description.contains(#text searchText)
      }
    );
    filtered.sort();
  };

  // ----------- Category Management ----------------

  public shared ({ caller }) func addCategory(category : Category.T) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };

    let categoryId = nextCategoryId;
    let newCategory = { category with id = categoryId };
    categories.add(categoryId, newCategory);
    nextCategoryId += 1;
  };

  public query func getAllCategories() : async [Category.T] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func deleteCategory(categoryId : CategoryId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };

    if (not categories.containsKey(categoryId)) {
      Runtime.trap("Category not found");
    };

    categories.remove(categoryId);
  };

  // ----------- Shopping Cart Management ----------------

  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let currentCart = switch (userCarts.get(caller)) {
          case (null) { [] };
          case (?cart) { cart };
        };

        let filteredCart = currentCart.filter(
          func(item) {
            item.productId != productId;
          }
        );

        userCarts.add(caller, filteredCart.concat([{
          productId;
          quantity;
        }]));
      };
    };
  };

  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let currentCart = switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    userCarts.add(
      caller,
      currentCart.filter(
        func(item) { item.productId != productId }
      )
    );
  };

  public shared ({ caller }) func updateCartQuantity(productId : ProductId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart");
    };

    if (quantity <= 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let currentCart = switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };

    let filteredCart = currentCart.filter(
      func(item) {
        item.productId != productId;
      }
    );

    userCarts.add(caller, filteredCart.concat([{
      productId;
      quantity;
    }]));
  };

  public query ({ caller }) func getUserCart() : async [CartItem.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };
    switch (userCarts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };
    userCarts.remove(caller);
  };

  public query ({ caller }) func getCartTotal() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart total");
    };
    switch (userCarts.get(caller)) {
      case (null) { 0 };
      case (?cart) {
        var total = 0;
        for (item in cart.values()) {
          switch (products.get(item.productId)) {
            case (null) {};
            case (?product) {
              total += product.price * item.quantity;
            };
          };
        };
        total;
      };
    };
  };
};
