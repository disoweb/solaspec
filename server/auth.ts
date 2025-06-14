
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// JWT Configuration - Safe version without dotenv requirement
const JWT_SECRET = (() => {
  // 1. Try environment variable first (works with or without dotenv)
  if (process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
      throw new Error('Production JWT_SECRET must be at least 32 characters');
    }
    return process.env.JWT_SECRET;
  }

  // 2. Warn if using fallback in production
  if (process.env.NODE_ENV === 'production') {
    console.error('WARNING: Using fallback JWT secret in production!');
    console.error('Set JWT_SECRET environment variable for better security.');
  }

  // 3. Generate secure fallback for development
  const fallbackSecret = crypto.randomBytes(32).toString('hex');
  console.warn(`Generated temporary JWT secret: ${fallbackSecret}`);
  console.warn('For production, set JWT_SECRET environment variable');

  return fallbackSecret;
})();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error("JWT verification error:", error.message);
      return null;
    }
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: "buyer" | "vendor" | "installer" | "admin";
  }): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user
    const user = await storage.createUser({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || "buyer",
    });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }
}

// Middleware to authenticate requests
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies["auth-token"];
    
    // If no cookie token, try authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      console.error("Token verification failed for token:", token.substring(0, 20) + "...");
      return res.status(401).json({ message: "Invalid token" });
    }

    // Use the correct property name from the JWT payload
    const userId = decoded.id || decoded.userId;
    const user = await storage.getUser(userId);
    if (!user) {
      console.error("User not found for decoded token:", decoded);
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Middleware to check user roles
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

// Admin-only middleware
export const adminOnly = authorize(["admin"]);

// Vendor or admin middleware
export const vendorOrAdmin = authorize(["vendor", "admin"]);

// Installer or admin middleware
export const installerOrAdmin = authorize(["installer", "admin"]);
