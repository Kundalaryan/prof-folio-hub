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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          replied: boolean | null
          replied_at: string | null
          reply_message: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          replied?: boolean | null
          replied_at?: string | null
          reply_message?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          office_location: string | null
          phone: string | null
          profile_image_url: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          office_location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          office_location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          abstract: string | null
          authors: string
          citation_count: number | null
          created_at: string
          doi: string | null
          id: string
          journal: string | null
          publication_type: string | null
          title: string
          updated_at: string
          url: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors: string
          citation_count?: number | null
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          publication_type?: string | null
          title: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string
          citation_count?: number | null
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          publication_type?: string | null
          title?: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          collaborators: string[] | null
          created_at: string
          description: string | null
          detailed_description: string | null
          end_date: string | null
          funding_amount: number | null
          funding_source: string | null
          id: string
          image_url: string | null
          project_url: string | null
          publications: string[] | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          end_date?: string | null
          funding_amount?: number | null
          funding_source?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          publications?: string[] | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          collaborators?: string[] | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          end_date?: string | null
          funding_amount?: number | null
          funding_source?: string | null
          id?: string
          image_url?: string | null
          project_url?: string | null
          publications?: string[] | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          bio: string | null
          created_at: string
          degree_level: string
          email: string | null
          graduation_year: number | null
          id: string
          image_url: string | null
          linkedin_url: string | null
          name: string
          program: string | null
          research_area: string | null
          status: string | null
          thesis_title: string | null
          updated_at: string
          website_url: string | null
          year_started: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          degree_level: string
          email?: string | null
          graduation_year?: number | null
          id?: string
          image_url?: string | null
          linkedin_url?: string | null
          name: string
          program?: string | null
          research_area?: string | null
          status?: string | null
          thesis_title?: string | null
          updated_at?: string
          website_url?: string | null
          year_started?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          degree_level?: string
          email?: string | null
          graduation_year?: number | null
          id?: string
          image_url?: string | null
          linkedin_url?: string | null
          name?: string
          program?: string | null
          research_area?: string | null
          status?: string | null
          thesis_title?: string | null
          updated_at?: string
          website_url?: string | null
          year_started?: number | null
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
