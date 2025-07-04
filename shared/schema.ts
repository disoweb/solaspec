import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with custom authentication
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["buyer", "vendor", "installer", "admin"] }).default("buyer").notNull(),
  location: varchar("location"),
  phone: varchar("phone"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name").notNull(),
  businessLicense: varchar("business_license"),
  description: text("description"),
  website: varchar("website"),
  verified: boolean("verified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: varchar("capacity"), // e.g., "10kW"
  panelCount: integer("panel_count"),
  warranty: varchar("warranty"),
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }),
  type: varchar("type", { enum: ["residential", "commercial", "industrial"] }).notNull(),
  imageUrl: varchar("image_url"),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  stockQuantity: integer("stock_quantity").default(0),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  weight: decimal("weight", { precision: 8, scale: 2 }), // in kg
  dimensions: jsonb("dimensions"), // {length, width, height}
  sku: varchar("sku").unique(),
  locations: text("locations").array(), // Available locations
  category: varchar("category"),
  installmentPrice: decimal("installment_price", { precision: 10, scale: 2 }),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Installers table
export const installers = pgTable("installers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: varchar("company_name").notNull(),
  experience: integer("experience_years"),
  totalInstallations: integer("total_installations").default(0),
  certifications: text("certifications").array(),
  serviceAreas: text("service_areas").array(),
  availability: timestamp("next_available"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  productId: integer("product_id").notNull().references(() => products.id),
  installerId: integer("installer_id").references(() => installers.id),
  quantity: integer("quantity").default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: varchar("payment_type", { enum: ["full", "installment"] }).notNull(),
  installmentMonths: integer("installment_months"),
  installmentFeeRate: decimal("installment_fee_rate", { precision: 5, scale: 4 }), // 0.30 for 30%
  status: varchar("status", { 
    enum: ["pending", "paid", "escrow", "installing", "completed", "cancelled"] 
  }).default("pending").notNull(),
  shippingAddress: jsonb("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet transactions table
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { enum: ["deposit", "withdrawal", "payment", "refund", "escrow_hold", "escrow_release"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  installerId: integer("installer_id").references(() => installers.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table for product stock management
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").default(5),
  maxStockLevel: integer("max_stock_level").default(100),
  restockLevel: integer("restock_level").default(10),
  lastRestocked: timestamp("last_restocked"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory movements for tracking stock changes
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").notNull().references(() => inventory.id),
  type: varchar("type", { enum: ["restock", "sale", "adjustment", "reservation", "release"] }).notNull(),
  quantity: integer("quantity").notNull(),
  previousQuantity: integer("previous_quantity").notNull(),
  newQuantity: integer("new_quantity").notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Escrow accounts for secure payments
export const escrowAccounts = pgTable("escrow_accounts", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  installerId: integer("installer_id").references(() => installers.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  heldAmount: decimal("held_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  releasedAmount: decimal("released_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { 
    enum: ["created", "funded", "partial_release", "completed", "disputed", "refunded"] 
  }).default("created").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Milestones for installation payments
export const installationMilestones = pgTable("installation_milestones", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  escrowAccountId: integer("escrow_account_id").notNull().references(() => escrowAccounts.id),
  name: varchar("name").notNull(),
  description: text("description"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // e.g., 25.00 for 25%
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { 
    enum: ["pending", "in_progress", "completed", "verified", "disputed"] 
  }).default("pending").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Milestone payments tracking
export const milestonePayments = pgTable("milestone_payments", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestone_id").notNull().references(() => installationMilestones.id),
  escrowAccountId: integer("escrow_account_id").notNull().references(() => escrowAccounts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  recipientType: varchar("recipient_type", { enum: ["vendor", "installer"] }).notNull(),
  recipientId: integer("recipient_id").notNull(),
  status: varchar("status", { enum: ["pending", "released", "disputed"] }).default("pending").notNull(),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory alerts for low stock notifications
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").notNull().references(() => inventory.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  alertType: varchar("alert_type", { enum: ["low_stock", "out_of_stock", "overstocked"] }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Refund requests
export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "processed"] }).default("pending").notNull(),
  adminResponse: text("admin_response"),
  vendorResponse: text("vendor_response"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Refund messages for communication
export const refundMessages = pgTable("refund_messages", {
  id: serial("id").primaryKey(),
  refundRequestId: integer("refund_request_id").notNull().references(() => refundRequests.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor groups for organizing vendors
export const vendorGroups = pgTable("vendor_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  color: varchar("color").default("#3B82F6"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  maxProducts: integer("max_products"),
  allowedCategories: text("allowed_categories").array(),
  permissions: jsonb("permissions"),
  badges: text("badges").array(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor group memberships
export const vendorGroupMemberships = pgTable("vendor_group_memberships", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  groupId: integer("group_id").notNull().references(() => vendorGroups.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Group transfer rules for automatic group changes
export const groupTransferRules = pgTable("group_transfer_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  fromGroupId: integer("from_group_id").references(() => vendorGroups.id),
  toGroupId: integer("to_group_id").notNull().references(() => vendorGroups.id),
  conditionType: varchar("condition_type", { 
    enum: ["total_sales", "order_count", "registration_days", "product_count", "rating"] 
  }).notNull(),
  conditionValue: decimal("condition_value", { precision: 15, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor staff/team members
export const vendorStaff = pgTable("vendor_staff", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(),
  permissions: jsonb("permissions"),
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
});

// Vendor payouts and balance tracking
export const vendorPayouts = pgTable("vendor_payouts", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { enum: ["commission", "bonus", "withdrawal", "refund"] }).notNull(),
  status: varchar("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending").notNull(),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor withdrawal requests
export const vendorWithdrawals = pgTable("vendor_withdrawals", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(),
  paymentDetails: jsonb("payment_details"),
  status: varchar("status", { enum: ["pending", "approved", "rejected", "processed"] }).default("pending").notNull(),
  adminNotes: text("admin_notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor coupons
export const vendorCoupons = pgTable("vendor_coupons", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  code: varchar("code").notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { enum: ["percentage", "fixed"] }).notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
  maximumAmount: decimal("maximum_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  applicableProducts: text("applicable_products").array(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor badges system
export const vendorBadges = pgTable("vendor_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color").default("#3B82F6"),
  conditionType: varchar("condition_type", { 
    enum: ["manual", "total_sales", "order_count", "rating", "years_active", "group_membership"] 
  }).notNull(),
  conditionValue: decimal("condition_value", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor badge assignments
export const vendorBadgeAssignments = pgTable("vendor_badge_assignments", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  badgeId: integer("badge_id").notNull().references(() => vendorBadges.id),
  awardedAt: timestamp("awarded_at").defaultNow(),
  awardedBy: integer("awarded_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  vendor: one(vendors, {
    fields: [users.id],
    references: [vendors.userId],
  }),
  installer: one(installers, {
    fields: [users.id],
    references: [installers.userId],
  }),
  orders: many(orders),
  cartItems: many(cartItems),
  walletTransactions: many(walletTransactions),
  reviews: many(reviews),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, {
    fields: [vendors.userId],
    references: [users.id],
  }),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  orders: many(orders),
  cartItems: many(cartItems),
  reviews: many(reviews),
}));

export const installersRelations = relations(installers, ({ one, many }) => ({
  user: one(users, {
    fields: [installers.userId],
    references: [users.id],
  }),
  orders: many(orders),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [orders.vendorId],
    references: [vendors.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  installer: one(installers, {
    fields: [orders.installerId],
    references: [installers.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [walletTransactions.orderId],
    references: [orders.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  installer: one(installers, {
    fields: [reviews.installerId],
    references: [installers.id],
  }),
  vendor: one(vendors, {
    fields: [reviews.vendorId],
    references: [vendors.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  vendor: one(vendors, {
    fields: [inventory.vendorId],
    references: [vendors.id],
  }),
  movements: many(inventoryMovements),
  alerts: many(inventoryAlerts),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  inventory: one(inventory, {
    fields: [inventoryMovements.inventoryId],
    references: [inventory.id],
  }),
  order: one(orders, {
    fields: [inventoryMovements.orderId],
    references: [orders.id],
  }),
}));

export const escrowAccountsRelations = relations(escrowAccounts, ({ one, many }) => ({
  order: one(orders, {
    fields: [escrowAccounts.orderId],
    references: [orders.id],
  }),
  buyer: one(users, {
    fields: [escrowAccounts.buyerId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [escrowAccounts.vendorId],
    references: [vendors.id],
  }),
  installer: one(installers, {
    fields: [escrowAccounts.installerId],
    references: [installers.id],
  }),
  milestones: many(installationMilestones),
  milestonePayments: many(milestonePayments),
}));

export const installationMilestonesRelations = relations(installationMilestones, ({ one, many }) => ({
  order: one(orders, {
    fields: [installationMilestones.orderId],
    references: [orders.id],
  }),
  escrowAccount: one(escrowAccounts, {
    fields: [installationMilestones.escrowAccountId],
    references: [escrowAccounts.id],
  }),
  payments: many(milestonePayments),
}));

export const milestonePaymentsRelations = relations(milestonePayments, ({ one }) => ({
  milestone: one(installationMilestones, {
    fields: [milestonePayments.milestoneId],
    references: [installationMilestones.id],
  }),
  escrowAccount: one(escrowAccounts, {
    fields: [milestonePayments.escrowAccountId],
    references: [escrowAccounts.id],
  }),
}));

export const inventoryAlertsRelations = relations(inventoryAlerts, ({ one }) => ({
  inventory: one(inventory, {
    fields: [inventoryAlerts.inventoryId],
    references: [inventory.id],
  }),
  vendor: one(vendors, {
    fields: [inventoryAlerts.vendorId],
    references: [vendors.id],
  }),
}));

export const refundRequestsRelations = relations(refundRequests, ({ one, many }) => ({
  order: one(orders, {
    fields: [refundRequests.orderId],
    references: [orders.id],
  }),
  requester: one(users, {
    fields: [refundRequests.requesterId],
    references: [users.id],
  }),
  vendor: one(vendors, {
    fields: [refundRequests.vendorId],
    references: [vendors.id],
  }),
  messages: many(refundMessages),
}));

export const refundMessagesRelations = relations(refundMessages, ({ one }) => ({
  refundRequest: one(refundRequests, {
    fields: [refundMessages.refundRequestId],
    references: [refundRequests.id],
  }),
  sender: one(users, {
    fields: [refundMessages.senderId],
    references: [users.id],
  }),
}));

export const vendorGroupsRelations = relations(vendorGroups, ({ many }) => ({
  memberships: many(vendorGroupMemberships),
  transferRulesFrom: many(groupTransferRules),
  transferRulesTo: many(groupTransferRules),
}));

export const vendorGroupMembershipsRelations = relations(vendorGroupMemberships, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorGroupMemberships.vendorId],
    references: [vendors.id],
  }),
  group: one(vendorGroups, {
    fields: [vendorGroupMemberships.groupId],
    references: [vendorGroups.id],
  }),
}));

export const vendorStaffRelations = relations(vendorStaff, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorStaff.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [vendorStaff.userId],
    references: [users.id],
  }),
}));

export const vendorPayoutsRelations = relations(vendorPayouts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorPayouts.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorWithdrawalsRelations = relations(vendorWithdrawals, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorWithdrawals.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorCouponsRelations = relations(vendorCoupons, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorCoupons.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorBadgesRelations = relations(vendorBadges, ({ many }) => ({
  assignments: many(vendorBadgeAssignments),
}));

export const vendorBadgeAssignmentsRelations = relations(vendorBadgeAssignments, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorBadgeAssignments.vendorId],
    references: [vendors.id],
  }),
  badge: one(vendorBadges, {
    fields: [vendorBadgeAssignments.badgeId],
    references: [vendorBadges.id],
  }),
  awardedByUser: one(users, {
    fields: [vendorBadgeAssignments.awardedBy],
    references: [users.id],
  }),
}));

// Vendor verification documents
export const vendorVerificationDocuments = pgTable("vendor_verification_documents", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  documentType: varchar("document_type", { 
    enum: ["proof_of_address", "proof_of_identity", "company_license", "tax_document", "bank_statement", "other"] 
  }).notNull(),
  documentName: varchar("document_name").notNull(),
  documentUrl: varchar("document_url").notNull(),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  expiresAt: timestamp("expires_at"),
});

// Vendor verification requirements by group
export const vendorVerificationRequirements = pgTable("vendor_verification_requirements", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => vendorGroups.id),
  documentType: varchar("document_type").notNull(),
  isRequired: boolean("is_required").default(true),
  description: text("description"),
  maxFileSize: integer("max_file_size").default(5242880), // 5MB
  allowedFormats: text("allowed_formats").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Abuse reports
export const abuseReports = pgTable("abuse_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  reportType: varchar("report_type", { 
    enum: ["product", "review", "vendor", "order", "other"] 
  }).notNull(),
  targetId: integer("target_id").notNull(), // ID of reported item
  targetType: varchar("target_type").notNull(), // Type of reported item
  category: varchar("category", { 
    enum: ["fake_product", "inappropriate_content", "spam", "fraud", "copyright", "other"] 
  }).notNull(),
  description: text("description").notNull(),
  evidence: jsonb("evidence"), // URLs to evidence files
  status: varchar("status", { enum: ["pending", "under_review", "resolved", "dismissed"] }).default("pending").notNull(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
  resolution: text("resolution"),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Store policies
export const vendorStorePolicies = pgTable("vendor_store_policies", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  policyType: varchar("policy_type", { 
    enum: ["shipping", "returns", "privacy", "terms", "warranty", "payment", "custom"] 
  }).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Store reviews (separate from product reviews)
export const storeReviews = pgTable("store_reviews", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  comment: text("comment"),
  serviceRating: integer("service_rating"), // Customer service rating
  communicationRating: integer("communication_rating"),
  deliveryRating: integer("delivery_rating"),
  vendorReply: text("vendor_reply"),
  vendorRepliedAt: timestamp("vendor_replied_at"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  isReported: boolean("is_reported").default(false),
  reportReason: text("report_reason"),
  reportedAt: timestamp("reported_at"),
  reportedBy: integer("reported_by").references(() => users.id),
  isHidden: boolean("is_hidden").default(false),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review helpfulness votes
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => storeReviews.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isHelpful: boolean("is_helpful").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin announcements
export const adminAnnouncements = pgTable("admin_announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { enum: ["info", "warning", "success", "urgent"] }).default("info").notNull(),
  targetType: varchar("target_type", { 
    enum: ["all_vendors", "vendor_group", "specific_vendors", "all_users"] 
  }).notNull(),
  targetGroups: text("target_groups").array(), // Group IDs for vendor_group type
  targetVendors: text("target_vendors").array(), // Vendor IDs for specific_vendors type
  sendEmail: boolean("send_email").default(false),
  emailSubject: varchar("email_subject"),
  emailTemplate: text("email_template"),
  isActive: boolean("is_active").default(true),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  expiresAt: timestamp("expires_at"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Announcement read status
export const announcementReadStatus = pgTable("announcement_read_status", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").notNull().references(() => adminAnnouncements.id),
  userId: integer("user_id").notNull().references(() => users.id),
  readAt: timestamp("read_at").defaultNow(),
});

// Store support tickets
export const storeSupportTickets = pgTable("store_support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number").notNull().unique(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { 
    enum: ["general", "order_issue", "product_question", "shipping", "refund", "technical", "other"] 
  }).notNull(),
  priority: varchar("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  status: varchar("status", { 
    enum: ["open", "in_progress", "waiting_customer", "waiting_vendor", "resolved", "closed"] 
  }).default("open").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  lastResponseBy: varchar("last_response_by", { enum: ["customer", "vendor", "admin"] }),
  lastResponseAt: timestamp("last_response_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  satisfactionRating: integer("satisfaction_rating"), // 1-5 rating after resolution
  satisfactionComment: text("satisfaction_comment"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support ticket messages
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => storeSupportTickets.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  senderType: varchar("sender_type", { enum: ["customer", "vendor", "admin"] }).notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  isInternal: boolean("is_internal").default(false), // Internal notes visible only to vendor/admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor email preferences
export const vendorEmailPreferences = pgTable("vendor_email_preferences", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id),
  newOrders: boolean("new_orders").default(true),
  orderUpdates: boolean("order_updates").default(true),
  newReviews: boolean("new_reviews").default(true),
  supportTickets: boolean("support_tickets").default(true),
  announcements: boolean("announcements").default(true),
  payoutNotifications: boolean("payout_notifications").default(true),
  inventoryAlerts: boolean("inventory_alerts").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  weeklyReports: boolean("weekly_reports").default(true),
  accountSecurity: boolean("account_security").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verification document logs
export const verificationLogs = pgTable("verification_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => vendorVerificationDocuments.id),
  actionType: varchar("action_type", { 
    enum: ["submitted", "approved", "rejected", "re_submitted", "expired"] 
  }).notNull(),
  performedBy: integer("performed_by").references(() => users.id),
  notes: text("notes"),
  oldStatus: varchar("old_status"),
  newStatus: varchar("new_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for new tables
export const vendorVerificationDocumentsRelations = relations(vendorVerificationDocuments, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [vendorVerificationDocuments.vendorId],
    references: [vendors.id],
  }),
  reviewer: one(users, {
    fields: [vendorVerificationDocuments.reviewedBy],
    references: [users.id],
  }),
  logs: many(verificationLogs),
}));

export const abuseReportsRelations = relations(abuseReports, ({ one }) => ({
  reporter: one(users, {
    fields: [abuseReports.reporterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [abuseReports.reviewedBy],
    references: [users.id],
  }),
}));

export const vendorStorePoliciesRelations = relations(vendorStorePolicies, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorStorePolicies.vendorId],
    references: [vendors.id],
  }),
}));

export const storeReviewsRelations = relations(storeReviews, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [storeReviews.vendorId],
    references: [vendors.id],
  }),
  user: one(users, {
    fields: [storeReviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [storeReviews.orderId],
    references: [orders.id],
  }),
  reportedByUser: one(users, {
    fields: [storeReviews.reportedBy],
    references: [users.id],
  }),
  helpfulVotes: many(reviewHelpfulVotes),
}));

export const adminAnnouncementsRelations = relations(adminAnnouncements, ({ one, many }) => ({
  creator: one(users, {
    fields: [adminAnnouncements.createdBy],
    references: [users.id],
  }),
  readStatus: many(announcementReadStatus),
}));

export const storeSupportTicketsRelations = relations(storeSupportTickets, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [storeSupportTickets.vendorId],
    references: [vendors.id],
  }),
  customer: one(users, {
    fields: [storeSupportTickets.customerId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [storeSupportTickets.orderId],
    references: [orders.id],
  }),
  assignedUser: one(users, {
    fields: [storeSupportTickets.assignedTo],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
}));

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(storeSupportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [storeSupportTickets.id],
  }),
  sender: one(users, {
    fields: [supportTicketMessages.senderId],
    references: [users.id],
  }),
}));

export const vendorEmailPreferencesRelations = relations(vendorEmailPreferences, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorEmailPreferences.vendorId],
    references: [vendors.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertInstallerSchema = createInsertSchema(installers).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });
export const insertEscrowAccountSchema = createInsertSchema(escrowAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInstallationMilestoneSchema = createInsertSchema(installationMilestones).omit({ id: true, createdAt: true });
export const insertMilestonePaymentSchema = createInsertSchema(milestonePayments).omit({ id: true, createdAt: true });
export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts).omit({ id: true, createdAt: true });
export const insertRefundRequestSchema = createInsertSchema(refundRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRefundMessageSchema = createInsertSchema(refundMessages).omit({ id: true, createdAt: true });
export const insertVendorGroupSchema = createInsertSchema(vendorGroups).omit({ id: true, createdAt: true });
export const insertVendorGroupMembershipSchema = createInsertSchema(vendorGroupMemberships).omit({ id: true, joinedAt: true });
export const insertGroupTransferRuleSchema = createInsertSchema(groupTransferRules).omit({ id: true, createdAt: true });
export const insertVendorStaffSchema = createInsertSchema(vendorStaff).omit({ id: true, invitedAt: true });
export const insertVendorPayoutSchema = createInsertSchema(vendorPayouts).omit({ id: true, createdAt: true });
export const insertVendorWithdrawalSchema = createInsertSchema(vendorWithdrawals).omit({ id: true, createdAt: true });
export const insertVendorCouponSchema = createInsertSchema(vendorCoupons).omit({ id: true, createdAt: true });
export const insertVendorBadgeSchema = createInsertSchema(vendorBadges).omit({ id: true, createdAt: true });
export const insertVendorBadgeAssignmentSchema = createInsertSchema(vendorBadgeAssignments).omit({ id: true, awardedAt: true });
export const insertVendorVerificationDocumentSchema = createInsertSchema(vendorVerificationDocuments).omit({ id: true, submittedAt: true });
export const insertAbuseReportSchema = createInsertSchema(abuseReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorStorePolicySchema = createInsertSchema(vendorStorePolicies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStoreReviewSchema = createInsertSchema(storeReviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAdminAnnouncementSchema = createInsertSchema(adminAnnouncements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertStoreSupportTicketSchema = createInsertSchema(storeSupportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({ id: true, createdAt: true });
export const insertVendorEmailPreferencesSchema = createInsertSchema(vendorEmailPreferences).omit({ id: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Installer = typeof installers.$inferSelect;
export type InsertInstaller = z.infer<typeof insertInstallerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;

export type EscrowAccount = typeof escrowAccounts.$inferSelect;
export type InsertEscrowAccount = z.infer<typeof insertEscrowAccountSchema>;

export type InstallationMilestone = typeof installationMilestones.$inferSelect;
export type InsertInstallationMilestone = z.infer<typeof insertInstallationMilestoneSchema>;

export type MilestonePayment = typeof milestonePayments.$inferSelect;
export type InsertMilestonePayment = z.infer<typeof insertMilestonePaymentSchema>;

export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;

export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;

export type RefundMessage = typeof refundMessages.$inferSelect;
export type InsertRefundMessage = z.infer<typeof insertRefundMessageSchema>;

export type VendorGroup = typeof vendorGroups.$inferSelect;
export type InsertVendorGroup = z.infer<typeof insertVendorGroupSchema>;

export type VendorGroupMembership = typeof vendorGroupMemberships.$inferSelect;
export type InsertVendorGroupMembership = z.infer<typeof insertVendorGroupMembershipSchema>;

export type GroupTransferRule = typeof groupTransferRules.$inferSelect;
export type InsertGroupTransferRule = z.infer<typeof insertGroupTransferRuleSchema>;

export type VendorStaff = typeof vendorStaff.$inferSelect;
export type InsertVendorStaff = z.infer<typeof insertVendorStaffSchema>;

export type VendorPayout = typeof vendorPayouts.$inferSelect;
export type InsertVendorPayout = z.infer<typeof insertVendorPayoutSchema>;

export type VendorWithdrawal = typeof vendorWithdrawals.$inferSelect;
export type InsertVendorWithdrawal = z.infer<typeof insertVendorWithdrawalSchema>;

export type VendorCoupon = typeof vendorCoupons.$inferSelect;
export type InsertVendorCoupon = z.infer<typeof insertVendorCouponSchema>;

export type VendorBadge = typeof vendorBadges.$inferSelect;
export type InsertVendorBadge = z.infer<typeof insertVendorBadgeSchema>;

export type VendorBadgeAssignment = typeof vendorBadgeAssignments.$inferSelect;
export type InsertVendorBadgeAssignment = z.infer<typeof insertVendorBadgeAssignmentSchema>;

export type VendorVerificationDocument = typeof vendorVerificationDocuments.$inferSelect;
export type InsertVendorVerificationDocument = z.infer<typeof insertVendorVerificationDocumentSchema>;

export type AbuseReport = typeof abuseReports.$inferSelect;
export type InsertAbuseReport = z.infer<typeof insertAbuseReportSchema>;

export type VendorStorePolicy = typeof vendorStorePolicies.$inferSelect;
export type InsertVendorStorePolicy = z.infer<typeof insertVendorStorePolicySchema>;

export type StoreReview = typeof storeReviews.$inferSelect;
export type InsertStoreReview = z.infer<typeof insertStoreReviewSchema>;

export type AdminAnnouncement = typeof adminAnnouncements.$inferSelect;
export type InsertAdminAnnouncement = z.infer<typeof insertAdminAnnouncementSchema>;

export type StoreSupportTicket = typeof storeSupportTickets.$inferSelect;
export type InsertStoreSupportTicket = z.infer<typeof insertStoreSupportTicketSchema>;

export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;

export type VendorEmailPreferences = typeof vendorEmailPreferences.$inferSelect;
export type InsertVendorEmailPreferences = z.infer<typeof insertVendorEmailPreferencesSchema>;
