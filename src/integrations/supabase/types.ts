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
      daily_summaries: {
        Row: {
          calories_goal: number | null
          created_at: string | null
          date: string
          estimated_calories_out: number | null
          id: string
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_protein: number | null
          total_sodium: number | null
          total_water: number | null
          user_id: string | null
        }
        Insert: {
          calories_goal?: number | null
          created_at?: string | null
          date: string
          estimated_calories_out?: number | null
          id?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_water?: number | null
          user_id?: string | null
        }
        Update: {
          calories_goal?: number | null
          created_at?: string | null
          date?: string
          estimated_calories_out?: number | null
          id?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          total_sodium?: number | null
          total_water?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          amount: number
          calories: number
          carbs: number | null
          created_at: string | null
          fat: number | null
          fiber: number | null
          food_id: number | null
          is_favorite: boolean | null
          log_date: string
          log_id: number
          meal_type_id: number | null
          protein: number | null
          sodium: number | null
          unit_id: number | null
          user_id: string | null
        }
        Insert: {
          amount: number
          calories: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          food_id?: number | null
          is_favorite?: boolean | null
          log_date: string
          log_id: number
          meal_type_id?: number | null
          protein?: number | null
          sodium?: number | null
          unit_id?: number | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fiber?: number | null
          food_id?: number | null
          is_favorite?: boolean | null
          log_date?: string
          log_id?: number
          meal_type_id?: number | null
          protein?: number | null
          sodium?: number | null
          unit_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["food_id"]
          },
          {
            foreignKeyName: "food_logs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "food_units"
            referencedColumns: ["id"]
          },
        ]
      }
      food_units: {
        Row: {
          id: number
          name: string
          plural: string
        }
        Insert: {
          id: number
          name: string
          plural: string
        }
        Update: {
          id?: number
          name?: string
          plural?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          brand: string | null
          calories: number | null
          food_id: number
          locale: string | null
          name: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          brand?: string | null
          calories?: number | null
          food_id: number
          locale?: string | null
          name: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          brand?: string | null
          calories?: number | null
          food_id?: number
          locale?: string | null
          name?: string
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
      access_level: "PUBLIC" | "PRIVATE"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
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
    Enums: {
      access_level: ["PUBLIC", "PRIVATE"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const
