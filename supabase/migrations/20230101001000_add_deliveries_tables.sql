-- Add missing fields to subscriptions table
ALTER TABLE "public"."subscriptions" 
ADD COLUMN IF NOT EXISTS "delivery_schedule" TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS "delivery_time" TEXT DEFAULT 'morning',
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create deliveries table to track individual deliveries
CREATE TABLE IF NOT EXISTS "public"."deliveries" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "subscription_id" UUID REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE,
  "scheduled_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "actual_delivery_time" TIMESTAMP WITH TIME ZONE,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "notes" TEXT,
  "delivery_person_id" UUID,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookup by subscription
CREATE INDEX IF NOT EXISTS "idx_deliveries_subscription_id" ON "public"."deliveries" ("subscription_id");
CREATE INDEX IF NOT EXISTS "idx_deliveries_scheduled_date" ON "public"."deliveries" ("scheduled_date");
CREATE INDEX IF NOT EXISTS "idx_deliveries_status" ON "public"."deliveries" ("status");

-- Enable RLS for the deliveries table
ALTER TABLE "public"."deliveries" ENABLE ROW LEVEL SECURITY;

-- Set up security policies for deliveries
CREATE POLICY "Users can view their own deliveries" 
ON "public"."deliveries" FOR SELECT 
USING (
  auth.uid() IN (
    SELECT u.auth_uid FROM users u
    JOIN customers c ON c.user_id = u.id
    JOIN subscriptions s ON s.customer_id = c.id
    WHERE s.id = subscription_id
  )
);

-- Add delivery location tracking table
CREATE TABLE IF NOT EXISTS "public"."delivery_locations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "customer_id" UUID REFERENCES "public"."customers"("id") ON DELETE CASCADE,
  "address" TEXT NOT NULL,
  "lat" FLOAT,
  "lng" FLOAT,
  "is_default" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookup by customer
CREATE INDEX IF NOT EXISTS "idx_delivery_locations_customer_id" ON "public"."delivery_locations" ("customer_id");

-- Enable RLS for delivery locations
ALTER TABLE "public"."delivery_locations" ENABLE ROW LEVEL SECURITY;

-- Set up security policies for delivery locations
CREATE POLICY "Users can view their own delivery locations" 
ON "public"."delivery_locations" FOR SELECT 
USING (
  auth.uid() IN (
    SELECT u.auth_uid FROM users u
    JOIN customers c ON c.user_id = u.id
    WHERE c.id = customer_id
  )
);

CREATE POLICY "Users can insert their own delivery locations" 
ON "public"."delivery_locations" FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT u.auth_uid FROM users u
    JOIN customers c ON c.user_id = u.id
    WHERE c.id = customer_id
  )
);

CREATE POLICY "Users can update their own delivery locations" 
ON "public"."delivery_locations" FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT u.auth_uid FROM users u
    JOIN customers c ON c.user_id = u.id
    WHERE c.id = customer_id
  )
);

CREATE POLICY "Users can delete their own delivery locations" 
ON "public"."delivery_locations" FOR DELETE 
USING (
  auth.uid() IN (
    SELECT u.auth_uid FROM users u
    JOIN customers c ON c.user_id = u.id
    WHERE c.id = customer_id
  )
); 