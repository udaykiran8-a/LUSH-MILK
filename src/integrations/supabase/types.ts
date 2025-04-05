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
        }
        Insert: {
          address?: string | null
          delivery_preference?: string | null
          id?: string
          next_delivery_date?: string | null
          subscription_type?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          delivery_preference?: string | null
          id?: string
          next_delivery_date?: string | null
          subscription_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          delivery_time: string | null
          id: string
          order_id: string | null
          status: string | null
        }
        Insert: {
          delivery_time?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
        }
        Update: {
          delivery_time?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
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
          farmer_id: string | null
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
          farmer_id?: string | null
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
          farmer_id?: string | null
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
          customer_id: string | null
          delivered_at: string | null
          delivery_person: string | null
          fat_percentage: number | null
          id: string
          milk_type: string | null
          snf_percentage: number | null
          status: string | null
          vehicle: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_person?: string | null
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          snf_percentage?: number | null
          status?: string | null
          vehicle?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          created_at?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_person?: string | null
          fat_percentage?: number | null
          id?: string
          milk_type?: string | null
          snf_percentage?: number | null
          status?: string | null
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
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
        }
        Insert: {
          auth_uid: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role: string
        }
        Update: {
          auth_uid?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
