-- Initial database schema for LUSH MILK application
-- This migration establishes the core tables structure

-- Enable RLS (Row Level Security)
alter table "public"."users" enable row level security;
alter table "public"."customers" enable row level security;
alter table "public"."orders" enable row level security;
alter table "public"."payments" enable row level security;
alter table "public"."payment_history" enable row level security;
alter table "public"."products" enable row level security;
alter table "public"."subscriptions" enable row level security;
alter table "public"."farmers" enable row level security;
alter table "public"."milk_collections" enable row level security;
alter table "public"."deliveries" enable row level security;
alter table "public"."cold_storage_units" enable row level security;
alter table "public"."admin_logs" enable row level security;
alter table "public"."audit_trail" enable row level security;

-- Create image_url column for products table to store product images
ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "image" TEXT;

-- Create popular flag column for products
ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "popular" BOOLEAN DEFAULT false;

-- Set up image URL indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_products_image" ON "public"."products" ("image");

-- Add missing indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS "idx_orders_customer_id" ON "public"."orders" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_customers_user_id" ON "public"."customers" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_payments_order_id" ON "public"."payments" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_payment_history_user_id" ON "public"."payment_history" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_customer_id" ON "public"."subscriptions" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_farmers_user_id" ON "public"."farmers" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_milk_collections_farmer_id" ON "public"."milk_collections" ("farmer_id");

-- Security policies
-- Users can read their own data
CREATE POLICY "Users can view own data" 
ON "public"."users" FOR SELECT 
USING (auth.uid() = auth_uid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON "public"."users" FOR UPDATE 
USING (auth.uid() = auth_uid);

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" 
ON "public"."orders" FOR SELECT 
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  WHERE c.id = customer_id
));

-- Allow public read access to products
CREATE POLICY "Anyone can view products" 
ON "public"."products" FOR SELECT 
USING (true);

-- Ensure timestamp columns are not null and have default values
ALTER TABLE "public"."orders" 
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "public"."payments" 
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "created_at" SET NOT NULL;

ALTER TABLE "public"."users" 
ALTER COLUMN "created_at" SET DEFAULT now(),
ALTER COLUMN "created_at" SET NOT NULL;

-- Default status values
ALTER TABLE "public"."orders" 
ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "public"."payments" 
ALTER COLUMN "status" SET DEFAULT 'pending'; 