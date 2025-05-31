import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { AuthService, authenticate, authorize, adminOnly, vendorOrAdmin, installerOrAdmin, type AuthenticatedRequest } from "./auth";
import { 
  insertUserSchema,
  insertVendorSchema, 
  insertProductSchema, 
  insertInstallerSchema, 
  insertOrderSchema,
  insertCartItemSchema,
  insertReviewSchema 
} from "@shared/schema";
import { z } from "zod";
// Remove this duplicate import since authenticate is already imported above
import { db } from "./db";
import { users, products, vendors, installers, orders, reviews, carts } from "../shared/schema";
import { eq, desc, sql, and, ilike, or, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role = "buyer" } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(users).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      }).returning();

      // Generate JWT token
      const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

      // Set cookie
      res.cookie("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set cookie
      res.cookie("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth-token");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/user", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, req.userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Authentication routes are handled above - removed duplicates

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { type, minPrice, maxPrice, location, featured, search } = req.query;
      const products = await storage.getProducts({
        type: type as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        location: location as string,
        featured: featured === 'true',
        search: search as string,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = req.user;

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Only vendors can create products" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        vendorId: vendor.id,
      });

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Vendor routes
  app.get('/api/vendors', async (req, res) => {
    try {
      const { verified } = req.query;
      const vendors = await storage.getVendors({
        verified: verified === 'true',
      });
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "User must have vendor role" });
      }

      const vendorData = insertVendorSchema.parse({
        ...req.body,
        userId,
      });

      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vendor data", errors: error.errors });
      }
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.get('/api/vendors/profile', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ message: "Failed to fetch vendor profile" });
    }
  });

  // Installer routes
  app.get('/api/installers', async (req, res) => {
    try {
      const { verified } = req.query;
      const installers = await storage.getInstallers({
        verified: verified === 'true',
      });
      res.json(installers);
    } catch (error) {
      console.error("Error fetching installers:", error);
      res.status(500).json({ message: "Failed to fetch installers" });
    }
  });

  app.post('/api/installers', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const installerData = insertInstallerSchema.parse({
        ...req.body,
        userId,
      });

      const installer = await storage.createInstaller(installerData);
      res.status(201).json(installer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid installer data", errors: error.errors });
      }
      console.error("Error creating installer:", error);
      res.status(500).json({ message: "Failed to create installer" });
    }
  });

  // Cart routes
  app.get('/api/cart', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/:id', authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.get('/api/orders', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role === 'vendor') {
        const vendor = await storage.getVendorByUserId(userId);
        if (vendor) {
          const orders = await storage.getOrdersByVendor(vendor.id);
          return res.json(orders);
        }
      }

      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const orderData = insertOrderSchema.parse({
        ...req.body,
        buyerId: userId,
      });

      // Calculate installment fee if applicable
      if (orderData.paymentType === 'installment' && orderData.installmentMonths) {
        orderData.installmentFeeRate = "0.30"; // 30% fee
        const baseAmount = parseFloat(orderData.totalAmount);
        const feeAmount = baseAmount * 0.30;
        orderData.totalAmount = (baseAmount + feeAmount).toString();
      }

      const order = await storage.createOrder(orderData);

      // Create escrow account for the order
      const escrowData = {
        orderId: order.id,
        buyerId: userId,
        vendorId: orderData.vendorId,
        installerId: orderData.installerId,
        totalAmount: orderData.totalAmount,
        heldAmount: orderData.totalAmount,
        status: 'created',
      };

      const escrowAccount = await storage.createEscrowAccount(escrowData);

      // Create default installation milestones if installer is assigned
      if (orderData.installerId) {
        const defaultMilestones = [
          { name: 'Site Assessment', percentage: 10, description: 'Initial site evaluation and permits' },
          { name: 'Equipment Delivery', percentage: 20, description: 'Solar equipment delivered to site' },
          { name: 'Installation Start', percentage: 30, description: 'Begin installation process' },
          { name: 'System Installation', percentage: 60, description: 'Complete system installation' },
          { name: 'Testing & Commissioning', percentage: 80, description: 'System testing and grid connection' },
          { name: 'Final Inspection', percentage: 100, description: 'Final inspection and handover' },
        ];

        const totalAmount = parseFloat(orderData.totalAmount);
        
        for (const milestone of defaultMilestones) {
          await storage.createInstallationMilestone({
            orderId: order.id,
            escrowAccountId: escrowAccount.id,
            name: milestone.name,
            description: milestone.description,
            percentage: milestone.percentage.toString(),
            amount: (totalAmount * milestone.percentage / 100).toString(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          });
        }
      }

      // Update inventory
      // Implementation would go here to reduce stock quantity

      // Clear cart after order creation
      await storage.clearCart(userId);

      res.status(201).json({ order, escrowAccount });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = req.params.id;
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check permissions
      if (user?.role === 'vendor') {
        const vendor = await storage.getVendorByUserId(userId);
        if (!vendor || order.vendorId !== vendor.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else if (order.buyerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedOrder = await storage.updateOrder(orderId, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Review routes
  app.post('/api/reviews', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/vendor', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Access denied" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const stats = await storage.getVendorStats(vendor.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
      res.status(500).json({ message: "Failed to fetch vendor stats" });
    }
  });

  app.get('/api/analytics/admin', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Wallet routes
  app.get('/api/wallet/balance', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const balance = await storage.getWalletBalance(userId);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  app.get('/api/wallet/transactions', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const transactions = await storage.getWalletTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch wallet transactions" });
    }
  });

  // Inventory routes
  app.get('/api/inventory', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Only vendors can access inventory" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const inventory = await storage.getInventoryByVendor(vendor.id);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post('/api/inventory', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Only vendors can manage inventory" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const inventoryData = {
        ...req.body,
        vendorId: vendor.id,
      };

      const inventory = await storage.createInventory(inventoryData);
      res.status(201).json(inventory);
    } catch (error) {
      console.error("Error creating inventory:", error);
      res.status(500).json({ message: "Failed to create inventory" });
    }
  });

  app.put('/api/inventory/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const inventoryId = parseInt(req.params.id);
      const updatedInventory = await storage.updateInventory(inventoryId, req.body);
      res.json(updatedInventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ message: "Failed to update inventory" });
    }
  });

  app.get('/api/inventory/alerts', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const alerts = await storage.getInventoryAlerts(vendor.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  // Escrow routes
  app.get('/api/escrow', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role === 'vendor') {
        const vendor = await storage.getVendorByUserId(userId);
        if (vendor) {
          const escrowAccounts = await storage.getEscrowAccountsByVendor(vendor.id);
          return res.json(escrowAccounts);
        }
      }

      // For buyers, get their escrow accounts
      // Implementation would go here

      res.json([]);
    } catch (error) {
      console.error("Error fetching escrow accounts:", error);
      res.status(500).json({ message: "Failed to fetch escrow accounts" });
    }
  });

  app.post('/api/escrow', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const escrowData = req.body;
      const escrowAccount = await storage.createEscrowAccount(escrowData);
      res.status(201).json(escrowAccount);
    } catch (error) {
      console.error("Error creating escrow account:", error);
      res.status(500).json({ message: "Failed to create escrow account" });
    }
  });

  // Milestone routes
  app.get('/api/milestones', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { orderId } = req.query;
      if (orderId) {
        const milestones = await storage.getMilestonesByOrder(orderId as string);
        return res.json(milestones);
      }

      // Return all milestones for the user's role
      res.json([]);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/milestones', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const milestoneData = req.body;
      const milestone = await storage.createInstallationMilestone(milestoneData);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.put('/api/milestones/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      const updatedMilestone = await storage.updateMilestone(milestoneId, req.body);
      res.json(updatedMilestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}