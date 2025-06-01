import { WebSocket } from 'ws';
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema";
import bcrypt from "bcryptjs";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = WebSocket;

// Initialize pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true // Ensure SSL is enabled
});

const db = drizzle(pool, { schema });

async function migrate() {
  console.log("Starting database migration...");

  try {
    // Create all tables with proper schema
    await db.execute(sql`
      -- Users table (enhanced)
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'installer', 'admin')),
        location VARCHAR,
        phone VARCHAR,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendors table
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_name VARCHAR NOT NULL,
        business_license VARCHAR,
        description TEXT,
        website VARCHAR,
        verified BOOLEAN DEFAULT false,
        rating DECIMAL(3,2),
        total_reviews INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        name VARCHAR NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        capacity VARCHAR,
        panel_count INTEGER,
        warranty VARCHAR,
        efficiency DECIMAL(5,2),
        type VARCHAR NOT NULL CHECK (type IN ('residential', 'commercial', 'industrial')),
        image_url VARCHAR,
        in_stock BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        stock_quantity INTEGER DEFAULT 0,
        minimum_order_quantity INTEGER DEFAULT 1,
        weight DECIMAL(8,2),
        dimensions JSONB,
        sku VARCHAR,
        locations TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Installers table
      CREATE TABLE IF NOT EXISTS installers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        company_name VARCHAR NOT NULL,
        experience_years INTEGER,
        total_installations INTEGER DEFAULT 0,
        certifications TEXT[],
        service_areas TEXT[],
        next_available TIMESTAMP,
        rating DECIMAL(3,2),
        total_reviews INTEGER DEFAULT 0,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        installer_id INTEGER REFERENCES installers(id),
        quantity INTEGER DEFAULT 1,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_type VARCHAR NOT NULL CHECK (payment_type IN ('full', 'installment')),
        installment_months INTEGER,
        installment_fee_rate DECIMAL(5,4),
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'escrow', 'installing', 'completed', 'cancelled')),
        shipping_address JSONB,
        notes TEXT,
        parent_order_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Cart items table
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Wallet transactions table
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id),
        type VARCHAR NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'escrow_hold', 'escrow_release')),
        amount DECIMAL(10,2) NOT NULL,
        balance DECIMAL(10,2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        installer_id INTEGER REFERENCES installers(id),
        vendor_id INTEGER REFERENCES vendors(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Inventory table
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 5,
        max_stock_level INTEGER DEFAULT 100,
        restock_level INTEGER DEFAULT 10,
        last_restocked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Inventory movements table
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        inventory_id INTEGER NOT NULL REFERENCES inventory(id),
        type VARCHAR NOT NULL CHECK (type IN ('restock', 'sale', 'adjustment', 'reservation', 'release')),
        quantity INTEGER NOT NULL,
        previous_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        order_id UUID REFERENCES orders(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Escrow accounts table
      CREATE TABLE IF NOT EXISTS escrow_accounts (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        installer_id INTEGER REFERENCES installers(id),
        total_amount DECIMAL(10,2) NOT NULL,
        held_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        released_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        status VARCHAR DEFAULT 'created' CHECK (status IN ('created', 'funded', 'partial_release', 'completed', 'disputed', 'refunded')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Installation milestones table
      CREATE TABLE IF NOT EXISTS installation_milestones (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id),
        escrow_account_id INTEGER NOT NULL REFERENCES escrow_accounts(id),
        name VARCHAR NOT NULL,
        description TEXT,
        percentage DECIMAL(5,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'disputed')),
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Milestone payments table
      CREATE TABLE IF NOT EXISTS milestone_payments (
        id SERIAL PRIMARY KEY,
        milestone_id INTEGER NOT NULL REFERENCES installation_milestones(id),
        escrow_account_id INTEGER NOT NULL REFERENCES escrow_accounts(id),
        amount DECIMAL(10,2) NOT NULL,
        recipient_type VARCHAR NOT NULL CHECK (recipient_type IN ('vendor', 'installer')),
        recipient_id INTEGER NOT NULL,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'disputed')),
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Inventory alerts table
      CREATE TABLE IF NOT EXISTS inventory_alerts (
        id SERIAL PRIMARY KEY,
        inventory_id INTEGER NOT NULL REFERENCES inventory(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        alert_type VARCHAR NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstocked')),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Refund requests table
      CREATE TABLE IF NOT EXISTS refund_requests (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id),
        requester_id INTEGER NOT NULL REFERENCES users(id),
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
        admin_response TEXT,
        vendor_response TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Refund messages table
      CREATE TABLE IF NOT EXISTS refund_messages (
        id SERIAL PRIMARY KEY,
        refund_request_id INTEGER NOT NULL REFERENCES refund_requests(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        attachments JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor groups table
      CREATE TABLE IF NOT EXISTS vendor_groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        description TEXT,
        color VARCHAR DEFAULT '#3B82F6',
        commission_rate DECIMAL(5,2),
        max_products INTEGER,
        allowed_categories TEXT[],
        permissions JSONB,
        badges TEXT[],
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor group memberships table
      CREATE TABLE IF NOT EXISTS vendor_group_memberships (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        group_id INTEGER NOT NULL REFERENCES vendor_groups(id),
        joined_at TIMESTAMP DEFAULT NOW()
      );

      -- Group transfer rules table
      CREATE TABLE IF NOT EXISTS group_transfer_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        description TEXT,
        from_group_id INTEGER REFERENCES vendor_groups(id),
        to_group_id INTEGER NOT NULL REFERENCES vendor_groups(id),
        condition_type VARCHAR NOT NULL CHECK (condition_type IN ('total_sales', 'order_count', 'registration_days', 'product_count', 'rating')),
        condition_value DECIMAL(15,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor staff table
      CREATE TABLE IF NOT EXISTS vendor_staff (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        role VARCHAR NOT NULL,
        permissions JSONB,
        is_active BOOLEAN DEFAULT true,
        invited_at TIMESTAMP DEFAULT NOW(),
        joined_at TIMESTAMP
      );

      -- Vendor payouts table
      CREATE TABLE IF NOT EXISTS vendor_payouts (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR NOT NULL CHECK (type IN ('commission', 'bonus', 'withdrawal', 'refund')),
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        payment_method VARCHAR,
        transaction_id VARCHAR,
        notes TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor withdrawals table
      CREATE TABLE IF NOT EXISTS vendor_withdrawals (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR NOT NULL,
        payment_details JSONB,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
        admin_notes TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor coupons table
      CREATE TABLE IF NOT EXISTS vendor_coupons (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        code VARCHAR NOT NULL,
        description TEXT,
        discount_type VARCHAR NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
        discount_value DECIMAL(10,2) NOT NULL,
        minimum_amount DECIMAL(10,2),
        maximum_amount DECIMAL(10,2),
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        applicable_products TEXT[],
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor badges table
      CREATE TABLE IF NOT EXISTS vendor_badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        description TEXT,
        icon VARCHAR,
        color VARCHAR DEFAULT '#3B82F6',
        condition_type VARCHAR NOT NULL CHECK (condition_type IN ('manual', 'total_sales', 'order_count', 'rating', 'years_active', 'group_membership')),
        condition_value DECIMAL(15,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor badge assignments table
      CREATE TABLE IF NOT EXISTS vendor_badge_assignments (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        badge_id INTEGER NOT NULL REFERENCES vendor_badges(id),
        awarded_at TIMESTAMP DEFAULT NOW(),
        awarded_by INTEGER REFERENCES users(id),
        expires_at TIMESTAMP
      );

      -- Vendor verification documents table
      CREATE TABLE IF NOT EXISTS vendor_verification_documents (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        document_type VARCHAR NOT NULL CHECK (document_type IN ('proof_of_address', 'proof_of_identity', 'company_license', 'tax_document', 'bank_statement', 'other')),
        document_name VARCHAR NOT NULL,
        document_url VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by INTEGER REFERENCES users(id),
        review_notes TEXT,
        submitted_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- Vendor verification requirements table
      CREATE TABLE IF NOT EXISTS vendor_verification_requirements (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES vendor_groups(id),
        document_type VARCHAR NOT NULL,
        is_required BOOLEAN DEFAULT true,
        description TEXT,
        max_file_size INTEGER DEFAULT 5242880,
        allowed_formats TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Abuse reports table
      CREATE TABLE IF NOT EXISTS abuse_reports (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER NOT NULL REFERENCES users(id),
        report_type VARCHAR NOT NULL CHECK (report_type IN ('product', 'review', 'vendor', 'order', 'other')),
        target_id INTEGER NOT NULL,
        target_type VARCHAR NOT NULL,
        category VARCHAR NOT NULL CHECK (category IN ('fake_product', 'inappropriate_content', 'spam', 'fraud', 'copyright', 'other')),
        description TEXT NOT NULL,
        evidence JSONB,
        status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'resolved', 'dismissed')),
        reviewed_by INTEGER REFERENCES users(id),
        admin_notes TEXT,
        resolution TEXT,
        priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor store policies table
      CREATE TABLE IF NOT EXISTS vendor_store_policies (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        policy_type VARCHAR NOT NULL CHECK (policy_type IN ('shipping', 'returns', 'privacy', 'terms', 'warranty', 'payment', 'custom')),
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Store reviews table
      CREATE TABLE IF NOT EXISTS store_reviews (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id),
        rating INTEGER NOT NULL,
        title VARCHAR,
        comment TEXT,
        service_rating INTEGER,
        communication_rating INTEGER,
        delivery_rating INTEGER,
        vendor_reply TEXT,
        vendor_replied_at TIMESTAMP,
        is_verified_purchase BOOLEAN DEFAULT false,
        is_reported BOOLEAN DEFAULT false,
        report_reason TEXT,
        reported_at TIMESTAMP,
        reported_by INTEGER REFERENCES users(id),
        is_hidden BOOLEAN DEFAULT false,
        helpful_votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Review helpful votes table
      CREATE TABLE IF NOT EXISTS review_helpful_votes (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES store_reviews(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        is_helpful BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Admin announcements table
      CREATE TABLE IF NOT EXISTS admin_announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
        target_type VARCHAR NOT NULL CHECK (target_type IN ('all_vendors', 'vendor_group', 'specific_vendors', 'all_users')),
        target_groups TEXT[],
        target_vendors TEXT[],
        send_email BOOLEAN DEFAULT false,
        email_subject VARCHAR,
        email_template TEXT,
        is_active BOOLEAN DEFAULT true,
        scheduled_at TIMESTAMP,
        published_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Announcement read status table
      CREATE TABLE IF NOT EXISTS announcement_read_status (
        id SERIAL PRIMARY KEY,
        announcement_id INTEGER NOT NULL REFERENCES admin_announcements(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        read_at TIMESTAMP DEFAULT NOW()
      );

      -- Store support tickets table
      CREATE TABLE IF NOT EXISTS store_support_tickets (
        id SERIAL PRIMARY KEY,
        ticket_number VARCHAR NOT NULL UNIQUE,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        customer_id INTEGER NOT NULL REFERENCES users(id),
        order_id UUID REFERENCES orders(id),
        subject VARCHAR NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR NOT NULL CHECK (category IN ('general', 'order_issue', 'product_question', 'shipping', 'refund', 'technical', 'other')),
        priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'waiting_vendor', 'resolved', 'closed')),
        assigned_to INTEGER REFERENCES users(id),
        last_response_by VARCHAR CHECK (last_response_by IN ('customer', 'vendor', 'admin')),
        last_response_at TIMESTAMP,
        resolved_at TIMESTAMP,
        closed_at TIMESTAMP,
        satisfaction_rating INTEGER,
        satisfaction_comment TEXT,
        internal_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Support ticket messages table
      CREATE TABLE IF NOT EXISTS support_ticket_messages (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL REFERENCES store_support_tickets(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        sender_type VARCHAR NOT NULL CHECK (sender_type IN ('customer', 'vendor', 'admin')),
        message TEXT NOT NULL,
        attachments JSONB,
        is_internal BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Vendor email preferences table
      CREATE TABLE IF NOT EXISTS vendor_email_preferences (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER NOT NULL REFERENCES vendors(id),
        new_orders BOOLEAN DEFAULT true,
        order_updates BOOLEAN DEFAULT true,
        new_reviews BOOLEAN DEFAULT true,
        support_tickets BOOLEAN DEFAULT true,
        announcements BOOLEAN DEFAULT true,
        payout_notifications BOOLEAN DEFAULT true,
        inventory_alerts BOOLEAN DEFAULT true,
        marketing_emails BOOLEAN DEFAULT false,
        weekly_reports BOOLEAN DEFAULT true,
        account_security BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Verification logs table
      CREATE TABLE IF NOT EXISTS verification_logs (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES vendor_verification_documents(id),
        action_type VARCHAR NOT NULL CHECK (action_type IN ('submitted', 'approved', 'rejected', 're_submitted', 'expired')),
        performed_by INTEGER REFERENCES users(id),
        notes TEXT,
        old_status VARCHAR,
        new_status VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database tables created successfully!");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    
    const existingAdmin = await db.execute(sql`
      SELECT id FROM users WHERE email = 'admin@solaspec.com'
    `);

    if (existingAdmin.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO users (email, password, first_name, last_name, role, is_verified, is_active)
        VALUES ('admin@solaspec.com', ${adminPassword}, 'System', 'Administrator', 'admin', true, true)
      `);
      console.log("Admin user created successfully!");
      console.log("Admin credentials:");
      console.log("Email: admin@solaspec.com");
      console.log("Password: admin123");
    } else {
      console.log("Admin user already exists");
    }

    // Create default vendor groups
    await db.execute(sql`
      INSERT INTO vendor_groups (name, description, commission_rate, max_products, is_default)
      VALUES 
        ('New Vendors', 'Default group for new vendor registrations', 15.00, 50, true),
        ('Verified Vendors', 'Verified vendors with standard benefits', 12.00, 100, false),
        ('Premium Vendors', 'High-performing vendors with premium benefits', 10.00, 500, false),
        ('VIP Vendors', 'Top-tier vendors with maximum benefits', 8.00, 1000, false)
      ON CONFLICT DO NOTHING
    `);

    // Create default vendor badges
    await db.execute(sql`
      INSERT INTO vendor_badges (name, description, condition_type, condition_value, icon, color)
      VALUES 
        ('New Seller', 'Welcome badge for new vendors', 'manual', 0, 'Star', '#22C55E'),
        ('Verified', 'Verified vendor badge', 'manual', 0, 'BadgeCheck', '#3B82F6'),
        ('Top Rated', 'High rating badge', 'rating', 4.5, 'Award', '#F59E0B'),
        ('Sales Champion', 'High sales volume badge', 'total_sales', 100000, 'Trophy', '#EF4444'),
        ('Trusted Partner', 'Long-term partnership badge', 'years_active', 2, 'Shield', '#8B5CF6')
      ON CONFLICT DO NOTHING
    `);

    // Create verification requirements for default group
    await db.execute(sql`
      INSERT INTO vendor_verification_requirements (group_id, document_type, is_required, description)
      SELECT 
        (SELECT id FROM vendor_groups WHERE name = 'New Vendors' LIMIT 1),
        document_type,
        is_required,
        description
      FROM (VALUES 
        ('proof_of_identity', true, 'Government-issued ID or passport'),
        ('company_license', true, 'Business license or registration document'),
        ('proof_of_address', false, 'Utility bill or bank statement'),
        ('tax_document', false, 'Tax registration certificate')
      ) AS requirements(document_type, is_required, description)
      ON CONFLICT DO NOTHING
    `);

    console.log("Default data seeded successfully!");
    console.log("Migration completed!");

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}

export { migrate };