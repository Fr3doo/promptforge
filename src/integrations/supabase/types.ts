export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          image: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          image?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prompt_shares: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["sharing_permission"]
          prompt_id: string
          shared_by: string
          shared_with_user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["sharing_permission"]
          prompt_id: string
          shared_by: string
          shared_with_user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["sharing_permission"]
          prompt_id?: string
          shared_by?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_shares_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_usage: {
        Row: {
          id: string
          notes: string | null
          prompt_id: string
          success: boolean | null
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          prompt_id: string
          success?: boolean | null
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          prompt_id?: string
          success?: boolean | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_usage_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          owner_id: string
          public_permission: Database["public"]["Enums"]["sharing_permission"]
          status: Database["public"]["Enums"]["prompt_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: string | null
          visibility: Database["public"]["Enums"]["visibility"] | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          owner_id: string
          public_permission?: Database["public"]["Enums"]["sharing_permission"]
          status?: Database["public"]["Enums"]["prompt_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: string | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          owner_id?: string
          public_permission?: Database["public"]["Enums"]["sharing_permission"]
          status?: Database["public"]["Enums"]["prompt_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: string | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variable_sets: {
        Row: {
          created_at: string | null
          id: string
          name: string
          prompt_id: string
          values: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          prompt_id: string
          values?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          prompt_id?: string
          values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "variable_sets_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      variables: {
        Row: {
          created_at: string | null
          default_value: string | null
          help: string | null
          id: string
          name: string
          options: string[] | null
          order_index: number | null
          pattern: string | null
          prompt_id: string
          required: boolean | null
          type: Database["public"]["Enums"]["var_type"] | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          help?: string | null
          id?: string
          name: string
          options?: string[] | null
          order_index?: number | null
          pattern?: string | null
          prompt_id: string
          required?: boolean | null
          type?: Database["public"]["Enums"]["var_type"] | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          help?: string | null
          id?: string
          name?: string
          options?: string[] | null
          order_index?: number | null
          pattern?: string | null
          prompt_id?: string
          required?: boolean | null
          type?: Database["public"]["Enums"]["var_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "variables_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message: string | null
          prompt_id: string
          semver: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message?: string | null
          prompt_id: string
          semver: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message?: string | null
          prompt_id?: string
          semver?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "USER" | "ADMIN"
      prompt_status: "DRAFT" | "PUBLISHED"
      sharing_permission: "READ" | "WRITE"
      var_type:
        | "STRING"
        | "NUMBER"
        | "BOOLEAN"
        | "ENUM"
        | "DATE"
        | "MULTISTRING"
      visibility: "PRIVATE" | "SHARED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["USER", "ADMIN"],
      prompt_status: ["DRAFT", "PUBLISHED"],
      sharing_permission: ["READ", "WRITE"],
      var_type: ["STRING", "NUMBER", "BOOLEAN", "ENUM", "DATE", "MULTISTRING"],
      visibility: ["PRIVATE", "SHARED"],
    },
  },
} as const
