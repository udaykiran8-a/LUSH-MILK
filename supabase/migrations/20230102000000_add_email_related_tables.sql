-- Migration to add email-related database structures for LUSH MILK application

-- Add email and marketing_consent columns to customers table if not exist
ALTER TABLE "public"."customers" 
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "full_name" TEXT,
ADD COLUMN IF NOT EXISTS "marketing_consent" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create product_notifications table for restock alerts
CREATE TABLE IF NOT EXISTS "public"."product_notifications" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" UUID REFERENCES "public"."customers"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL DEFAULT 'restock',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for product_notifications
CREATE INDEX IF NOT EXISTS "idx_product_notifications_customer_id" ON "public"."product_notifications" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_product_notifications_product_id" ON "public"."product_notifications" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_product_notifications_status" ON "public"."product_notifications" ("status");
CREATE INDEX IF NOT EXISTS "idx_product_notifications_type" ON "public"."product_notifications" ("type");

-- Enable RLS for product_notifications
ALTER TABLE "public"."product_notifications" ENABLE ROW LEVEL SECURITY;

-- Create security policies for product_notifications
CREATE POLICY "Customers can view their own notifications" 
ON "public"."product_notifications" FOR SELECT 
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  WHERE c.id = customer_id
));

-- Create cart tables for abandoned cart emails
CREATE TABLE IF NOT EXISTS "public"."carts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" UUID REFERENCES "public"."customers"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "last_reminder_sent" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "public"."cart_items" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cart_id" UUID REFERENCES "public"."carts"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "public"."products"("id") ON DELETE SET NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for cart tables
CREATE INDEX IF NOT EXISTS "idx_carts_customer_id" ON "public"."carts" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_carts_status" ON "public"."carts" ("status");
CREATE INDEX IF NOT EXISTS "idx_carts_updated_at" ON "public"."carts" ("updated_at");
CREATE INDEX IF NOT EXISTS "idx_cart_items_cart_id" ON "public"."cart_items" ("cart_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_product_id" ON "public"."cart_items" ("product_id");

-- Enable RLS for cart tables
ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;

-- Create security policies for cart tables
CREATE POLICY "Customers can view their own carts" 
ON "public"."carts" FOR SELECT 
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  WHERE c.id = customer_id
));

CREATE POLICY "Customers can manage their own carts" 
ON "public"."carts" FOR ALL 
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  WHERE c.id = customer_id
));

CREATE POLICY "Customers can view their own cart items" 
ON "public"."cart_items" FOR SELECT 
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  JOIN carts cart ON cart.customer_id = c.id
  WHERE cart.id = cart_id
));

CREATE POLICY "Customers can manage their own cart items" 
ON "public"."cart_items" FOR ALL
USING (auth.uid() IN (
  SELECT u.auth_uid FROM users u
  JOIN customers c ON c.user_id = u.id
  JOIN carts cart ON cart.customer_id = c.id
  WHERE cart.id = cart_id
));

-- Add in_stock column to products if not exists
ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "in_stock" BOOLEAN DEFAULT true;

-- Add email notification preferences to customers
ALTER TABLE "public"."customers" 
ADD COLUMN IF NOT EXISTS "order_notifications" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "marketing_emails" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "restock_notifications" BOOLEAN DEFAULT false;

-- Create a helper function to get column names for a table
-- Used by the verification script to check schema requirements
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS text[] LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  columns text[];
BEGIN
  SELECT array_agg(column_name::text) INTO columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = $1;
  
  RETURN columns;
END;
$$; 