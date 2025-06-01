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
  milestonePayments,
  refundRequests,
  refundMessages,
  vendorGroups,
  vendorGroupMemberships,
  groupTransferRules,
  vendorStaff,
  vendorPayouts,
  vendorWithdrawals,
  vendorCoupons,
  vendorBadges,
  vendorBadgeAssignments,
  vendorVerificationDocuments,
  vendorVerificationRequirements,
  abuseReports,
  vendorStorePolicies,
  storeReviews,
  reviewHelpfulVotes,
  adminAnnouncements,
  announcementReadStatus,
  storeSupportTickets,
  supportTicketMessages,
  vendorEmailPreferences,
  verificationLogs
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

  // Refund request methods
  createRefundRequest(data: any): Promise<any>;
  getRefundRequests(filters?: { vendorId?: number; status?: string }): Promise<any[]>;
  updateRefundRequest(id: number, data: Partial<any>): Promise<any>;
  addRefundMessage(data: any): Promise<any>;
  getRefundMessages(refundRequestId: number): Promise<any[]>;

  // Vendor groups methods
  createVendorGroup(data: any): Promise<any>;
  getVendorGroups(): Promise<any[]>;
  updateVendorGroup(id: number, data: Partial<any>): Promise<any>;
  assignVendorToGroup(vendorId: number, groupId: number): Promise<any>;
  removeVendorFromGroup(vendorId: number, groupId: number): Promise<any>;

  // Group transfer rules
  createGroupTransferRule(data: any): Promise<any>;
  getGroupTransferRules(): Promise<any[]>;
  processGroupTransfers(): Promise<any>;

  // Vendor staff methods
  inviteVendorStaff(data: any): Promise<any>;
  getVendorStaff(vendorId: number): Promise<any[]>;
  updateVendorStaffPermissions(staffId: number, permissions: any): Promise<any>;
  removeVendorStaff(staffId: number): Promise<any>;

  // Payout methods
  createVendorPayout(data: any): Promise<any>;
  getVendorPayouts(vendorId: number): Promise<any[]>;
  processVendorPayout(payoutId: number): Promise<any>;
  getVendorBalance(vendorId: number): Promise<number>;

  // Withdrawal methods
  createVendorWithdrawal(data: any): Promise<any>;
  getVendorWithdrawals(filters?: { vendorId?: number; status?: string }): Promise<any[]>;
  updateWithdrawalStatus(withdrawalId: number, status: string, adminNotes?: string): Promise<any>;

  // Coupon methods
  createVendorCoupon(data: any): Promise<any>;
  getVendorCoupons(vendorId: number): Promise<any[]>;
  updateVendorCoupon(couponId: number, data: Partial<any>): Promise<any>;
  validateCoupon(code: string, vendorId: number, orderAmount: number): Promise<any>;

  // Badge methods
  createVendorBadge(data: any): Promise<any>;
  getVendorBadges(): Promise<any[]>;
  assignBadgeToVendor(vendorId: number, badgeId: number, awardedBy?: number): Promise<any>;
  getVendorBadgeAssignments(vendorId: number): Promise<any[]>;
  processBadgeAssignments(): Promise<any>;

  // Vendor verification methods
  createVerificationDocument(data: any): Promise<any>;
  getVendorVerificationDocuments(vendorId: number): Promise<any[]>;
  updateVerificationDocument(documentId: number, data: any): Promise<any>;
  getVerificationRequirements(groupId?: number): Promise<any[]>;
  createVerificationRequirement(data: any): Promise<any>;
  logVerificationAction(data: any): Promise<any>;

  // Abuse report methods
  createAbuseReport(data: any): Promise<any>;
  getAbuseReports(filters?: any): Promise<any[]>;
  updateAbuseReport(reportId: number, data: any): Promise<any>;

  // Store policy methods
  createStorePolicy(data: any): Promise<any>;
  getStorePolicies(vendorId: number): Promise<any[]>;
  updateStorePolicy(policyId: number, data: any): Promise<any>;
  deleteStorePolicy(policyId: number): Promise<any>;

  // Store review methods
  createStoreReview(data: any): Promise<any>;
  getStoreReviews(vendorId: number, filters?: any): Promise<any[]>;
  updateStoreReview(reviewId: number, data: any): Promise<any>;
  reportStoreReview(reviewId: number, reportData: any): Promise<any>;
  addVendorReply(reviewId: number, reply: string): Promise<any>;
  voteReviewHelpful(reviewId: number, userId: number, isHelpful: boolean): Promise<any>;

  // Announcement methods
  createAnnouncement(data: any): Promise<any>;
  getAnnouncements(userId?: number, userRole?: string): Promise<any[]>;
  markAnnouncementRead(announcementId: number, userId: number): Promise<any>;
  updateAnnouncement(announcementId: number, data: any): Promise<any>;

  // Support ticket methods
  createSupportTicket(data: any): Promise<any>;
  getSupportTickets(filters?: any): Promise<any[]>;
  getSupportTicket(ticketId: number): Promise<any>;
  updateSupportTicket(ticketId: number, data: any): Promise<any>;
  addSupportMessage(data: any): Promise<any>;
  getSupportMessages(ticketId: number): Promise<any[]>;

  // Email preferences
  getVendorEmailPreferences(vendorId: number): Promise<any>;
  updateVendorEmailPreferences(vendorId: number, preferences: any): Promise<any>;

  // Product operations by vendor
  // Product operations
  getOrdersByParentId(parentOrderId: string): Promise<Order[]>;
  getParentOrderSummary(parentOrderId: string): Promise<any>;
  getOrderAnalytics(filters?: { excludeParentOrders?: boolean }): Promise<any>;
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

  // Multi-vendor order support
  async getOrdersByParentId(parentOrderId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(sql`notes LIKE '%${parentOrderId}%'`)
      .orderBy(desc(orders.createdAt));
  }

  async getParentOrderSummary(parentOrderId: string) {
    const subOrders = await this.getOrdersByParentId(parentOrderId);

    const summary = {
      parentOrderId,
      totalSubOrders: subOrders.length,
      totalAmount: subOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      overallStatus: this.calculateOverallStatus(subOrders),
      subOrders: subOrders.map(order => ({
        id: order.id,
        vendorId: order.vendorId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    };

    return summary;
  }

  private calculateOverallStatus(subOrders: Order[]): string {
    if (subOrders.length === 0) return 'unknown';

    const statuses = subOrders.map(order => order.status);

    if (statuses.every(status => status === 'completed')) return 'completed';
    if (statuses.every(status => status === 'cancelled')) return 'cancelled';
    if (statuses.some(status => status === 'cancelled')) return 'partially_cancelled';
    if (statuses.some(status => status === 'installing' || status === 'paid')) return 'in_progress';
    if (statuses.every(status => status === 'pending')) return 'pending';

    return 'mixed';
  }

  // Enhanced order analytics (excluding parent orders)
  async getOrderAnalytics(filters?: { excludeParentOrders?: boolean }) {
    let query = db.select().from(orders);

    if (filters?.excludeParentOrders) {
      // Exclude orders that are parent orders (orders with no actual products)
      query = query.where(sql`notes NOT LIKE 'Parent order%'`);
    }

    const orders = await query;

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) / orders.length : 0,
      statusBreakdown: this.getStatusBreakdown(orders)
    };
  }

  private getStatusBreakdown(orders: Order[]) {
    const breakdown: { [key: string]: number } = {};
    orders.forEach(order => {
      breakdown[order.status] = (breakdown[order.status] || 0) + 1;
    });
    return breakdown;
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

  // Product import/export methods
  async getProductsByVendor(vendorId: number) {
    return await db.select().from(products).where(eq(products.vendorId, vendorId));
  }

  // Vendor application methods
  async createVendorApplication(data: any) {
    // For now, create a pending vendor record
    const [application] = await db.insert(vendors)
      .values({
        userId: data.userId,
        companyName: data.companyName,
        description: data.description,
        website: data.website,
        verified: false
      })
      .returning();
    return application;
  }

  async getPendingVendorApplications() {
    return await db.select({
      id: vendors.id,
      companyName: vendors.companyName,
      description: vendors.description,
      website: vendors.website,
      verified: vendors.verified,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: vendors.createdAt
    })
    .from(vendors)
    .innerJoin(users, eq(vendors.userId, users.id))
    .where(eq(vendors.verified, false));
  }

  async approveVendorApplication(vendorId: string) {
    const [vendor] = await db.update(vendors)
      .set({ verified: true })
      .where(eq(vendors.id, parseInt(vendorId)))
      .returning();
    return vendor;
  }

  async rejectVendorApplication(vendorId: string, reason: string) {
    // In a real implementation, you might want to store rejection reasons
    await db.delete(vendors).where(eq(vendors.id, parseInt(vendorId)));
  }

  // Vendor group methods
  async createVendorGroup(data: any) {
    const [group] = await db.insert(vendorGroups).values(data).returning();
    return group;
  }

  async getVendorGroups() {
    return await db.select().from(vendorGroups);
  }

  async assignVendorToGroup(vendorId: number, groupId: number) {
    const [membership] = await db.insert(vendorGroupMemberships)
      .values({ vendorId, groupId })
      .returning();
    return membership;
  }

  // Vendor staff methods
  async inviteVendorStaff(data: any) {
    const [staff] = await db.insert(vendorStaff).values(data).returning();
    return staff;
  }

  async getVendorStaff(vendorId: number) {
    return await db.select({
      id: vendorStaff.id,
      role: vendorStaff.role,
      permissions: vendorStaff.permissions,
      isActive: vendorStaff.isActive,
      invitedAt: vendorStaff.invitedAt,
      joinedAt: vendorStaff.joinedAt,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName
    })
    .from(vendorStaff)
    .innerJoin(users, eq(vendorStaff.userId, users.id))
    .where(eq(vendorStaff.vendorId, vendorId));
  }

  // Vendor payout methods
  async getVendorPayouts(vendorId: number) {
    return await db.select().from(vendorPayouts).where(eq(vendorPayouts.vendorId, vendorId));
  }

  async getVendorBalance(vendorId: number): Promise<number> {
    const [result] = await db.select({
      balance: sql<number>`COALESCE(SUM(CASE WHEN type IN ('commission', 'bonus') THEN amount ELSE -amount END), 0)`
    })
    .from(vendorPayouts)
    .where(eq(vendorPayouts.vendorId, vendorId));
    
    return result?.balance || 0;
  }

  // Vendor withdrawal methods
  async createVendorWithdrawal(data: any) {
    const [withdrawal] = await db.insert(vendorWithdrawals).values(data).returning();
    return withdrawal;
  }

  async getVendorWithdrawals(filters: any) {
    let query = db.select().from(vendorWithdrawals);
    
    if (filters.vendorId) {
      query = query.where(eq(vendorWithdrawals.vendorId, filters.vendorId));
    }
    
    return await query;
  }

  // Vendor coupon methods
  async createVendorCoupon(data: any) {
    const [coupon] = await db.insert(vendorCoupons).values(data).returning();
    return coupon;
  }

  async getVendorCoupons(vendorId: number) {
    return await db.select().from(vendorCoupons).where(eq(vendorCoupons.vendorId, vendorId));
  }

  // Vendor badge methods
  async createVendorBadge(data: any) {
    const [badge] = await db.insert(vendorBadges).values(data).returning();
    return badge;
  }

  async getVendorBadgeAssignments(vendorId: number) {
    return await db.select({
      id: vendorBadgeAssignments.id,
      awardedAt: vendorBadgeAssignments.awardedAt,
      expiresAt: vendorBadgeAssignments.expiresAt,
      badge: {
        id: vendorBadges.id,
        name: vendorBadges.name,
        description: vendorBadges.description,
        icon: vendorBadges.icon,
        color: vendorBadges.color
      }
    })
    .from(vendorBadgeAssignments)
    .innerJoin(vendorBadges, eq(vendorBadgeAssignments.badgeId, vendorBadges.id))
    .where(eq(vendorBadgeAssignments.vendorId, vendorId));
  }

  async assignBadgeToVendor(vendorId: number, badgeId: number, awardedBy: number) {
    const [assignment] = await db.insert(vendorBadgeAssignments)
      .values({ vendorId, badgeId, awardedBy })
      .returning();
    return assignment;
  }

  // Verification document methods
  async getVendorVerificationDocuments(vendorId: number) {
    if (vendorId === 0) {
      // Admin view - get all documents
      return await db.select({
        id: vendorVerificationDocuments.id,
        documentType: vendorVerificationDocuments.documentType,
        documentName: vendorVerificationDocuments.documentName,
        status: vendorVerificationDocuments.status,
        submittedAt: vendorVerificationDocuments.submittedAt,
        reviewedAt: vendorVerificationDocuments.reviewedAt,
        vendor: {
          id: vendors.id,
          companyName: vendors.companyName
        }
      })
      .from(vendorVerificationDocuments)
      .innerJoin(vendors, eq(vendorVerificationDocuments.vendorId, vendors.id));
    }
    
    return await db.select()
      .from(vendorVerificationDocuments)
      .where(eq(vendorVerificationDocuments.vendorId, vendorId));
  }

  async getVerificationRequirements() {
    return await db.select().from(vendorVerificationRequirements);
  }

  async createVerificationDocument(data: any) {
    const [document] = await db.insert(vendorVerificationDocuments).values(data).returning();
    return document;
  }

  async updateVerificationDocument(documentId: number, data: any) {
    const [document] = await db.update(vendorVerificationDocuments)
      .set({ ...data, reviewedAt: new Date() })
      .where(eq(vendorVerificationDocuments.id, documentId))
      .returning();
    return document;
  }

  // Abuse report methods
  async createAbuseReport(data: any) {
    const [report] = await db.insert(abuseReports).values(data).returning();
    return report;
  }

  async getAbuseReports(filters: any) {
    let query = db.select().from(abuseReports);
    
    if (filters.status) {
      query = query.where(eq(abuseReports.status, filters.status));
    }
    
    return await query;
  }

  async updateAbuseReport(reportId: number, data: any) {
    const [report] = await db.update(abuseReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(abuseReports.id, reportId))
      .returning();
    return report;
  }

  // Store policy methods
  async getStorePolicies(vendorId: number) {
    return await db.select().from(vendorStorePolicies).where(eq(vendorStorePolicies.vendorId, vendorId));
  }

  async createStorePolicy(data: any) {
    const [policy] = await db.insert(vendorStorePolicies).values(data).returning();
    return policy;
  }

  async updateStorePolicy(policyId: number, data: any) {
    const [policy] = await db.update(vendorStorePolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendorStorePolicies.id, policyId))
      .returning();
    return policy;
  }

  async deleteStorePolicy(policyId: number) {
    await db.delete(vendorStorePolicies).where(eq(vendorStorePolicies.id, policyId));
  }

  // Store review methods
  async getStoreReviews(vendorId: number, options: any = {}) {
    let query = db.select({
      id: storeReviews.id,
      rating: storeReviews.rating,
      title: storeReviews.title,
      comment: storeReviews.comment,
      serviceRating: storeReviews.serviceRating,
      communicationRating: storeReviews.communicationRating,
      deliveryRating: storeReviews.deliveryRating,
      vendorReply: storeReviews.vendorReply,
      vendorRepliedAt: storeReviews.vendorRepliedAt,
      isVerifiedPurchase: storeReviews.isVerifiedPurchase,
      helpfulVotes: storeReviews.helpfulVotes,
      createdAt: storeReviews.createdAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(storeReviews)
    .innerJoin(users, eq(storeReviews.userId, users.id))
    .where(eq(storeReviews.vendorId, vendorId));

    if (options.hideReported) {
      query = query.where(eq(storeReviews.isReported, false));
    }

    return await query;
  }

  async createStoreReview(data: any) {
    const [review] = await db.insert(storeReviews).values(data).returning();
    return review;
  }

  async reportStoreReview(reviewId: number, data: any) {
    const [review] = await db.update(storeReviews)
      .set({
        isReported: true,
        reportReason: data.reason,
        reportedAt: new Date(),
        reportedBy: data.reportedBy
      })
      .where(eq(storeReviews.id, reviewId))
      .returning();
    return review;
  }

  async addVendorReply(reviewId: number, reply: string) {
    const [review] = await db.update(storeReviews)
      .set({
        vendorReply: reply,
        vendorRepliedAt: new Date()
      })
      .where(eq(storeReviews.id, reviewId))
      .returning();
    return review;
  }

  async voteReviewHelpful(reviewId: number, userId: number, isHelpful: boolean) {
    // Check if user already voted
    const existingVote = await db.select()
      .from(reviewHelpfulVotes)
      .where(and(
        eq(reviewHelpfulVotes.reviewId, reviewId),
        eq(reviewHelpfulVotes.userId, userId)
      ));

    if (existingVote.length === 0) {
      await db.insert(reviewHelpfulVotes).values({
        reviewId,
        userId,
        isHelpful
      });

      // Update helpful votes count
      const [review] = await db.update(storeReviews)
        .set({
          helpfulVotes: sql`${storeReviews.helpfulVotes} + ${isHelpful ? 1 : 0}`
        })
        .where(eq(storeReviews.id, reviewId))
        .returning();

      return review?.helpfulVotes || 0;
    }

    return 0;
  }

  // Announcement methods
  async getAnnouncements(userId: number, userRole: string) {
    return await db.select({
      id: adminAnnouncements.id,
      title: adminAnnouncements.title,
      content: adminAnnouncements.content,
      type: adminAnnouncements.type,
      publishedAt: adminAnnouncements.publishedAt,
      expiresAt: adminAnnouncements.expiresAt,
      isRead: sql<boolean>`CASE WHEN ${announcementReadStatus.id} IS NOT NULL THEN true ELSE false END`
    })
    .from(adminAnnouncements)
    .leftJoin(announcementReadStatus, and(
      eq(announcementReadStatus.announcementId, adminAnnouncements.id),
      eq(announcementReadStatus.userId, userId)
    ))
    .where(and(
      eq(adminAnnouncements.isActive, true),
      or(
        sql`${adminAnnouncements.publishedAt} IS NULL`,
        sql`${adminAnnouncements.publishedAt} <= NOW()`
      ),
      or(
        sql`${adminAnnouncements.expiresAt} IS NULL`,
        sql`${adminAnnouncements.expiresAt} > NOW()`
      )
    ));
  }

  async createAnnouncement(data: any) {
    const [announcement] = await db.insert(adminAnnouncements).values(data).returning();
    return announcement;
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

  // Refund request methods
  async createRefundRequest(data: any) {
    const [refundRequest] = await db.insert(refundRequests).values(data).returning();
    return refundRequest;
  }

  async getRefundRequests(filters?: { vendorId?: number; status?: string }) {
    let query = db.select({
      id: refundRequests.id,
      orderId: refundRequests.orderId,
      amount: refundRequests.amount,
      reason: refundRequests.reason,
      status: refundRequests.status,
      adminResponse: refundRequests.adminResponse,
      vendorResponse: refundRequests.vendorResponse,
      createdAt: refundRequests.createdAt,
      requesterName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      vendorName: vendors.companyName,
    })
    .from(refundRequests)
    .leftJoin(users, eq(refundRequests.requesterId, users.id))
    .leftJoin(vendors, eq(refundRequests.vendorId, vendors.id));

    const conditions = [];
    if (filters?.vendorId) {
      conditions.push(eq(refundRequests.vendorId, filters.vendorId));
    }
    if (filters?.status) {
      conditions.push(eq(refundRequests.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(refundRequests.createdAt));
  }

  async updateRefundRequest(id: number, data: Partial<any>) {
    const [updatedRequest] = await db.update(refundRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(refundRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async addRefundMessage(data: any) {
    const [message] = await db.insert(refundMessages).values(data).returning();
    return message;
  }

  async getRefundMessages(refundRequestId: number) {
    return await db.select({
      id: refundMessages.id,
      message: refundMessages.message,
      attachments: refundMessages.attachments,
      createdAt: refundMessages.createdAt,
      senderName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      senderRole: users.role,
    })
    .from(refundMessages)
    .leftJoin(users, eq(refundMessages.senderId, users.id))
    .where(eq(refundMessages.refundRequestId, refundRequestId))
    .orderBy(refundMessages.createdAt);
  }

  // Vendor groups methods
  async createVendorGroup(data: any) {
    const [group] = await db.insert(vendorGroups).values(data).returning();
    return group;
  }

  async getVendorGroups() {
    return await db.select().from(vendorGroups).orderBy(vendorGroups.name);
  }

  async updateVendorGroup(id: number, data: Partial<any>) {
    const [group] = await db.update(vendorGroups)
      .set(data)
      .where(eq(vendorGroups.id, id))
      .returning();
    return group;
  }

  async assignVendorToGroup(vendorId: number, groupId: number) {
    // Remove existing memberships first
    await db.delete(vendorGroupMemberships).where(eq(vendorGroupMemberships.vendorId, vendorId));

    // Add new membership
    const [membership] = await db.insert(vendorGroupMemberships)
      .values({ vendorId, groupId })
      .returning();
    return membership;
  }

  async removeVendorFromGroup(vendorId: number, groupId: number) {
    await db.delete(vendorGroupMemberships)
      .where(and(
        eq(vendorGroupMemberships.vendorId, vendorId),
        eq(vendorGroupMemberships.groupId, groupId)
      ));
  }

  // Group transfer rules
  async createGroupTransferRule(data: any) {
    const [rule] = await db.insert(groupTransferRules).values(data).returning();
    return rule;
  }

  async getGroupTransferRules() {
    return await db.select().from(groupTransferRules).where(eq(groupTransferRules.isActive, true));
  }

  async processGroupTransfers() {
    // Implementation for processing automatic group transfers based on rules
    const rules = await this.getGroupTransferRules();
    const processedTransfers = [];

    for (const rule of rules) {
      // This would contain logic to check vendors against the rule conditions
      // and move them to appropriate groups
    }

    return processedTransfers;
  }

  // Vendor staff methods
  async inviteVendorStaff(data: any) {
    const [staff] = await db.insert(vendorStaff).values(data).returning();
    return staff;
  }

  async getVendorStaff(vendorId: number) {
    return await db.select({
      id: vendorStaff.id,
      role: vendorStaff.role,
      permissions: vendorStaff.permissions,
      isActive: vendorStaff.isActive,
      invitedAt: vendorStaff.invitedAt,
      joinedAt: vendorStaff.joinedAt,
      userName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      userEmail: users.email,
    })
    .from(vendorStaff)
    .leftJoin(users, eq(vendorStaff.userId, users.id))
    .where(eq(vendorStaff.vendorId, vendorId));
  }

  async updateVendorStaffPermissions(staffId: number, permissions: any) {
    const [staff] = await db.update(vendorStaff)
      .set({ permissions })
      .where(eq(vendorStaff.id, staffId))
      .returning();
    return staff;
  }

  async removeVendorStaff(staffId: number) {
    await db.delete(vendorStaff).where(eq(vendorStaff.id, staffId));
  }

  // Payout methods
  async createVendorPayout(data: any) {
    const [payout] = await db.insert(vendorPayouts).values(data).returning();
    return payout;
  }

  async getVendorPayouts(vendorId: number) {
    return await db.select()
      .from(vendorPayouts)
      .where(eq(vendorPayouts.vendorId, vendorId))
      .orderBy(desc(vendorPayouts.createdAt));
  }

  async processVendorPayout(payoutId: number) {
    const [payout] = await db.update(vendorPayouts)
      .set({ status: 'completed', processedAt: new Date() })
      .where(eq(vendorPayouts.id, payoutId))
      .returning();
    return payout;
  }

  async getVendorBalance(vendorId: number) {
    const [result] = await db
      .select({
        balance: sql<number>`COALESCE(SUM(CASE WHEN type IN ('commission', 'bonus') THEN amount ELSE -amount END), 0)`
      })
      .from(vendorPayouts)
      .where(eq(vendorPayouts.vendorId, vendorId));

    return result?.balance || 0;
  }

  // Withdrawal methods
  async createVendorWithdrawal(data: any) {
    const [withdrawal] = await db.insert(vendorWithdrawals).values(data).returning();
    return withdrawal;
  }

  async getVendorWithdrawals(filters?: { vendorId?: number; status?: string }) {
    let query = db.select().from(vendorWithdrawals);

    const conditions = [];
    if (filters?.vendorId) {
      conditions.push(eq(vendorWithdrawals.vendorId, filters.vendorId));
    }
    if (filters?.status) {
      conditions.push(eq(vendorWithdrawals.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(vendorWithdrawals.createdAt));
  }

  async updateWithdrawalStatus(withdrawalId: number, status: string, adminNotes?: string) {
    const [withdrawal] = await db.update(vendorWithdrawals)
      .set({ 
        status: status as any, 
        adminNotes, 
        processedAt: status === 'processed' ? new Date() : undefined 
      })
      .where(eq(vendorWithdrawals.id, withdrawalId))
      .returning();
    return withdrawal;
  }

  // Coupon methods
  async createVendorCoupon(data: any) {
    const [coupon] = await db.insert(vendorCoupons).values(data).returning();
    return coupon;
  }

  async getVendorCoupons(vendorId: number) {
    return await db.select()
      .from(vendorCoupons)
      .where(eq(vendorCoupons.vendorId, vendorId))
      .orderBy(desc(vendorCoupons.createdAt));
  }

  async updateVendorCoupon(couponId: number, data: Partial<any>) {
    const [coupon] = await db.update(vendorCoupons)
      .set(data)
      .where(eq(vendorCoupons.id, couponId))
      .returning();
    return coupon;
  }

  async validateCoupon(code: string, vendorId: number, orderAmount: number) {
    const [coupon] = await db.select()
      .from(vendorCoupons)
      .where(and(
        eq(vendorCoupons.code, code),
        eq(vendorCoupons.vendorId, vendorId),
        eq(vendorCoupons.isActive, true)
      ));

    if (!coupon) return null;

    // Check expiration
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return null;

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return null;

    // Check minimum amount
    if (coupon.minimumAmount && orderAmount < parseFloat(coupon.minimumAmount)) return null;

    return coupon;
  }

  // Badge methods
  async createVendorBadge(data: any) {
    const [badge] = await db.insert(vendorBadges).values(data).returning();
    return badge;
  }

  async getVendorBadges() {
    return await db.select().from(vendorBadges).where(eq(vendorBadges.isActive, true));
  }

  async assignBadgeToVendor(vendorId: number, badgeId: number, awardedBy?: number) {
    const [assignment] = await db.insert(vendorBadgeAssignments)
      .values({ vendorId, badgeId, awardedBy })
      .returning();
    return assignment;
  }

  async getVendorBadgeAssignments(vendorId: number) {
    return await db.select({
      id: vendorBadgeAssignments.id,
      badgeId: vendorBadgeAssignments.badgeId,
      awardedAt: vendorBadgeAssignments.awardedAt,
      expiresAt: vendorBadgeAssignments.expiresAt,
      badgeName: vendorBadges.name,
      badgeDescription: vendorBadges.description,
      badgeIcon: vendorBadges.icon,
      badgeColor: vendorBadges.color,
    })
    .from(vendorBadgeAssignments)
    .leftJoin(vendorBadges, eq(vendorBadgeAssignments.badgeId, vendorBadges.id))
    .where(eq(vendorBadgeAssignments.vendorId, vendorId));
  }

  async processBadgeAssignments() {
    // Implementation for processing automatic badge assignments
    const badges = await this.getVendorBadges();
    const processedAssignments = [];

    for (const badge of badges) {
      if (badge.conditionType !== 'manual') {
        // Process automatic badge assignments based on conditions
      }
    }

    return processedAssignments;
  }

  // Vendor verification methods
  async createVerificationDocument(data: any) {
    const [document] = await db.insert(vendorVerificationDocuments).values(data).returning();

    // Log the submission
    await this.logVerificationAction({
      documentId: document.id,
      actionType: 'submitted',
      performedBy: data.vendorId,
      notes: 'Document submitted for verification',
      newStatus: 'pending'
    });

    return document;
  }

  async getVendorVerificationDocuments(vendorId: number) {
    return await db.select({
      id: vendorVerificationDocuments.id,
      documentType: vendorVerificationDocuments.documentType,
      documentName: vendorVerificationDocuments.documentName,
      documentUrl: vendorVerificationDocuments.documentUrl,
      status: vendorVerificationDocuments.status,
      reviewNotes: vendorVerificationDocuments.reviewNotes,
      submittedAt: vendorVerificationDocuments.submittedAt,
      reviewedAt: vendorVerificationDocuments.reviewedAt,
      expiresAt: vendorVerificationDocuments.expiresAt,
      reviewerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
    })
    .from(vendorVerificationDocuments)
    .leftJoin(users, eq(vendorVerificationDocuments.reviewedBy, users.id))
    .where(eq(vendorVerificationDocuments.vendorId, vendorId))
    .orderBy(desc(vendorVerificationDocuments.submittedAt));
  }

  async updateVerificationDocument(documentId: number, data: any) {
    const [oldDoc] = await db.select().from(vendorVerificationDocuments).where(eq(vendorVerificationDocuments.id, documentId));

    const [updatedDoc] = await db.update(vendorVerificationDocuments)
      .set({ ...data, reviewedAt: new Date() })
      .where(eq(vendorVerificationDocuments.id, documentId))
      .returning();

    // Log the action
    if (data.status && oldDoc.status !== data.status) {
      await this.logVerificationAction({
        documentId,
        actionType: data.status,
        performedBy: data.reviewedBy,
        notes: data.reviewNotes,
        oldStatus: oldDoc.status,
        newStatus: data.status
      });
    }

    return updatedDoc;
  }

  async getVerificationRequirements(groupId?: number) {
    let query = db.select().from(vendorVerificationRequirements);

    if (groupId) {
      query = query.where(eq(vendorVerificationRequirements.groupId, groupId));
    }

    return await query.orderBy(vendorVerificationRequirements.documentType);
  }

  async createVerificationRequirement(data: any) {
    const [requirement] = await db.insert(vendorVerificationRequirements).values(data).returning();
    return requirement;
  }

  async logVerificationAction(data: any) {
    const [log] = await db.insert(verificationLogs).values(data).returning();
    return log;
  }

  // Abuse report methods
  async createAbuseReport(data: any) {
    const [report] = await db.insert(abuseReports).values(data).returning();
    return report;
  }

  async getAbuseReports(filters?: any) {
    let query = db.select({
      id: abuseReports.id,
      reportType: abuseReports.reportType,
      targetId: abuseReports.targetId,
      targetType: abuseReports.targetType,
      category: abuseReports.category,
      description: abuseReports.description,
      status: abuseReports.status,
      priority: abuseReports.priority,
      adminNotes: abuseReports.adminNotes,
      resolution: abuseReports.resolution,
      createdAt: abuseReports.createdAt,
      reporterName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      reviewerName: sql<string>`${reviewerUser.firstName} || ' ' || ${reviewerUser.lastName}`,
    })
    .from(abuseReports)
    .leftJoin(users, eq(abuseReports.reporterId, users.id))
    .leftJoin(users.as('reviewer'), eq(abuseReports.reviewedBy, users.id));

    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(abuseReports.status, filters.status));
    }
    if (filters?.reportType) {
      conditions.push(eq(abuseReports.reportType, filters.reportType));
    }
    if (filters?.priority) {
      conditions.push(eq(abuseReports.priority, filters.priority));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(abuseReports.createdAt));
  }

  async updateAbuseReport(reportId: number, data: any) {
    const [report] = await db.update(abuseReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(abuseReports.id, reportId))
      .returning();
    return report;
  }

  // Store policy methods
  async createStorePolicy(data: any) {
    const [policy] = await db.insert(vendorStorePolicies).values(data).returning();
    return policy;
  }

  async getStorePolicies(vendorId: number) {
    return await db.select()
      .from(vendorStorePolicies)
      .where(and(
        eq(vendorStorePolicies.vendorId, vendorId),
        eq(vendorStorePolicies.isActive, true)
      ))
      .orderBy(vendorStorePolicies.displayOrder, vendorStorePolicies.policyType);
  }

  async updateStorePolicy(policyId: number, data: any) {
    const [policy] = await db.update(vendorStorePolicies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(vendorStorePolicies.id, policyId))
      .returning();
    return policy;
  }

  async deleteStorePolicy(policyId: number) {
    await db.delete(vendorStorePolicies).where(eq(vendorStorePolicies.id, policyId));
  }

  // Store review methods
  async createStoreReview(data: any) {
    const [review] = await db.insert(storeReviews).values(data).returning();
    return review;
  }

  async getStoreReviews(vendorId: number, filters?: any) {
    let query = db.select({
      id: storeReviews.id,
      rating: storeReviews.rating,
      title: storeReviews.title,
      comment: storeReviews.comment,
      serviceRating: storeReviews.serviceRating,
      communicationRating: storeReviews.communicationRating,
      deliveryRating: storeReviews.deliveryRating,
      vendorReply: storeReviews.vendorReply,
      vendorRepliedAt: storeReviews.vendorRepliedAt,
      isVerifiedPurchase: storeReviews.isVerifiedPurchase,
      isReported: storeReviews.isReported,
      isHidden: storeReviews.isHidden,
      helpfulVotes: storeReviews.helpfulVotes,
      createdAt: storeReviews.createdAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      orderId: storeReviews.orderId,
    })
    .from(storeReviews)
    .leftJoin(users, eq(storeReviews.userId, users.id))
    .where(eq(storeReviews.vendorId, vendorId));

    if (filters?.hideReported) {
      query = query.where(and(
        eq(storeReviews.vendorId, vendorId),
        eq(storeReviews.isHidden, false)
      ));
    }

    return await query.orderBy(desc(storeReviews.createdAt));
  }

  async updateStoreReview(reviewId: number, data: any) {
    const [review] = await db.update(storeReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(storeReviews.id, reviewId))
      .returning();
    return review;
  }

  async reportStoreReview(reviewId: number, reportData: any) {
    const [review] = await db.update(storeReviews)
      .set({
        isReported: true,
        reportReason: reportData.reason,
        reportedAt: new Date(),
        reportedBy: reportData.reportedBy,
        updatedAt: new Date()
      })
      .where(eq(storeReviews.id, reviewId))
      .returning();
    return review;
  }

  async addVendorReply(reviewId: number, reply: string) {
    const [review] = await db.update(storeReviews)
      .set({
        vendorReply: reply,
        vendorRepliedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(storeReviews.id, reviewId))
      .returning();
    return review;
  }

  async voteReviewHelpful(reviewId: number, userId: number, isHelpful: boolean) {
    // Check if user already voted
    const [existingVote] = await db.select()
      .from(reviewHelpfulVotes)
      .where(and(
        eq(reviewHelpfulVotes.reviewId, reviewId),
        eq(reviewHelpfulVotes.userId, userId)
      ));

    if (existingVote) {
      // Update existing vote
      await db.update(reviewHelpfulVotes)
        .set({ isHelpful })
        .where(eq(reviewHelpfulVotes.id, existingVote.id));
    } else {
      // Create new vote
      await db.insert(reviewHelpfulVotes).values({
        reviewId,
        userId,
        isHelpful
      });
    }

    // Update helpful vote count on review
    const [voteCount] = await db.select({
      count: sql<number>`COUNT(*)`
    })
    .from(reviewHelpfulVotes)
    .where(and(
      eq(reviewHelpfulVotes.reviewId, reviewId),
      eq(reviewHelpfulVotes.isHelpful, true)
    ));

    await db.update(storeReviews)
      .set({ helpfulVotes: voteCount.count })
      .where(eq(storeReviews.id, reviewId));

    return voteCount.count;
  }

  // Announcement methods
  async createAnnouncement(data: any) {
    const [announcement] = await db.insert(adminAnnouncements).values(data).returning();
    return announcement;
  }

  async getAnnouncements(userId?: number, userRole?: string) {
    let query = db.select({
      id: adminAnnouncements.id,
      title: adminAnnouncements.title,
      content: adminAnnouncements.content,
      type: adminAnnouncements.type,
      targetType: adminAnnouncements.targetType,
      publishedAt: adminAnnouncements.publishedAt,
      expiresAt: adminAnnouncements.expiresAt,
      createdAt: adminAnnouncements.createdAt,
      creatorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      isRead: sql<boolean>`${announcementReadStatus.id} IS NOT NULL`,
    })
    .from(adminAnnouncements)
    .leftJoin(users, eq(adminAnnouncements.createdBy, users.id))
    .leftJoin(announcementReadStatus, and(
      eq(announcementReadStatus.announcementId, adminAnnouncements.id),
      userId ? eq(announcementReadStatus.userId, userId) : sql`false`
    ))
    .where(and(
      eq(adminAnnouncements.isActive, true),
      or(
        sql`${adminAnnouncements.publishedAt} IS NULL`,
        sql`${adminAnnouncements.publishedAt} <= NOW()`
      ),
      or(
        sql`${adminAnnouncements.expiresAt} IS NULL`,
        sql`${adminAnnouncements.expiresAt} > NOW()`
      )
    ));

    return await query.orderBy(desc(adminAnnouncements.createdAt));
  }

  async markAnnouncementRead(announcementId: number, userId: number) {
    const [existing] = await db.select()
      .from(announcementReadStatus)
      .where(and(
        eq(announcementReadStatus.announcementId, announcementId),
        eq(announcementReadStatus.userId, userId)
      ));

    if (!existing) {
      await db.insert(announcementReadStatus).values({
        announcementId,
        userId
      });
    }
  }

  async updateAnnouncement(announcementId: number, data: any) {
    const [announcement] = await db.update(adminAnnouncements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(adminAnnouncements.id, announcementId))
      .returning();
    return announcement;
  }

  // Support ticket methods
  async createSupportTicket(data: any) {
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const [ticket] = await db.insert(storeSupportTickets)
      .values({ ...data, ticketNumber })
      .returning();
    return ticket;
  }

  async getSupportTickets(filters?: any) {
    let query = db.select({
      id: storeSupportTickets.id,
      ticketNumber: storeSupportTickets.ticketNumber,
      subject: storeSupportTickets.subject,
      category: storeSupportTickets.category,
      priority: storeSupportTickets.priority,
      status: storeSupportTickets.status,
      lastResponseBy: storeSupportTickets.lastResponseBy,
      lastResponseAt: storeSupportTickets.lastResponseAt,
      createdAt: storeSupportTickets.createdAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      vendorName: vendors.companyName,
      assignedToName: sql<string>`${assignedUser.firstName} || ' ' || ${assignedUser.lastName}`,
    })
    .from(storeSupportTickets)
    .leftJoin(users, eq(storeSupportTickets.customerId, users.id))
    .leftJoin(vendors, eq(storeSupportTickets.vendorId, vendors.id))
    .leftJoin(users.as('assignedUser'), eq(storeSupportTickets.assignedTo, users.id));

    const conditions = [];
    if (filters?.vendorId) {
      conditions.push(eq(storeSupportTickets.vendorId, filters.vendorId));
    }
    if (filters?.customerId) {
      conditions.push(eq(storeSupportTickets.customerId, filters.customerId));
    }
    if (filters?.status) {
      conditions.push(eq(storeSupportTickets.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(storeSupportTickets.priority, filters.priority));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(storeSupportTickets.createdAt));
  }

  async getSupportTicket(ticketId: number) {
    const [ticket] = await db.select({
      id: storeSupportTickets.id,
      ticketNumber: storeSupportTickets.ticketNumber,
      subject: storeSupportTickets.subject,
      description: storeSupportTickets.description,
      category: storeSupportTickets.category,
      priority: storeSupportTickets.priority,
      status: storeSupportTickets.status,
      orderId: storeSupportTickets.orderId,
      satisfactionRating: storeSupportTickets.satisfactionRating,
      satisfactionComment: storeSupportTickets.satisfactionComment,
      internalNotes: storeSupportTickets.internalNotes,
      createdAt: storeSupportTickets.createdAt,
      customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      customerEmail: users.email,
      vendorName: vendors.companyName,
      assignedToName: sql<string>`${assignedUser.firstName} || ' ' || ${assignedUser.lastName}`,
    })
    .from(storeSupportTickets)
    .leftJoin(users, eq(storeSupportTickets.customerId, users.id))
    .leftJoin(vendors, eq(storeSupportTickets.vendorId, vendors.id))
    .leftJoin(users.as('assignedUser'), eq(storeSupportTickets.assignedTo, users.id))
    .where(eq(storeSupportTickets.id, ticketId));

    return ticket;
  }

  async updateSupportTicket(ticketId: number, data: any) {
    const [ticket] = await db.update(storeSupportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(storeSupportTickets.id, ticketId))
      .returning();
    return ticket;
  }

  async addSupportMessage(data: any) {
    const [message] = await db.insert(supportTicketMessages).values(data).returning();

    // Update ticket's last response info
    await db.update(storeSupportTickets)
      .set({
        lastResponseBy: data.senderType,
        lastResponseAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(storeSupportTickets.id, data.ticketId));

    return message;
  }

  async getSupportMessages(ticketId: number) {
    return await db.select({
      id: supportTicketMessages.id,
      message: supportTicketMessages.message,
      attachments: supportTicketMessages.attachments,
      senderType: supportTicketMessages.senderType,
      isInternal: supportTicketMessages.isInternal,
      createdAt: supportTicketMessages.createdAt,
      senderName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
    })
    .from(supportTicketMessages)
    .leftJoin(users, eq(supportTicketMessages.senderId, users.id))
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt);
  }

  // Email preferences
  async getVendorEmailPreferences(vendorId: number) {
    const [preferences] = await db.select()
      .from(vendorEmailPreferences)
      .where(eq(vendorEmailPreferences.vendorId, vendorId));

    // Return default preferences if none exist
    if (!preferences) {
      return {
        vendorId,
        newOrders: true,
        orderUpdates: true,
        newReviews: true,
        supportTickets: true,
        announcements: true,
        payoutNotifications: true,
        inventoryAlerts: true,
        marketingEmails: false,
        weeklyReports: true,
        accountSecurity: true,
      };
    }

    return preferences;
  }

  async updateVendorEmailPreferences(vendorId: number, preferences: any) {
    const [existing] = await db.select()
      .from(vendorEmailPreferences)
      .where(eq(vendorEmailPreferences.vendorId, vendorId));

    if (existing) {
      const [updated] = await db.update(vendorEmailPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(vendorEmailPreferences.vendorId, vendorId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(vendorEmailPreferences)
        .values({ vendorId, ...preferences })
        .returning();
      return created;
    }
  }

  // Product operations by vendor
  async getProductsByVendor(vendorId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.vendorId, vendorId));
  }
}

export const storage = new DatabaseStorage();