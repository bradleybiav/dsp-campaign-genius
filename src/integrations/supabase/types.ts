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
      campaigns: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dj_results: {
        Row: {
          campaign_id: string | null
          created_at: string
          date: string
          dj: string
          event: string
          id: string
          location: string
          matched_inputs: number[] | null
          tracklist_url: string
          vertical: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          date: string
          dj: string
          event: string
          id?: string
          location: string
          matched_inputs?: number[] | null
          tracklist_url: string
          vertical?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          date?: string
          dj?: string
          event?: string
          id?: string
          location?: string
          matched_inputs?: number[] | null
          tracklist_url?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dj_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      dsp_results: {
        Row: {
          campaign_id: string | null
          created_at: string
          curator_name: string
          follower_count: number
          id: string
          last_updated: string
          matched_inputs: number[] | null
          playlist_name: string
          playlist_url: string
          vertical: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          curator_name: string
          follower_count: number
          id?: string
          last_updated: string
          matched_inputs?: number[] | null
          playlist_name: string
          playlist_url: string
          vertical?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          curator_name?: string
          follower_count?: number
          id?: string
          last_updated?: string
          matched_inputs?: number[] | null
          playlist_name?: string
          playlist_url?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dsp_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      press_results: {
        Row: {
          article_title: string
          campaign_id: string | null
          created_at: string
          date: string
          id: string
          link: string
          matched_inputs: number[] | null
          outlet: string
          vertical: string | null
          writer: string
        }
        Insert: {
          article_title: string
          campaign_id?: string | null
          created_at?: string
          date: string
          id?: string
          link: string
          matched_inputs?: number[] | null
          outlet: string
          vertical?: string | null
          writer: string
        }
        Update: {
          article_title?: string
          campaign_id?: string | null
          created_at?: string
          date?: string
          id?: string
          link?: string
          matched_inputs?: number[] | null
          outlet?: string
          vertical?: string | null
          writer?: string
        }
        Relationships: [
          {
            foreignKeyName: "press_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      radio_results: {
        Row: {
          airplay_link: string
          campaign_id: string | null
          country: string
          created_at: string
          dj: string
          id: string
          last_spin: string
          matched_inputs: number[] | null
          show: string
          station: string
          vertical: string | null
        }
        Insert: {
          airplay_link: string
          campaign_id?: string | null
          country: string
          created_at?: string
          dj: string
          id?: string
          last_spin: string
          matched_inputs?: number[] | null
          show: string
          station: string
          vertical?: string | null
        }
        Update: {
          airplay_link?: string
          campaign_id?: string | null
          country?: string
          created_at?: string
          dj?: string
          id?: string
          last_spin?: string
          matched_inputs?: number[] | null
          show?: string
          station?: string
          vertical?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radio_results_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_inputs: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          input_index: number
          input_type: string
          input_url: string
          normalized_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          input_index: number
          input_type: string
          input_url: string
          normalized_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          input_index?: number
          input_type?: string
          input_url?: string
          normalized_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_inputs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
