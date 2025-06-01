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

      // Auto-create installer profile if role is installer
      if (role === 'installer') {
        await storage.createInstaller({
          userId: newUser.id,
          companyName: `${firstName} ${lastName} Solar Services`,
          experience: 0,
          totalInstallations: 0,
          serviceAreas: ["Local Area"],
          certifications: [],
          availability: new Date(),
          verified: false,
        });
      }

      // Auto-create vendor profile if role is vendor
      if (role === 'vendor') {
        await storage.createVendor({
          userId: newUser.id,
          companyName: `${firstName} ${lastName} Solar Company`,
          description: "Solar equipment vendor",
          address: "",
          phone: "",
          website: "",
          verified: false,
        });
      }

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

  app.get('/api/installers/profile', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const installer = await storage.getInstallerByUserId(userId);
      if (!installer) {
        return res.status(404).json({ message: "Installer profile not found" });
      }
      res.json(installer);
    } catch (error) {
      console.error("Error fetching installer profile:", error);
      res.status(500).json({ message: "Failed to fetch installer profile" });
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

  // Multi-vendor order creation
  app.post('/api/orders/multi-vendor', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const { vendorOrders, paymentType, installmentMonths, totalAmount, shippingAddress, paymentMethod } = req.body;

      // Create parent order ID for tracking
      const parentOrderId = crypto.randomUUID();
      const subOrders = [];

      // Process each vendor order separately
      for (const vendorOrder of vendorOrders) {
        const orderData = {
          buyerId: userId,
          vendorId: vendorOrder.vendorId,
          productId: vendorOrder.items[0].product.id, // For now, use first product
          quantity: vendorOrder.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
          totalAmount: vendorOrder.total.toString(),
          paymentType,
          installmentMonths,
          shippingAddress,
          notes: `Part of multi-vendor order ${parentOrderId}`,
          parentOrderId, // Add this to track related orders
        };

        // Calculate installment fee if applicable
        if (paymentType === 'installment' && installmentMonths) {
          orderData.installmentFeeRate = "0.30"; // 30% fee
          const baseAmount = vendorOrder.total;
          const feeAmount = baseAmount * 0.30;
          orderData.totalAmount = (baseAmount + feeAmount).toString();
        }

        const order = await storage.createOrder(orderData);

        // Create escrow account for each sub-order
        const escrowData = {
          orderId: order.id,
          buyerId: userId,
          vendorId: vendorOrder.vendorId,
          totalAmount: orderData.totalAmount,
          heldAmount: orderData.totalAmount,
          status: 'created',
        };

        const escrowAccount = await storage.createEscrowAccount(escrowData);

        // Create default installation milestones for each order
        const defaultMilestones = [
          { name: 'Order Confirmed', percentage: 10, description: 'Order received and confirmed' },
          { name: 'In Preparation', percentage: 30, description: 'Items being prepared for shipment' },
          { name: 'Shipped', percentage: 60, description: 'Items shipped and in transit' },
          { name: 'Out for Delivery', percentage: 80, description: 'Items out for delivery' },
          { name: 'Delivered', percentage: 100, description: 'Items successfully delivered' },
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

        subOrders.push({
          orderId: order.id,
          vendorId: vendorOrder.vendorId,
          vendorName: vendorOrder.vendorName,
          total: orderData.totalAmount,
          escrowAccountId: escrowAccount.id
        });
      }

      // Update inventory for all items
      for (const vendorOrder of vendorOrders) {
        for (const item of vendorOrder.items) {
          // Implementation would go here to reduce stock quantity
        }
      }

      // Clear cart after successful order creation
      await storage.clearCart(userId);

      res.status(201).json({ 
        parentOrderId,
        subOrders,
        message: `Successfully created ${subOrders.length} orders from ${vendorOrders.length} vendors`
      });
    } catch (error) {
      console.error("Error creating multi-vendor orders:", error);
      res.status(500).json({ message: "Failed to create orders" });
    }
  });

  // Get parent order summary
  app.get('/api/orders/parent/:parentOrderId', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { parentOrderId } = req.params;
      const summary = await storage.getParentOrderSummary(parentOrderId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching parent order summary:", error);
      res.status(500).json({ message: "Failed to fetch order summary" });
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

  // Product import/export routes
  app.get('/api/products/export', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Only vendors can export products" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const products = await storage.getProductsByVendor(vendor.id);
      
      // Convert to CSV format
      const csvHeader = "name,description,price,capacity,type,warranty,efficiency,stockQuantity,minimumOrderQuantity,weight,dimensions,sku,locations\n";
      const csvRows = products.map(product => {
        const dimensions = product.dimensions ? JSON.stringify(product.dimensions) : '{}';
        const locations = Array.isArray(product.locations) ? product.locations.join(';') : '';
        
        return [
          `"${product.name || ''}"`,
          `"${product.description || ''}"`,
          product.price || '0',
          `"${product.capacity || ''}"`,
          `"${product.type || ''}"`,
          `"${product.warranty || ''}"`,
          product.efficiency || '0',
          product.stockQuantity || '0',
          product.minimumOrderQuantity || '1',
          product.weight || '0',
          `"${dimensions}"`,
          `"${product.sku || ''}"`,
          `"${locations}"`
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting products:", error);
      res.status(500).json({ message: "Failed to export products" });
    }
  });

  app.post('/api/products/import', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'vendor') {
        return res.status(403).json({ message: "Only vendors can import products" });
      }

      const vendor = await storage.getVendorByUserId(userId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      // This would handle file upload and CSV parsing
      // For now, return a mock response
      const mockResult = {
        success: 15,
        failed: 2,
        errors: [
          "Row 3: Invalid price format",
          "Row 7: Missing required field 'name'"
        ]
      };

      res.json(mockResult);
    } catch (error) {
      console.error("Error importing products:", error);
      res.status(500).json({ message: "Failed to import products" });
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

  // Admin reports routes
  app.get('/api/admin/reports', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { timeRange } = req.query;
      
      // Mock report data - replace with actual database queries
      const reportData = {
        totalRevenue: 2500000,
        revenueGrowth: 15.8,
        newUsers: 1250,
        userGrowth: 23.4,
        totalOrders: 3420,
        orderGrowth: 18.7,
        totalCommission: 250000,
        commissionGrowth: 12.3
      };

      res.json(reportData);
    } catch (error) {
      console.error("Error fetching admin reports:", error);
      res.status(500).json({ message: "Failed to fetch admin reports" });
    }
  });

  app.get('/api/admin/reports/registrations', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mock registration data
      const registrationData = {
        timeline: [
          { date: '2024-01-01', buyers: 45, vendors: 12, installers: 8 },
          { date: '2024-01-02', buyers: 52, vendors: 15, installers: 10 },
          { date: '2024-01-03', buyers: 38, vendors: 8, installers: 6 },
          { date: '2024-01-04', buyers: 65, vendors: 18, installers: 12 },
          { date: '2024-01-05', buyers: 72, vendors: 22, installers: 15 }
        ],
        distribution: [
          { name: 'Buyers', value: 68 },
          { name: 'Vendors', value: 22 },
          { name: 'Installers', value: 10 }
        ]
      };

      res.json(registrationData);
    } catch (error) {
      console.error("Error fetching registration reports:", error);
      res.status(500).json({ message: "Failed to fetch registration reports" });
    }
  });

  app.get('/api/admin/reports/sales', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mock sales data
      const salesData = {
        timeline: [
          { date: '2024-01-01', orders: 125, revenue: 45000 },
          { date: '2024-01-02', orders: 142, revenue: 52000 },
          { date: '2024-01-03', orders: 98, revenue: 38000 },
          { date: '2024-01-04', orders: 167, revenue: 65000 },
          { date: '2024-01-05', orders: 183, revenue: 72000 }
        ],
        topCategories: [
          { name: 'Residential Solar', orders: 450, revenue: 180000 },
          { name: 'Commercial Solar', orders: 280, revenue: 350000 },
          { name: 'Solar Accessories', orders: 320, revenue: 95000 },
          { name: 'Industrial Solar', orders: 150, revenue: 280000 }
        ]
      };

      res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales reports:", error);
      res.status(500).json({ message: "Failed to fetch sales reports" });
    }
  });

  app.get('/api/admin/reports/vendor-performance', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mock vendor performance data
      const vendorPerformance = {
        topVendors: [
          { 
            id: 1, 
            companyName: 'SolarTech Solutions', 
            totalOrders: 245, 
            totalProducts: 45, 
            totalRevenue: 180000,
            totalCommission: 18000 
          },
          { 
            id: 2, 
            companyName: 'Green Energy Corp', 
            totalOrders: 198, 
            totalProducts: 32, 
            totalRevenue: 150000,
            totalCommission: 15000 
          },
          { 
            id: 3, 
            companyName: 'Sunshine Solar', 
            totalOrders: 167, 
            totalProducts: 28, 
            totalRevenue: 125000,
            totalCommission: 12500 
          }
        ]
      };

      res.json(vendorPerformance);
    } catch (error) {
      console.error("Error fetching vendor performance:", error);
      res.status(500).json({ message: "Failed to fetch vendor performance" });
    }
  });

  app.get('/api/admin/reports/commissions', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Mock commission data
      const commissionData = {
        timeline: [
          { date: '2024-01-01', commission: 4500 },
          { date: '2024-01-02', commission: 5200 },
          { date: '2024-01-03', commission: 3800 },
          { date: '2024-01-04', commission: 6500 },
          { date: '2024-01-05', commission: 7200 }
        ],
        total: 250000,
        averageRate: 10,
        topVendor: 'SolarTech Solutions',
        thisMonth: 48500
      };

      res.json(commissionData);
    } catch (error) {
      console.error("Error fetching commission reports:", error);
      res.status(500).json({ message: "Failed to fetch commission reports" });
    }
  });

  // Refund request routes
  app.post('/api/refunds', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const refundData = {
        ...req.body,
        requesterId: userId,
      };

      const refund = await storage.createRefundRequest(refundData);
      res.status(201).json(refund);
    } catch (error) {
      console.error("Error creating refund request:", error);
      res.status(500).json({ message: "Failed to create refund request" });
    }
  });

  app.get('/api/refunds', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const { status } = req.query;

      let filters: any = {};
      if (status) filters.status = status as string;

      if (user?.role === 'vendor') {
        const vendor = await storage.getVendorByUserId(userId);
        if (vendor) {
          filters.vendorId = vendor.id;
        }
      }

      const refunds = await storage.getRefundRequests(filters);
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching refunds:", error);
      res.status(500).json({ message: "Failed to fetch refunds" });
    }
  });

  app.put('/api/refunds/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const refundId = parseInt(req.params.id);
      const updatedRefund = await storage.updateRefundRequest(refundId, req.body);
      res.json(updatedRefund);
    } catch (error) {
      console.error("Error updating refund:", error);
      res.status(500).json({ message: "Failed to update refund" });
    }
  });

  app.post('/api/refunds/:id/messages', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const refundRequestId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const messageData = {
        refundRequestId,
        senderId: userId,
        message: req.body.message,
        attachments: req.body.attachments,
      };

      const message = await storage.addRefundMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error adding refund message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  app.get('/api/refunds/:id/messages', authenticate, async (req, res) => {
    try {
      const refundRequestId = parseInt(req.params.id);
      const messages = await storage.getRefundMessages(refundRequestId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching refund messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Vendor groups routes
  app.post('/api/vendor-groups', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const group = await storage.createVendorGroup(req.body);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating vendor group:", error);
      res.status(500).json({ message: "Failed to create vendor group" });
    }
  });

  app.get('/api/vendor-groups', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const groups = await storage.getVendorGroups();
      res.json(groups);
    } catch (error) {
      console.error("Error fetching vendor groups:", error);
      res.status(500).json({ message: "Failed to fetch vendor groups" });
    }
  });

  app.post('/api/vendors/:vendorId/group', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const vendorId = parseInt(req.params.vendorId);
      const { groupId } = req.body;

      const membership = await storage.assignVendorToGroup(vendorId, groupId);
      res.json(membership);
    } catch (error) {
      console.error("Error assigning vendor to group:", error);
      res.status(500).json({ message: "Failed to assign vendor to group" });
    }
  });

  // Vendor staff routes
  app.post('/api/vendor/staff', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const staffData = {
        ...req.body,
        vendorId: vendor.id,
      };

      const staff = await storage.inviteVendorStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error inviting vendor staff:", error);
      res.status(500).json({ message: "Failed to invite staff" });
    }
  });

  app.get('/api/vendor/staff', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const staff = await storage.getVendorStaff(vendor.id);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching vendor staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // Vendor payouts routes
  app.get('/api/vendor/payouts', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const payouts = await storage.getVendorPayouts(vendor.id);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching vendor payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.get('/api/vendor/balance', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const balance = await storage.getVendorBalance(vendor.id);
      res.json({ balance });
    } catch (error) {
      console.error("Error fetching vendor balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Vendor withdrawal routes
  app.post('/api/vendor/withdrawals', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const withdrawalData = {
        ...req.body,
        vendorId: vendor.id,
      };

      const withdrawal = await storage.createVendorWithdrawal(withdrawalData);
      res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  app.get('/api/vendor/withdrawals', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const withdrawals = await storage.getVendorWithdrawals({ vendorId: vendor.id });
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Vendor coupons routes
  app.post('/api/vendor/coupons', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const couponData = {
        ...req.body,
        vendorId: vendor.id,
      };

      const coupon = await storage.createVendorCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.get('/api/vendor/coupons', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const coupons = await storage.getVendorCoupons(vendor.id);
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  // Vendor badges routes
  app.get('/api/vendor/badges', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const badges = await storage.getVendorBadgeAssignments(vendor.id);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching vendor badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Admin badge management
  app.post('/api/admin/badges', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const badge = await storage.createVendorBadge(req.body);
      res.status(201).json(badge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  app.post('/api/admin/badges/:badgeId/assign/:vendorId', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const badgeId = parseInt(req.params.badgeId);
      const vendorId = parseInt(req.params.vendorId);

      const assignment = await storage.assignBadgeToVendor(vendorId, badgeId, userId);
      res.json(assignment);
    } catch (error) {
      console.error("Error assigning badge:", error);
      res.status(500).json({ message: "Failed to assign badge" });
    }
  });

  // Vendor verification routes
  app.get('/api/vendor/verification/documents', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const documents = await storage.getVendorVerificationDocuments(vendor.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch verification documents" });
    }
  });

  app.get('/api/vendor/verification/requirements', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      // Get group ID for vendor (you may need to implement this)
      const requirements = await storage.getVerificationRequirements();
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching verification requirements:", error);
      res.status(500).json({ message: "Failed to fetch verification requirements" });
    }
  });

  app.post('/api/vendor/verification/upload', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      // In a real implementation, you'd handle file upload here
      // For now, we'll mock the document creation
      const documentData = {
        vendorId: vendor.id,
        documentType: req.body.documentType,
        documentName: req.body.documentName,
        documentUrl: `/uploads/verification/${Date.now()}-${req.body.documentName}`,
        status: 'pending'
      };

      const document = await storage.createVerificationDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading verification document:", error);
      res.status(500).json({ message: "Failed to upload verification document" });
    }
  });

  // Admin verification management
  app.get('/api/admin/verification/documents', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all pending verification documents
      const documents = await storage.getVendorVerificationDocuments(0); // 0 for all vendors
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch verification documents" });
    }
  });

  app.put('/api/admin/verification/documents/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const documentId = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        reviewedBy: req.user!.id
      };

      const document = await storage.updateVerificationDocument(documentId, updateData);
      res.json(document);
    } catch (error) {
      console.error("Error updating verification document:", error);
      res.status(500).json({ message: "Failed to update verification document" });
    }
  });

  // Abuse report routes
  app.post('/api/abuse-reports', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const reportData = {
        ...req.body,
        reporterId: req.user!.id
      };

      const report = await storage.createAbuseReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating abuse report:", error);
      res.status(500).json({ message: "Failed to create abuse report" });
    }
  });

  app.get('/api/admin/abuse-reports', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, reportType, priority } = req.query;
      const filters = {
        status: status as string,
        reportType: reportType as string,
        priority: priority as string
      };

      const reports = await storage.getAbuseReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching abuse reports:", error);
      res.status(500).json({ message: "Failed to fetch abuse reports" });
    }
  });

  app.put('/api/admin/abuse-reports/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const reportId = parseInt(req.params.id);
      const report = await storage.updateAbuseReport(reportId, req.body);
      res.json(report);
    } catch (error) {
      console.error("Error updating abuse report:", error);
      res.status(500).json({ message: "Failed to update abuse report" });
    }
  });

  // Store policy routes
  app.get('/api/vendor/policies', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const policies = await storage.getStorePolicies(vendor.id);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching store policies:", error);
      res.status(500).json({ message: "Failed to fetch store policies" });
    }
  });

  app.post('/api/vendor/policies', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const policyData = {
        ...req.body,
        vendorId: vendor.id
      };

      const policy = await storage.createStorePolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating store policy:", error);
      res.status(500).json({ message: "Failed to create store policy" });
    }
  });

  app.put('/api/vendor/policies/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const policyId = parseInt(req.params.id);
      const policy = await storage.updateStorePolicy(policyId, req.body);
      res.json(policy);
    } catch (error) {
      console.error("Error updating store policy:", error);
      res.status(500).json({ message: "Failed to update store policy" });
    }
  });

  app.delete('/api/vendor/policies/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const policyId = parseInt(req.params.id);
      await storage.deleteStorePolicy(policyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store policy:", error);
      res.status(500).json({ message: "Failed to delete store policy" });
    }
  });

  // Store review routes
  app.get('/api/vendors/:vendorId/reviews', async (req, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const reviews = await storage.getStoreReviews(vendorId, { hideReported: true });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching store reviews:", error);
      res.status(500).json({ message: "Failed to fetch store reviews" });
    }
  });

  app.post('/api/vendors/:vendorId/reviews', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const vendorId = parseInt(req.params.vendorId);
      const reviewData = {
        ...req.body,
        vendorId,
        userId: req.user!.id
      };

      const review = await storage.createStoreReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating store review:", error);
      res.status(500).json({ message: "Failed to create store review" });
    }
  });

  app.post('/api/store-reviews/:id/report', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const reportData = {
        ...req.body,
        reportedBy: req.user!.id
      };

      const review = await storage.reportStoreReview(reviewId, reportData);
      res.json(review);
    } catch (error) {
      console.error("Error reporting store review:", error);
      res.status(500).json({ message: "Failed to report store review" });
    }
  });

  app.post('/api/store-reviews/:id/reply', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { reply } = req.body;

      const review = await storage.addVendorReply(reviewId, reply);
      res.json(review);
    } catch (error) {
      console.error("Error adding vendor reply:", error);
      res.status(500).json({ message: "Failed to add vendor reply" });
    }
  });

  app.post('/api/store-reviews/:id/helpful', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const { isHelpful } = req.body;

      const count = await storage.voteReviewHelpful(reviewId, req.user!.id, isHelpful);
      res.json({ helpfulVotes: count });
    } catch (error) {
      console.error("Error voting review helpful:", error);
      res.status(500).json({ message: "Failed to vote review helpful" });
    }
  });

  // Admin announcement routes
  app.get('/api/announcements', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const announcements = await storage.getAnnouncements(req.user!.id, req.user!.role);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/admin/announcements', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const announcementData = {
        ...req.body,
        createdBy: req.user!.id
      };

      const announcement = await storage.createAnnouncement(announcementData);
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.post('/api/announcements/:id/read', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      await storage.markAnnouncementRead(announcementId, req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      res.status(500).json({ message: "Failed to mark announcement as read" });
    }
  });

  // Support ticket routes
  app.get('/api/support/tickets', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      let filters: any = {};
      
      if (user?.role === 'vendor') {
        const vendor = await storage.getVendorByUserId(userId);
        if (vendor) {
          filters.vendorId = vendor.id;
        }
      } else if (user?.role !== 'admin') {
        filters.customerId = userId;
      }

      const tickets = await storage.getSupportTickets(filters);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.post('/api/support/tickets', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketData = {
        ...req.body,
        customerId: req.user!.id
      };

      const ticket = await storage.createSupportTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.get('/api/support/tickets/:id', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post('/api/support/tickets/:id/messages', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const messageData = {
        ticketId,
        senderId: req.user!.id,
        senderType: req.user!.role === 'admin' ? 'admin' : req.user!.role === 'vendor' ? 'vendor' : 'customer',
        message: req.body.message,
        attachments: req.body.attachments,
        isInternal: req.body.isInternal || false
      };

      const message = await storage.addSupportMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error adding support message:", error);
      res.status(500).json({ message: "Failed to add support message" });
    }
  });

  app.get('/api/support/tickets/:id/messages', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const messages = await storage.getSupportMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      res.status(500).json({ message: "Failed to fetch support messages" });
    }
  });

  // Email preferences routes
  app.get('/api/vendor/email-preferences', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const preferences = await storage.getVendorEmailPreferences(vendor.id);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching email preferences:", error);
      res.status(500).json({ message: "Failed to fetch email preferences" });
    }
  });

  app.put('/api/vendor/email-preferences', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const vendor = await storage.getVendorByUserId(userId);
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor profile not found" });
      }

      const preferences = await storage.updateVendorEmailPreferences(vendor.id, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating email preferences:", error);
      res.status(500).json({ message: "Failed to update email preferences" });
    }
  });

  // Vendor registration and approval routes
  app.post('/api/vendors/register', async (req, res) => {
    try {
      // Handle vendor registration with custom fields
      const registrationData = req.body;
      
      // Create pending vendor application
      const application = await storage.createVendorApplication(registrationData);
      
      res.status(201).json({ 
        message: "Registration submitted successfully",
        applicationId: application.id 
      });
    } catch (error) {
      console.error("Error processing vendor registration:", error);
      res.status(500).json({ message: "Failed to process registration" });
    }
  });

  app.get('/api/admin/vendors/pending', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const pendingVendors = await storage.getPendingVendorApplications();
      res.json(pendingVendors);
    } catch (error) {
      console.error("Error fetching pending vendors:", error);
      res.status(500).json({ message: "Failed to fetch pending vendors" });
    }
  });

  app.post('/api/admin/vendors/:id/approve', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const vendorId = req.params.id;
      await storage.approveVendorApplication(vendorId);
      
      res.json({ message: "Vendor approved successfully" });
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ message: "Failed to approve vendor" });
    }
  });

  app.post('/api/admin/vendors/:id/reject', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const vendorId = req.params.id;
      const { reason } = req.body;
      
      await storage.rejectVendorApplication(vendorId, reason);
      
      res.json({ message: "Vendor application rejected" });
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      res.status(500).json({ message: "Failed to reject vendor" });
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