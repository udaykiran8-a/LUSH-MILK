export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string | null
          context: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trail: {
        Row: {
          entity: string | null
          entity_id: string | null
          id: string
          operation: string | null
          performed_by: string | null
          timestamp: string | null
        }
        Insert: {
          entity?: string | null
          entity_id?: string | null
          id?: string
          operation?: string | null
          performed_by?: string | null
          timestamp?: string | null
        }
        Update: {
          entity?: string | null
          entity_id?: string | null
          id?: string
          operation?: string | null
          performed_by?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string | null
          quantity: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          cart_id: string
          product_id?: string | null
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string | null
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      carts: {
        Row: {
          id: string
          customer_id: string
          status: string
          last_reminder_sent: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          status?: string
          last_reminder_sent?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          status?: string
          last_reminder_sent?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      cold_storage_units: {
        Row: {
          capacity_liters: number | null
          current_stock_liters: number | null
          id: string
          last_updated: string | null
          location: string | null
        }
        Insert: {
          capacity_liters?: number | null
          current_stock_liters?: number | null
          id?: string
          last_updated?: string | null
          location?: string | null
        }
        Update: {
          capacity_liters?: number | null
          current_stock_liters?: number | null
          id?: string
          last_updated?: string | null
          location?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          delivery_preference: string | null
          id: string
          next_delivery_date: string | null
          subscription_type: string | null
          user_id: string | null
          email: string | null
          full_name: string | null
          marketing_consent: boolean | null
          created_at: string | null
          updated_at: string | null
          order_notifications: boolean | null
          marketing_emails: boolean | null
          restock_notifications: boolean | null
        }
        Insert: {
          address?: string | null
          delivery_preference?: string | null
          id?: string
          next_delivery_date?: string | null
          subscription_type?: string | null
          user_id?: string | null
          email?: string | null
          full_name?: string | null
          marketing_consent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          order_notifications?: boolean | null
          marketing_emails?: boolean | null
          restock_notifications?: boolean | null
        }
        Update: {
          address?: string | null
          delivery_preference?: string | null
          id?: string
          next_delivery_date?: string | null
          subscription_type?: string | null
          user_id?: string | null
          email?: string | null
          full_name?: string | null
          marketing_consent?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          order_notifications?: boolean | null
          marketing_emails?: boolean | null
          restock_notifications?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      deliveries: {
        Row: {
          delivery_time: string | null
          id: string
          order_id: string
          status: string
        }
        Insert: {
          delivery_time?: string | null
          id?: string
          order_id: string
          status?: string
        }
        Update: {
          delivery_time?: string | null
          id?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          created_at: string | null
          farm_location: string | null
          id: string
          user_id: string | null
          verified_status: boolean | null
        }
        Insert: {
          created_at?: string | null
          farm_location?: string | null
          id?: string
          user_id?: string | null
          verified_status?: boolean | null
        }
        Update: {
          created_at?: string | null
          farm_location?: string | null
          id?: string
          user_id?: string | null
          verified_status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "farmers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_collections: {
        Row: {
          collection_date: string | null
          created_at: string | null
          farmer_id: string
          fat_percentage: number | null
          id: string
          price_per_liter: number | null
          snf_percentage: number | null
          total_price: number | null
          verified: boolean | null
          volume_liters: number | null
        }
        Insert: {
          collection_date?: string | null
          created_at?: string | null
          farmer_id: string
          fat_percentage?: number | null
          id?: string
          price_per_liter?: number | null
          snf_percentage?: number | null
          total_price?: number | null
          verified?: boolean | null
          volume_liters?: number | null
        }
        Update: {
          collection_date?: string | null
          created_at?: string | null
          farmer_id?: string
          fat_percentage?: number | null
          id?: string
          price_per_liter?: number | null
          snf_percentage?: number | null
          total_price?: number | null
          verified?: boolean | null
          volume_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "milk_collections_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_reason: string | null
          created_at: string | null
          customer_id: string
          delivered_at: string | null
          delivery_person: string | null
          fat_percentage: number | null
          id: string
          milk_type: string | null
          snf_percentage: number | null
          status: string
          vehicle: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          created_at?: string | null
          customer_id: string
          delivered_at?: string | null
          delivery_person?: string | null
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          snf_percentage?: number | null
          status?: string
          vehicle?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          created_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          delivery_person?: string | null
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          snf_percentage?: number | null
          status?: string
          vehicle?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          description: string
          id: string
          payment_date: string | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          description: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          description?: string
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          order_id: string | null
          payment_gateway: string | null
          payment_mode: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_gateway?: string | null
          payment_mode?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_gateway?: string | null
          payment_mode?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_notifications: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          type: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          type?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
          type?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          fat_percentage: number | null
          id: string
          milk_type: string | null
          price_1l: number | null
          price_250ml: number | null
          price_500ml: number | null
          region: string | null
          snf_range: string | null
          image: string | null
          popular: boolean | null
          in_stock: boolean | null
        }
        Insert: {
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          price_1l?: number | null
          price_250ml?: number | null
          price_500ml?: number | null
          region?: string | null
          snf_range?: string | null
          image?: string | null
          popular?: boolean | null
          in_stock?: boolean | null
        }
        Update: {
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          price_1l?: number | null
          price_250ml?: number | null
          price_500ml?: number | null
          region?: string | null
          snf_range?: string | null
          image?: string | null
          popular?: boolean | null
          in_stock?: boolean | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          customer_id: string | null
          end_date: string | null
          id: string
          milk_type: string | null
          quantity_liters: number | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          customer_id?: string | null
          end_date?: string | null
          id?: string
          milk_type?: string | null
          quantity_liters?: number | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          customer_id?: string | null
          end_date?: string | null
          id?: string
          milk_type?: string | null
          quantity_liters?: number | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_uid: string
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          auth_uid: string
          client_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          auth_uid?: string
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
