export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat: {
        Row: {
          created_at: string
          id: string
          message: string
          read_by_receiver: boolean
          read_by_sender: boolean
          receiver_id: string
          receiver_type: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_by_receiver?: boolean
          read_by_sender?: boolean
          receiver_id: string
          receiver_type: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_by_receiver?: boolean
          read_by_sender?: boolean
          receiver_id?: string
          receiver_type?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: []
      }
      layanan: {
        Row: {
          base_price: number | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          nama_layanan: string
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          nama_layanan: string
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          nama_layanan?: string
          updated_at?: string
        }
        Relationships: []
      }
      mitra: {
        Row: {
          alamat: string
          created_at: string
          description: string | null
          email: string
          id: string
          nama_toko: string
          phone_number: string
          saldo: number
          status: string
          updated_at: string
        }
        Insert: {
          alamat: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          nama_toko: string
          phone_number: string
          saldo?: number
          status?: string
          updated_at?: string
        }
        Update: {
          alamat?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          nama_toko?: string
          phone_number?: string
          saldo?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mitra_layanan: {
        Row: {
          created_at: string
          is_available: boolean
          layanan_id: string
          mitra_id: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_available?: boolean
          layanan_id: string
          mitra_id: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_available?: boolean
          layanan_id?: string
          mitra_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mitra_layanan_layanan_id_fkey"
            columns: ["layanan_id"]
            isOneToOne: false
            referencedRelation: "layanan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mitra_layanan_mitra_id_fkey"
            columns: ["mitra_id"]
            isOneToOne: false
            referencedRelation: "mitra"
            referencedColumns: ["id"]
          },
        ]
      }
      tagihan: {
        Row: {
          completion_date: string | null
          created_at: string
          id: string
          layanan_id: string
          mitra_id: string
          nominal: number
          order_date: string
          payment_method: string | null
          rating: number | null
          review: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          id?: string
          layanan_id: string
          mitra_id: string
          nominal: number
          order_date?: string
          payment_method?: string | null
          rating?: number | null
          review?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          id?: string
          layanan_id?: string
          mitra_id?: string
          nominal?: number
          order_date?: string
          payment_method?: string | null
          rating?: number | null
          review?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tagihan_layanan_id_fkey"
            columns: ["layanan_id"]
            isOneToOne: false
            referencedRelation: "layanan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tagihan_mitra_id_fkey"
            columns: ["mitra_id"]
            isOneToOne: false
            referencedRelation: "mitra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tagihan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      topup: {
        Row: {
          created_at: string
          id: string
          nominal: number
          payment_method: string
          status: string
          transaction_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nominal: number
          payment_method: string
          status?: string
          transaction_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nominal?: number
          payment_method?: string
          status?: string
          transaction_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topup_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          nama: string
          phone_number: string | null
          profile_picture_url: string | null
          saldo: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nama: string
          phone_number?: string | null
          profile_picture_url?: string | null
          saldo?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nama?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          saldo?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      tambah_saldo: {
        Args: { user_id_input: string; jumlah_input: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
