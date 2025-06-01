import {
  users,
  vendors,
  products,
  installers,
  orders,
  cartItems,
  walletTransactions,
  reviews,
  type User,
  type UpsertUser,
  type Vendor,
  type InsertVendor,
  type Product,
  type InsertProduct,
  type Installer,
  type InsertInstaller,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
  type WalletTransaction,
  type InsertWalletTransaction,
  type Review,
  type InsertReview,
  inventory,
  inventoryMovements,
  inventoryAlerts,
  escrowAccounts,
  installationMilestones,
  milestonePayments
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or, sql, inArray, count } from "drizzle-orm";

export interface IStorage {
  // User operations (custom authentication)
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<UpsertUser>): Promise<User>;

  // Vendor operations
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  getVendors(filters?: { location?: string; verified?: boolean }): Promise<Vendor[]>;
  updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor>;

  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    vendorId?: number;
    featured?: boolean;
    search?: string;
  }): Promise<Product[]>;
  getProductsByVendor(vendorId: number): Promise<Product[]>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Installer operations
  createInstaller(installer: InsertInstaller): Promise<Installer>;
  getInstaller(id: number): Promise<Installer | undefined>;
  getInstallerByUserId(userId: string): Promise<Installer | undefined>;
  getInstallers(filters?: { location?: string; verified?: boolean }): Promise<Installer[]>;
  updateInstaller(id: number, updates: Partial<InsertInstaller>): Promise<Installer>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: number): Promise<Order[]>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order>;
  getOrders(filters?: { status?: string; vendorId?: number }): Promise<Order[]>;

  // Cart operations
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  getCartItems(userId: string): Promise<CartItem[]>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wallet operations
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  getWalletBalance(userId: string): Promise<number>;
  getWalletTransactions(userId: string): Promise<WalletTransaction[]>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<Review[]>;
  getInstallerReviews(installerId: number): Promise<Review[]>;
  getVendorReviews(vendorId: number): Promise<Review[]>;

  // Analytics
  getVendorStats(vendorId: number): Promise<{
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    monthlyOrders: number;
    monthlyRevenue: number;
  }>;

  getAdminStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }>;

    // Inventory Management Methods
    getInventoryByVendor(vendorId: number): Promise<any>;
    createInventory(data: any): Promise<any>;
    updateInventory(inventoryId: number, data: Partial<any>): Promise<any>;
    addInventoryMovement(data: any): Promise<any>;
    getInventoryAlerts(vendorId: number): Promise<any>;
    markAlertAsRead(alertId: number): Promise<any>;

    // Escrow Management Methods
    createEscrowAccount(data: any): Promise<any>;
    getEscrowAccountsByVendor(vendorId: number): Promise<any>;
    updateEscrowAccount(escrowId: number, data: Partial<any>): Promise<any>;

    // Milestone Management Methods
    createInstallationMilestone(data: any): Promise<any>;
    getMilestonesByOrder(orderId: string): Promise<any>;
    updateMilestone(milestoneId: number, data: Partial<any>): Promise<any>;
    createMilestonePayment(data: any): Promise<any>;
    releaseMilestonePayment(paymentId: number): Promise<any>;

  // Inventory alerts for low stock notifications
  createInventoryAlert(alertData: any): Promise<any>;
  markInventoryAlertRead(alertId: number): Promise<void>;

  // Vendor applications
  createVendorApplication(applicationData: any): Promise<any>;
  getPendingVendorApplications(): Promise<any[]>;
  approveVendorApplication(applicationId: string): Promise<void>;
  rejectVendorApplication(applicationId: string, reason: string): Promise<void>;

  // Product operations by vendor
  // Product operations
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Vendor operations
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }

  async getVendors(filters?: { location?: string; verified?: boolean }): Promise<Vendor[]> {
    let query = db.select().from(vendors);

    if (filters?.verified !== undefined) {
      query = query.where(eq(vendors.verified, filters.verified));
    }

    return await query.orderBy(desc(vendors.rating));
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set(updates)
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(filters?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    vendorId?: number;
    featured?: boolean;
    search?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.inStock, true));

    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(products.type, filters.type as any));
    }

    if (filters?.minPrice) {
      conditions.push(sql`${products.price} >= ${filters.minPrice}`);
    }

    if (filters?.maxPrice) {
      conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
    }

    if (filters?.vendorId) {
      conditions.push(eq(products.vendorId, filters.vendorId));
    }

    if (filters?.featured) {
      conditions.push(eq(products.featured, filters.featured));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(products.featured), desc(products.createdAt));
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Installer operations
  async createInstaller(installer: InsertInstaller): Promise<Installer> {
    const [newInstaller] = await db.insert(installers).values(installer).returning();
    return newInstaller;
  }

  async getInstaller(id: number): Promise<Installer | undefined> {
    const [installer] = await db.select().from(installers).where(eq(installers.id, id));
    return installer;
  }

  async getInstallerByUserId(userId: string): Promise<Installer | undefined> {
    const [installer] = await db.select().from(installers).where(eq(installers.userId, userId));
    return installer;
  }

  async getInstallers(filters?: { location?: string; verified?: boolean }): Promise<Installer[]> {
    let query = db.select().from(installers);

    if (filters?.verified !== undefined) {
      query = query.where(eq(installers.verified, filters.verified));
    }

    return await query.orderBy(desc(installers.rating));
  }

  async updateInstaller(id: number, updates: Partial<InsertInstaller>): Promise<Installer> {
    const [installer] = await db
      .update(installers)
      .set(updates)
      .where(eq(installers.id, id))
      .returning();
    return installer;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByVendor(vendorId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.vendorId, vendorId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getOrders(filters?: { status?: string; vendorId?: number }): Promise<Order[]> {
    let query = db.select().from(orders);

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }

    if (filters?.vendorId) {
      conditions.push(eq(orders.vendorId, filters.vendorId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(orders.createdAt));
  }

  // Cart operations
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItem.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Wallet operations
  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [newTransaction] = await db.insert(walletTransactions).values(transaction).returning();
    return newTransaction;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const [result] = await db
      .select({
        balance: sql<number>`COALESCE(SUM(CASE WHEN type IN ('deposit', 'refund', 'escrow_release') THEN amount ELSE -amount END), 0)`
      })
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId));

    return result?.balance || 0;
  }

  async getWalletTransactions(userId: string): Promise<WalletTransaction[]> {
    return await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async getInstallerReviews(installerId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.installerId, installerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getVendorReviews(vendorId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.vendorId, vendorId))
      .orderBy(desc(reviews.createdAt));
  }

  // Analytics
  async getVendorStats(vendorId: number): Promise<{
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    monthlyOrders: number;
    monthlyRevenue: number;
  }> {
    const [totalStats] = await db
      .select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        avgOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.vendorId, vendorId));

    const [monthlyStats] = await db
      .select({
        monthlyOrders: sql<number>`COUNT(*)`,
        monthlyRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.vendorId, vendorId),
          sql`${orders.createdAt} >= date_trunc('month', CURRENT_DATE)`
        )
      );

    return {
      totalOrders: totalStats?.totalOrders || 0,
      totalRevenue: totalStats?.totalRevenue || 0,
      avgOrderValue: totalStats?.avgOrderValue || 0,
      monthlyOrders: monthlyStats?.monthlyOrders || 0,
      monthlyRevenue: monthlyStats?.monthlyRevenue || 0,
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalVendors: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Order[];
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const [vendorCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(vendors);

    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders);

    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    return {
      totalUsers: userCount?.count || 0,
      totalVendors: vendorCount?.count || 0,
      totalOrders: orderStats?.totalOrders || 0,
      totalRevenue: orderStats?.totalRevenue || 0,
      recentOrders,
    };
  }

  // Inventory Management Methods
  async getInventoryByVendor(vendorId: number) {
    return db.select({
      id: inventory.id,
      productId: inventory.productId,
      productName: products.name,
      sku: products.sku,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      minStockLevel: inventory.minStockLevel,
      maxStockLevel: inventory.maxStockLevel,
      lastRestocked: inventory.lastRestocked,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(eq(inventory.vendorId, vendorId));
  }

  async createInventory(data: any) {
    const [newInventory] = await db.insert(inventory).values(data).returning();
    return newInventory;
  }

  async updateInventory(inventoryId: number, data: Partial<any>) {
    const [updatedInventory] = await db.update(inventory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventory.id, inventoryId))
      .returning();
    return updatedInventory;
  }

  async addInventoryMovement(data: any) {
    const [movement] = await db.insert(inventoryMovements).values(data).returning();
    return movement;
  }

  async getInventoryAlerts(vendorId: number) {
    return db.select()
      .from(inventoryAlerts)
      .where(and(eq(inventoryAlerts.vendorId, vendorId), eq(inventoryAlerts.isRead, false)));
  }

  async markAlertAsRead(alertId: number) {
    return db.update(inventoryAlerts)
      .set({ isRead: true })
      .where(eq(inventoryAlerts.id, alertId));
  }

  // Escrow Management Methods
  async createEscrowAccount(data: any) {
    const [escrowAccount] = await db.insert(escrowAccounts).values(data).returning();
    return escrowAccount;
  }

  async getEscrowAccountsByVendor(vendorId: number) {
    return db.select({
      id: escrowAccounts.id,
      orderId: escrowAccounts.orderId,
      totalAmount: escrowAccounts.totalAmount,
      heldAmount: escrowAccounts.heldAmount,
      releasedAmount: escrowAccounts.releasedAmount,
      status: escrowAccounts.status,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      createdAt: escrowAccounts.createdAt,
    })
    .from(escrowAccounts)
    .leftJoin(users, eq(escrowAccounts.buyerId, users.id))
    .where(eq(escrowAccounts.vendorId, vendorId));
  }

  async updateEscrowAccount(escrowId: number, data: Partial<any>) {
    const [updatedEscrow] = await db.update(escrowAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(escrowAccounts.id, escrowId))
      .returning();
    return updatedEscrow;
  }

  // Milestone Management Methods
  async createInstallationMilestone(data: any) {
    const [milestone] = await db.insert(installationMilestones).values(data).returning();
    return milestone;
  }

  async getMilestonesByOrder(orderId: string) {
    return db.select()
      .from(installationMilestones)
      .where(eq(installationMilestones.orderId, orderId))
      .orderBy(installationMilestones.createdAt);
  }

  async updateMilestone(milestoneId: number, data: Partial<any>) {
    const [updatedMilestone] = await db.update(installationMilestones)
      .set(data)
      .where(eq(installationMilestones.id, milestoneId))
      .returning();
    return updatedMilestone;
  }

  async createMilestonePayment(data: any) {
    const [payment] = await db.insert(milestonePayments).values(data).returning();
    return payment;
  }

  async releaseMilestonePayment(paymentId: number) {
    const [payment] = await db.update(milestonePayments)
      .set({ status: 'released', releasedAt: new Date() })
      .where(eq(milestonePayments.id, paymentId))
      .returning();
    return payment;
  }

  // Inventory alerts for low stock notifications
  async getInventoryAlerts(vendorId: number): Promise<any[]> {
    return await db.select()
      .from(inventoryAlerts)
      .where(eq(inventoryAlerts.vendorId, vendorId))
      .orderBy(desc(inventoryAlerts.createdAt));
  }

  async createInventoryAlert(alertData: any): Promise<any> {
    const [alert] = await db.insert(inventoryAlerts).values(alertData).returning();
    return alert;
  }

  async markInventoryAlertRead(alertId: number): Promise<void> {
    await db.update(inventoryAlerts)
      .set({ isRead: true })
      .where(eq(inventoryAlerts.id, alertId));
  }

  // Vendor applications
  async createVendorApplication(applicationData: any): Promise<any> {
    // Create a pending vendor application record
    const application = {
      ...applicationData,
      status: 'pending',
      createdAt: new Date(),
    };

    // This would insert into a vendor_applications table
    // For now, return mock data
    return { id: Math.random().toString(36).substr(2, 9), ...application };
  }

  async getPendingVendorApplications(): Promise<any[]> {
    // This would query pending vendor applications
    // Return mock data for now
    return [
      {
        id: 1,
        companyName: 'New Solar Co',
        email: 'contact@newsolar.com',
        status: 'pending',
        createdAt: new Date(),
        customFields: {
          business_type: 'Solar Installer',
          years_in_business: 5,
          certifications: ['NABCEP Certified', 'State Licensed']
        }
      }
    ];
  }

  async approveVendorApplication(applicationId: string): Promise<void> {
    // This would approve the vendor application and create vendor record
    console.log(`Approving vendor application ${applicationId}`);
  }

  async rejectVendorApplication(applicationId: string, reason: string): Promise<void> {
    // This would reject the vendor application
    console.log(`Rejecting vendor application ${applicationId}: ${reason}`);
  }

  // Product operations by vendor
  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.vendorId, vendorId));
  }
}

export const storage = new DatabaseStorage();